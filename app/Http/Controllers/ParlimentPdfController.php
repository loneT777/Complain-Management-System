<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Permission;
use Mpdf\Mpdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ParlimentPdfController extends Controller
{
    /**
     * Check if current user has a specific permission
     */
    private function hasPermission($permissionName)
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }

        $permission = Permission::where('name', $permissionName)->first();
        if (!$permission) {
            return false;
        }

        return DB::table('role_permissions')
            ->where('role_id', $user->role_id)
            ->where('permission_id', $permission->id)
            ->exists();
    }

    /**
     * Generate PDF for Parliament Member Application
     *
     * @param int $id Application ID
     * @return \Illuminate\Http\Response
     */
    public function generatePdf($id)
    {
        // Check if user has permission to print applications
        if (!$this->hasPermission('Application_print')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to print parliament applications.'
            ], 403);
        }

        try {
            // Fetch the application with employee, session, and designation relationships
            $application = Application::with([
                'employee',
                'session.user.designation' // CHANGED: Added designation relationship
            ])->findOrFail($id);

            // Verify this is a PM application (type 2)
            if ($application->application_type != '2') {
                return response()->json([
                    'success' => false,
                    'message' => 'This is not a Parliament Member application'
                ], 400);
            }

            // Format dates
            $departureDate = $application->departure_date
                ? date('Y-m-d', strtotime($application->departure_date))
                : '';
            $arrivalDate = $application->arrival_date
                ? date('Y-m-d', strtotime($application->arrival_date))
                : '';

            // Get employee name - modified to get name from parliament_members table
            $employeeName = 'N/A';

            try {
                Log::info('Application data for PDF', [
                    'id' => $application->id,
                    'application_type' => $application->application_type,
                    'employee_id' => $application->employee_id ?? null,
                    'parliament_member_id' => $application->parliament_member_id ?? null
                ]);

                if (!empty($application->parliament_member_id)) {
                    $parliamentMember = DB::table('parliament_members')
                        ->where('id', $application->parliament_member_id)
                        ->first();

                    if ($parliamentMember) {
                        Log::info('Found parliament member', [
                            'id' => $parliamentMember->id,
                            'name' => $parliamentMember->name ?? null
                        ]);

                        if (!empty($parliamentMember->name)) {
                            $employeeName = $parliamentMember->name;
                        } elseif (!empty($parliamentMember->title) && !empty($parliamentMember->name)) {
                            $employeeName = trim($parliamentMember->title . ' ' . $parliamentMember->name);
                        } elseif (!empty($parliamentMember->first_name) || !empty($parliamentMember->last_name)) {
                            $employeeName = trim($parliamentMember->first_name . ' ' . $parliamentMember->last_name);
                        }
                    }
                }

                if ($employeeName === 'N/A' && !empty($application->code)) {
                    $parliamentMember = DB::table('parliament_members')
                        ->where('code', $application->code)
                        ->first();

                    if ($parliamentMember && !empty($parliamentMember->name)) {
                        $employeeName = $parliamentMember->name;
                    }
                }

                if ($employeeName === 'N/A' && $application->employee) {
                    $employeeName = trim($application->employee->first_name . ' ' . $application->employee->last_name);
                }

                Log::info('Final employee name for PDF: ' . $employeeName);
            } catch (\Exception $e) {
                Log::warning('Error getting parliament member name: ' . $e->getMessage());
                $employeeName = $application->employee
                    ? trim($application->employee->first_name . ' ' . $application->employee->last_name)
                    : 'N/A';
            }

            // Get nature of travel
            $natureOfTravel = $application->nature_of_travel ?? '';

            // Get purpose of travel
            $purposeOfTravel = $application->purpose_of_travel ?? '';

            // Get countries visited
            $countriesVisited = $application->countries_visited ?? '';

            // ========================================
            // UPDATED: Retrieve creator's name and designation from designations table
            // ========================================
            $creatorName = '';
            $creatorDesignation = '';
            $createdDate = '';
            try {
                $createdDate = $application->created_at ? $application->created_at->format('Y.m.d') : date('Y.m.d');

                if ($application->session) {
                    Log::info('Session found', ['session_id' => $application->session->id]);
                    if ($application->session->user) {
                        Log::info('User found', ['user_id' => $application->session->user->id]);

                        // Get user's full name
                        $fullName = $application->session->user->full_name ?? '';
                        $creatorName = strlen($fullName) > 15 ? substr($fullName, 0, 12) . '...' : $fullName;

                        // CHANGED: Get designation from designations table
                        if ($application->session->user->designation) {
                            $creatorDesignation = $application->session->user->designation->name ?? '';
                        } else {
                            $creatorDesignation = 'N/A';
                        }

                        Log::info('Creator info set', [
                            'name' => $creatorName,
                            'designation' => $creatorDesignation
                        ]);
                    } else {
                        Log::warning('No user found for session');
                    }
                } else {
                    Log::warning('No session found for application', ['application_id' => $application->id]);
                }
            } catch (\Exception $e) {
                Log::warning('Error retrieving creator info: ' . $e->getMessage());
                $creatorName = '';
                $creatorDesignation = '';
            }

            // ========================================
            // UPDATED: Retrieve checker's information with designation from designations table
            // ========================================
            $checkerName = '';
            $checkerDesignation = '';
            $checkerDate = '';
            try {
                $checkerSession = DB::table('application_statuses')
                    ->join('login_sessions', 'application_statuses.session_id', '=', 'login_sessions.id')
                    ->join('users', 'login_sessions.user_id', '=', 'users.id')
                    ->leftJoin('designations', 'users.designation_id', '=', 'designations.id') // CHANGED: Join designations table
                    ->where('application_statuses.application_id', $application->id)
                    ->where('application_statuses.status_id', 2) // 2 = checked status
                    ->select(
                        'users.full_name',
                        'designations.name as designation', // CHANGED: Get designation from designations table
                        'application_statuses.created_date as checked_date'
                    )
                    ->first();

                if ($checkerSession) {
                    Log::info('Checker found', ['name' => $checkerSession->full_name]);
                    $fullName = $checkerSession->full_name ?? '';
                    $checkerName = strlen($fullName) > 15 ? substr($fullName, 0, 12) . '...' : $fullName;
                    $checkerDesignation = $checkerSession->designation ?? 'N/A'; // CHANGED: Now from designations table
                    $checkerDate = $checkerSession->checked_date ? date('Y.m.d', strtotime($checkerSession->checked_date)) : '';
                    Log::info('Checker info set', [
                        'name' => $checkerName,
                        'designation' => $checkerDesignation
                    ]);
                } else {
                    Log::warning('No checker status found for application', ['application_id' => $application->id]);
                }
            } catch (\Exception $e) {
                Log::warning('Error retrieving checker info: ' . $e->getMessage());
                $checkerName = '';
                $checkerDesignation = '';
            }

            // ========================================
            // UPDATED: Retrieve recommender's information with designation from designations table
            // CHANGED: Now fetches from status 3 OR 4 (Recommended or Not Recommended)
            // ========================================
            $recommenderName = '';
            $recommenderDesignation = '';
            $recommenderDate = '';
            try {
                $recommenderSession = DB::table('application_statuses')
                    ->join('login_sessions', 'application_statuses.session_id', '=', 'login_sessions.id')
                    ->join('users', 'login_sessions.user_id', '=', 'users.id')
                    ->leftJoin('designations', 'users.designation_id', '=', 'designations.id') // CHANGED: Join designations table
                    ->where('application_statuses.application_id', $application->id)
                    ->whereIn('application_statuses.status_id', [3, 4]) // 3 = Recommended, 4 = Not Recommended
                    ->orderBy('application_statuses.created_date', 'desc') // Get the latest
                    ->select(
                        'users.full_name',
                        'designations.name as designation', // CHANGED: Get designation from designations table
                        'application_statuses.created_date as recommended_date'
                    )
                    ->first();

                if ($recommenderSession) {
                    Log::info('Recommender found', ['name' => $recommenderSession->full_name]);
                    $fullName = $recommenderSession->full_name ?? '';
                    $recommenderName = strlen($fullName) > 15 ? substr($fullName, 0, 12) . '...' : $fullName;
                    $recommenderDesignation = $recommenderSession->designation ?? 'N/A'; // CHANGED: Now from designations table
                    $recommenderDate = $recommenderSession->recommended_date ? date('Y.m.d', strtotime($recommenderSession->recommended_date)) : '';
                    Log::info('Recommender info set', [
                        'name' => $recommenderName,
                        'designation' => $recommenderDesignation
                    ]);
                } else {
                    Log::warning('No recommender status found for application', ['application_id' => $application->id]);
                }
            } catch (\Exception $e) {
                Log::warning('Error retrieving recommender info: ' . $e->getMessage());
                $recommenderName = '';
                $recommenderDesignation = '';
            }

            // ========================================
            // NEW: Retrieve Recommended/Not Recommended status and remark
            // ========================================
            $latestStatusName = '';
            $latestStatusRemark = '';
            try {
                $latestStatus = DB::table('application_statuses')
                    ->join('statuses', 'application_statuses.status_id', '=', 'statuses.id')
                    ->where('application_statuses.application_id', $application->id)
                    ->whereIn('application_statuses.status_id', [3, 4]) // 3 = Recommended, 4 = Not Recommended
                    ->orderBy('application_statuses.created_date', 'desc')
                    ->select(
                        'statuses.name as status_name',
                        'application_statuses.status_id',
                        'application_statuses.remark'
                    )
                    ->first();

                if ($latestStatus) {
                    $latestStatusName = $latestStatus->status_name ?? '';
                    // Show remark only for Not Recommended (status_id = 4)
                    $latestStatusRemark = ($latestStatus->status_id == 4) ? ($latestStatus->remark ?? '') : '';
                    Log::info('Recommendation status retrieved', [
                        'status' => $latestStatusName,
                        'status_id' => $latestStatus->status_id,
                        'remark' => $latestStatusRemark
                    ]);
                }
            } catch (\Exception $e) {
                Log::warning('Error retrieving recommendation status: ' . $e->getMessage());
                $latestStatusName = '';
                $latestStatusRemark = '';
            }

            // ========================================
            // NEW: Retrieve Approved/Rejected status and remark
            // ========================================
            $approvalStatusName = '';
            $approvalStatusRemark = '';
            $approverName = '';
            $approverDesignation = '';
            $approvalStatusId = null;
            $approvalDate = '';
            try {
                $approvalStatus = DB::table('application_statuses')
                    ->join('statuses', 'application_statuses.status_id', '=', 'statuses.id')
                    ->join('login_sessions', 'application_statuses.session_id', '=', 'login_sessions.id')
                    ->join('users', 'login_sessions.user_id', '=', 'users.id')
                    ->leftJoin('designations', 'users.designation_id', '=', 'designations.id')
                    ->where('application_statuses.application_id', $application->id)
                    ->whereIn('application_statuses.status_id', [5, 6]) // 5 = Approved, 6 = Rejected
                    ->orderBy('application_statuses.created_date', 'desc')
                    ->select(
                        'statuses.name as status_name',
                        'application_statuses.status_id',
                        'application_statuses.remark',
                        'application_statuses.created_date',
                        'users.full_name',
                        'designations.name as designation'
                    )
                    ->first();

                if ($approvalStatus) {
                    $approvalStatusId = $approvalStatus->status_id;
                    $approvalStatusName = $approvalStatus->status_name ?? '';
                    // Show remark only for Rejected (status_id = 6)
                    $approvalStatusRemark = ($approvalStatus->status_id == 6) ? ($approvalStatus->remark ?? '') : '';
                    $approvalDate = $approvalStatus->created_date ? date('Y.m.d', strtotime($approvalStatus->created_date)) : '';
                    $fullName = $approvalStatus->full_name ?? '';
                    $approverName = strlen($fullName) > 15 ? substr($fullName, 0, 12) . '...' : $fullName;
                    $approverDesignation = $approvalStatus->designation ?? 'N/A';
                    Log::info('Approval status retrieved', [
                        'status' => $approvalStatusName,
                        'status_id' => $approvalStatus->status_id,
                        'remark' => $approvalStatusRemark,
                        'approver' => $approverName,
                        'date' => $approvalDate
                    ]);
                }
            } catch (\Exception $e) {
                Log::warning('Error retrieving approval status: ' . $e->getMessage());
            }

            // Prepare strikethrough text for approval decision
            $approveText = 'අනුමත කරමි';
            $rejectText = 'නොකරමි';
            if ($approvalStatusId == 5) {
                // Approved - strike through "නොකරමි"
                $rejectText = '<span style="text-decoration: line-through;">' . $rejectText . '</span>';
            } elseif ($approvalStatusId == 6) {
                // Rejected - strike through "අනුමත කරමි"
                $approveText = '<span style="text-decoration: line-through;">' . $approveText . '</span>';
            }

            // Use Iskoola Pota font for Sinhala text
            $fontName = 'iskoolapota';

            // Configure mPDF with font settings
            $mpdfConfig = [
                'mode' => 'utf-8',
                'format' => 'A4',
                'orientation' => 'P',
                'margin_left' => 15,
                'margin_right' => 15,
                'margin_top' => 10,
                'margin_bottom' => 5,
                'margin_header' => 10,
                'margin_footer' => 10,
                'default_font' => $fontName,
                'autoPageBreak' => false,
            ];

            // Add font configuration if Sinhala font is available
            if ($fontName === 'iskoolapota') {
                $mpdfConfig['fontDir'] = [base_path('vendor/mpdf/mpdf/ttfonts')];
                $mpdfConfig['fontdata'] = [
                    'iskoolapota' => [
                        'R' => 'Iskoola Pota Regular.ttf',
                        'useOTL' => 0x80,
                        'useKashida' => 75,
                    ]
                ];
            }

            // Create mPDF instance with configuration
            $mpdf = new Mpdf($mpdfConfig);

            // CHANGED: Pass designations to HTML generation
            $html = $this->generateHtmlContent(
                $employeeName,
                $natureOfTravel,
                $purposeOfTravel,
                $countriesVisited,
                $departureDate,
                $arrivalDate,
                $fontName,
                $creatorName,
                $creatorDesignation, // CHANGED: Added
                $createdDate,
                $checkerName,
                $checkerDesignation, // CHANGED: Added
                $checkerDate,
                $recommenderName,
                $recommenderDesignation, // CHANGED: Added
                $recommenderDate, // CHANGED: Added
                $latestStatusName, // NEW: Added
                $latestStatusRemark // NEW: Added
            );

            // Set document information
            $mpdf->SetCreator('Parliament Travel Form System');
            $mpdf->SetAuthor('Parliament Office');
            $mpdf->SetTitle('Parliament Member Travel Application');
            $mpdf->SetSubject('Parliament Member Travel Authorization');

            // Write HTML to PDF
            $mpdf->WriteHTML($html);

            // Generate safe filename
            $safeName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $employeeName);
            $filename = 'Parliament_Application_' . $safeName . '_' . date('Ymd') . '.pdf';

            // Output PDF
            $pdfContent = $mpdf->Output('', 'S');

            // Return PDF as downloadable response
            return Response::make($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('PM Application not found: ' . $id);
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('PDF Generation Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate HTML content for PDF
     * CHANGED: Added designation parameters
     *
     * @param string $name
     * @param string $natureOfTravel
     * @param string $purpose
     * @param string $countries
     * @param string $departureDate
     * @param string $arrivalDate
     * @param string $fontName
     * @param string $creatorName
     * @param string $creatorDesignation
     * @param string $createdDate
     * @param string $checkerName
     * @param string $checkerDesignation
     * @param string $checkerDate
     * @param string $recommenderName
     * @param string $recommenderDesignation
     * @param string $recommenderDate
     * @param string $latestStatusName
     * @param string $latestStatusRemark
     * @return string
     */
    private function generateHtmlContent(
        $name,
        $natureOfTravel,
        $purpose,
        $countries,
        $departureDate,
        $arrivalDate,
        $fontName,
        $creatorName,
        $creatorDesignation,
        $createdDate,
        $checkerName,
        $checkerDesignation,
        $checkerDate,
        $recommenderName,
        $recommenderDesignation,
        $recommenderDate,
        $latestStatusName,
        $latestStatusRemark
    ) {
        $currentDate = date('Y.m.d');

        return '
<!DOCTYPE html>
<html lang="si">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ගරු පාර්ලිමේන්තු මන්ත්‍රීවරයන් විසින් විශේෂ ගමන් සඳහා</title>
<style>
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: "' . $fontName . '", Arial, sans-serif;
background-color: #f5f5f5;
padding: 20px;
}

.container {
max-width: 900px;
margin: -1.5cm auto 0 auto;
background-color: white;
padding: 40px;
box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.header {
text-align: center;
margin-bottom: 10px;
padding-bottom: 20px;
padding-top: 10px;
}

.header h1 {
font-size: 16px;
margin-top: -1cm;
font-weight: normal;
text-decoration: underline;
}

.header h2 {
font-size: 16px;
margin-top: 10px;
font-weight: normal;
text-decoration: underline;
}

.header-text {
font-size: 16px;
margin-top: -0.2cm;
font-weight: normal;
font-family: "' . $fontName . '", Arial, sans-serif;
}

table {
width: 100%;
border-collapse: collapse;
margin-bottom: 10px;
}

td {
border: 1px solid #333;
padding: 12px;
vertical-align: top;
}

td:first-child {
width: 40%;
font-weight: bold;
}

.signature-section {
margin-top: 35px;
width: 100%;
border-collapse: collapse;
}

.signature-line {
border-bottom: 1px dotted #333;
margin-bottom: 5px;
height: 60px;
}

.signature-line-long {
border-bottom: 1px dotted #333;
margin-bottom: 5px;
height: 40px;
}

.signature-line-short {
border-bottom: 1px dotted #333;
margin-bottom: 5px;
height: 20px;
}

.signature-label {
font-size: 12px;
margin-bottom: 5px;
white-space: nowrap;
}

.signature-date {
font-size: 12px;
margin-top: 5px;
}

.note-section {
margin-top: 5px;
line-height: 1.8;
}

.note-section p {
margin-bottom: 15px;
}

.note-section strong {
font-size: 16px;
font-weight: normal;
text-decoration: none;
}

.officer-section {
margin-top: 20px;
}

.officer-line {
border-bottom: 1px dotted #333;
margin-bottom: 5px;
height: 40px;
}

.officer-title {
font-size: 14px;
margin-bottom: 10px;
}

.footer-signatures {
margin-top: 40px;
display: grid;
grid-template-columns: 1fr 1fr;
gap: 40px;
}

.footer-sig-box {
text-align: center;
}

@media print {
body {
background-color: white;
padding: 0;
}
.container {
box-shadow: none;
padding: 20px;
}
}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>ගරු පාර්ලිමේන්තු මන්ත්‍රීවරයන් විසින් විශේෂ ගමන් සඳහා</h1>
<h2>ගරු අග්‍රාමාත්‍යතුමියගේ අනුමැතිය ලබාගැනීම</h2>
</div>

<table>
<tr>
<td>01.</td>
<td colspan="2">නම: <span style="font-weight: normal;">' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</span></td>
</tr>
<tr>
<td>02.</td>
<td colspan="2">නිල/රාජකාරී හෝ පෞද්ගලික ගමනක් ද යන විග: <span style="font-weight: normal;">' . htmlspecialchars($natureOfTravel, ENT_QUOTES, 'UTF-8') . '</span></td>
</tr>
<tr>
<td>03.</td>
<td colspan="2">නිල/රාජකාරී ගමනක් නම් ගමනේ අරමුණු: - <span style="font-weight: normal;">' . nl2br(htmlspecialchars($purpose, ENT_QUOTES, 'UTF-8')) . '</span></td>
</tr>
<tr>
<td>04.</td>
<td>යාමට අදහස් කරන රට/රටවල්:</td>
<td><span style="font-weight: normal;">' . htmlspecialchars($countries, ENT_QUOTES, 'UTF-8') . '</span></td>
</tr>
<tr>
<td>05.</td>
<td>පිටත්වීමට යෝජිත දිනය:</td>
<td><span style="font-weight: normal;">' . htmlspecialchars($departureDate, ENT_QUOTES, 'UTF-8') . '</span></td>
</tr>
<tr>
<td>06.</td>
<td>ආපසු පැමිණීමට යෝජිත දිනය:</td>
<td><span style="font-weight: normal;">' . htmlspecialchars($arrivalDate, ENT_QUOTES, 'UTF-8') . '</span></td>
</tr>
</table>

<!-- Signature Section -->
<div class="signature-section">
    <table class="signature-table" style="border: none; width: 100%; border-collapse: collapse; margin-bottom: 8px; margin-top: 15px;">
        <tr>
            <td style="border: none; text-align: left; width: 33.33%; padding: 0 10px; vertical-align: top;">
                <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;"> සකස් කළේ:' . '</div>
                <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;"> ' . htmlspecialchars($creatorName) . ' (' . htmlspecialchars($creatorDesignation) .')'.'</div>
                <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">දිනය: ' . htmlspecialchars($createdDate) . '</div>
            </td>
            <td style="border: none; text-align: left; width: 33.33%; padding: 0 10px; vertical-align: top;">
                <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">පරීක්ෂා කළේ:' . '</div>
                <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;"> ' . htmlspecialchars($checkerName) . ' (' . htmlspecialchars($checkerDesignation) . ')' . '</div>
                <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">දිනය: ' . htmlspecialchars($checkerDate) . '</div>
            </td>
            <td style="border: none; text-align: left; width: 33.33%; padding: 0 10px; vertical-align: top;">
                <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;"> නිර්දේශයට ඉදිරිපත් කළේ:' . '</div>
                <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">'  . htmlspecialchars($recommenderName) . ' (' . htmlspecialchars($recommenderDesignation) . ')' . '</div>
                ' . (!empty($latestStatusName) ? '<div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4; font-weight: bold;">Status: ' . htmlspecialchars($latestStatusName) . '</div>' : '') . '
                ' . (!empty($latestStatusRemark) ? '<div style="margin-bottom: 4px; font-size: 10px; line-height: 1.3; color: #555;">Remark: ' . htmlspecialchars($latestStatusRemark) . '</div>' : '') . '
                <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">දිනය: ' . htmlspecialchars($recommenderDate) . '</div>
            </td>
        </tr>
    </table>
</div>

<div class="note-section">
<p><strong>අග්‍රාමාත්‍ය ලේකම්,</strong></p>
<p>ඉහත නම් සඳහන් ගරු පාර්ලිමේන්තු මන්ත්‍රීතුමා නිල/රාජකාරී හෝ පෞද්ගලික කටයුත්තක් සඳහා දිවයියෙන් බැහැර යාමේ ඉල්ලීම් ගරු අග්‍රාමාත්‍යතුමියගේ අනුමැතිය සඳහා ඉදිරිපත් කිරීම මැනවි.</p>

<div class="officer-section">
<div class="officer-line">' . htmlspecialchars($recommenderName) . '</div>
<div class="officer-title">අතිරේක ලේකම් (පාලන)</div>
</div>

<div class="note-section">
<p><strong>ගරු අග්‍රාමාත්‍යතුමියනි,</strong></p>
<p>දිවයියෙන් බැහැර යාම සඳහා ඉදිරිපත් කරන ලද ඉහත ඉල්ලීම් අනුමත කිරීම සඳහා කරුණාකාවෙන් ඉදිරිපත් කරමි.</p>
</div>

<table style="border: none; width: 100%; margin-top: 42px;">
<tr>
<td style="border: none; vertical-align: top;">
<div class="officer-line"></div>
<div class="officer-title">අග්‍රාමාත්‍ය ලේකම්</div>
</td>
<td style="border: none;"></td>
<td style="border: none; text-align: right; vertical-align: middle;">
<div class="signature-date">දිනය:</div>
</td>
</tr>
<tr>
<td style="border: none; vertical-align: top;">
<div class="officer-line" style="margin-top: 5px;"></div>
<div class="officer-title">' . $approveText . '/ ' . $rejectText . '.</div>
' . (!empty($approverName) ? '<div style="margin-top: 5px; font-size: 12px; line-height: 1.2;">' . htmlspecialchars($approverName) . ' (' . htmlspecialchars($approverDesignation) . ')</div>' : '') . '
' . (!empty($approvalStatusRemark) ? '<div style="margin-top: 2px; font-size: 9px; line-height: 1.1; color: #555;">Remark: ' . htmlspecialchars($approvalStatusRemark) . '</div>' : '') . '
</td>
<td style="border: none;"></td>
<td style="border: none; text-align: right; vertical-align: top;">
' . (!empty($approvalDate) ? '<div style="font-size: 12px;">දිනය: ' . htmlspecialchars($approvalDate) . '</div>' : '') . '
</td>
</tr>
</table>

<table style="border: none; width: 100%; margin-top: 25px;">
<tr>
<td style="border: none; vertical-align: top;">
<div class="officer-line"></div>
<div class="officer-title">අග්‍රාමාත්‍ය</div>
</td>
<td style="border: none;"></td>
<td style="border: none; text-align: right; vertical-align: middle;">
<div class="signature-date">දිනය:</div>
</td>
</tr>
</table>
</div>
</body>
</html>';
    }
}
