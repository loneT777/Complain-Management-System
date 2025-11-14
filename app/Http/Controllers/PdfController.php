<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PdfController extends Controller
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

    public function generateApplicationPdf($id)
    {
        // Check if user has permission to print applications
        if (!$this->hasPermission('Application_print')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to print applications.'
            ], 403);
        }

        try {
            // Fetch application with all relationships
            $application = Application::with([
                'employee',
                'organization',
                'department',
                'expenseTypes',
                'goslFunds.goslFundType',
                'travellingHistories',
                'session.user.designation' // Include designation relationship
            ])->find($id);

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found'
                ], 404);
            }

            // Create mPDF instance
            $pdf = new \Mpdf\Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'orientation' => 'P',
                'margin_left' => 10,
                'margin_right' => 10,
                'margin_top' => 10,
                'margin_bottom' => 5,
                'margin_header' => 5,
                'margin_footer' => 5,
                'default_font_size' => 11,
                'default_font' => 'dejavusans',
                'autoPageBreak' => false,
            ]);

            // Set document information
            $pdf->SetCreator('Travel Form System');
            $pdf->SetAuthor('Privilege Officer System');
            $pdf->SetTitle('Travel Form - PMO/FMT/ADM/1/2');
            $pdf->SetSubject('Government Travel Authorization Form');

            // Configure Sinhala font
            try {
                $sinhalaFontPath = base_path('vendor/mpdf/mpdf/ttfonts/Iskoola Pota Regular.ttf');

                if (file_exists($sinhalaFontPath)) {
                    $pdf->fontdata['iskoolapota'] = [
                        'R' => 'Iskoola Pota Regular.ttf',
                        'useOTL' => 0x80,
                        'useKashida' => 75,
                    ];
                    $pdf->available_unifonts[] = 'iskoolapota';
                    $fontName = 'iskoolapota';
                    Log::info('Sinhala font loaded successfully');
                } else {
                    $fontName = 'dejavusans';
                    Log::warning('Sinhala font file not found, using DejaVuSans fallback');
                }
            } catch (\Exception $e) {
                $fontName = 'dejavusans';
                Log::warning('Error loading Sinhala font: ' . $e->getMessage());
            }

            // Extract data from application
            $employeeName = $application->employee ?
                trim(($application->employee->first_name ?? '') . ' ' . ($application->employee->last_name ?? '')) : '';

            $position = '';
            if ($application->employee && $application->employee->designation) {
                $position = is_object($application->employee->designation) ?
                    ($application->employee->designation->name ?? '') : $application->employee->designation;
            }

            // ========================================
            // UPDATED: Handle ministry and department display
            // ========================================
            $ministry = '';
            $department = '';

            if ($application->organization) {
                if ($application->organization->parent_id) {
                    // Organization has a parent, so it's a department
                    $department = $application->organization->name ?? '';
                    
                    // Get the parent organization (ministry)
                    try {
                        $parentOrg = \App\Models\Organization::find($application->organization->parent_id);
                        $ministry = $parentOrg ? ($parentOrg->name ?? '') : '';
                    } catch (\Exception $e) {
                        Log::warning('Error fetching parent organization: ' . $e->getMessage());
                        $ministry = '';
                    }
                } else {
                    // Organization has no parent, so it's a ministry
                    $ministry = $application->organization->name ?? '';
                    $department = 'N/A';
                }
            }

            $arrangements = $application->coverup_duty ?? '';
            $travelType = $application->nature_of_travel ?? 'official';

            // Calculate date data
            $startDate = $application->commencement_date ? date('Y-m-d', strtotime($application->commencement_date)) : '';
            $endDate = $application->completion_date ? date('Y-m-d', strtotime($application->completion_date)) : '';
            $totalDays = '';
            if ($startDate && $endDate) {
                $start = new \DateTime($startDate);
                $end = new \DateTime($endDate);
                $totalDays = $start->diff($end)->days + 1;
            }

            // Departure date data
            $depYear = $depMonth = $depDay = '';
            if ($application->departure_date) {
                $depDate = new \DateTime($application->departure_date);
                $depYear = $depDate->format('Y');
                $depMonth = $depDate->format('m');
                $depDay = $depDate->format('d');
            }

            // Return date data
            $retYear = $retMonth = $retDay = '';
            if ($application->arrival_date) {
                $retDate = new \DateTime($application->arrival_date);
                $retYear = $retDate->format('Y');
                $retMonth = $retDate->format('m');
                $retDay = $retDate->format('d');
            }

            // Process expense types
            $fundingChecks = ['', '', '', '', ''];
            try {
                $expenseNames = [];
                if ($application->expenseTypes) {
                    $expenseTypes = $application->expenseTypes;
                    if (method_exists($expenseTypes, 'pluck')) {
                        $expenseNames = $expenseTypes->pluck('name')->toArray();
                    } elseif (is_array($expenseTypes)) {
                        $expenseNames = array_column($expenseTypes, 'name');
                    }
                }

                Log::info('Expense types for application ' . $application->id, ['expenseNames' => $expenseNames]);

                foreach ($expenseNames as $expenseName) {
                    if (!$expenseName) continue;
                    $name = strtolower($expenseName);
                    Log::info('Processing expense name: ' . $name);
                    if (strpos($name, 'external resources') !== false || strpos($name, 'dept') !== false || strpos($name, 'වී.සම්.දෙ.') !== false) {
                        $fundingChecks[0] = '&#10004;';
                        Log::info('Set funding check 0 (external resources/dept)');
                    } elseif (strpos($name, 'project') !== false || strpos($name, 'ව්‍යාපෘතියකින්') !== false) {
                        $fundingChecks[1] = '&#10004;';
                        Log::info('Set funding check 1 (project)');
                    } elseif (strpos($name, 'direct award') !== false || strpos($name, 'ඍජුව ලැබුණ ප්‍රදානයක්') !== false) {
                        $fundingChecks[2] = '&#10004;';
                        Log::info('Set funding check 2 (direct award)');
                    } elseif (strpos($name, 'private') !== false || strpos($name, 'own') !== false || strpos($name, 'තමාගේම මුදලින්') !== false) {
                        $fundingChecks[3] = '&#10004;';
                        Log::info('Set funding check 3 (private/own)');
                    } elseif (strpos($name, 'government') !== false || strpos($name, 's.l') !== false || strpos($name, 'ශ්‍රී ලංකා රජයෙන්') !== false) {
                        $fundingChecks[4] = '&#10004;';
                        Log::info('Set funding check 4 (government/s.l)');
                    }
                }

                Log::info('Final funding checks', ['fundingChecks' => $fundingChecks]);
            } catch (\Exception $e) {
                Log::warning('Error processing expense types: ' . $e->getMessage());
            }

            // Process GOSL funds
            $fundChecks = ['', '', '', '', ''];
            try {
                $goslFunds = $application->goslFunds ?? collect([]);
                Log::info('GOSL funds for application ' . $application->id, ['goslFunds' => $goslFunds->toArray()]);

                foreach ($goslFunds as $fund) {
                    if (!$fund || !$fund->goslFundType) continue;

                    $fundTypeName = strtolower($fund->goslFundType->name ?? '');
                    Log::info('Processing GOSL fund type: ' . $fundTypeName);

                    if (
                        strpos($fundTypeName, 'air') !== false ||
                        strpos($fundTypeName, 'travel') !== false ||
                        strpos($fundTypeName, 'flight') !== false ||
                        strpos($fundTypeName, 'ගුවන්') !== false
                    ) {
                        $fundChecks[0] = '&#10004;';
                        Log::info('Set fund check 0 (air/travel)');
                    } elseif (
                        strpos($fundTypeName, 'subsistence') !== false ||
                        strpos($fundTypeName, 'allowance') !== false ||
                        strpos($fundTypeName, 'දීමනා') !== false ||
                        strpos($fundTypeName, 'සංයුක්ත') !== false
                    ) {
                        $fundChecks[1] = '&#10004;';
                        Log::info('Set fund check 1 (subsistence)');
                    } elseif (
                        strpos($fundTypeName, 'course') !== false ||
                        strpos($fundTypeName, 'fees') !== false ||
                        strpos($fundTypeName, 'fee') !== false ||
                        strpos($fundTypeName, 'පාඨමාලා') !== false ||
                        strpos($fundTypeName, 'ගාස්තු') !== false
                    ) {
                        $fundChecks[2] = '&#10004;';
                        Log::info('Set fund check 2 (course fees)');
                    } elseif (
                        strpos($fundTypeName, 'additional') !== false ||
                        strpos($fundTypeName, 'incidental') !== false ||
                        strpos($fundTypeName, 'misc') !== false ||
                        strpos($fundTypeName, 'අනියම්') !== false
                    ) {
                        $fundChecks[3] = '&#10004;';
                        Log::info('Set fund check 3 (additional expenses)');
                    } elseif (
                        strpos($fundTypeName, 'other') !== false ||
                        strpos($fundTypeName, 'personal') !== false ||
                        strpos($fundTypeName, 'වෙනත්') !== false
                    ) {
                        $fundChecks[4] = '&#10004;';
                        Log::info('Set fund check 4 (other personal expenses)');
                    }
                }

                Log::info('Final fund checks', ['fundChecks' => $fundChecks]);
            } catch (\Exception $e) {
                Log::warning('Error processing GOSL funds: ' . $e->getMessage());
            }

            $currentDate = date('Y.m.d');
            $createdDate = '';
            try {
                $createdDate = $application->created_at ? $application->created_at->format('Y.m.d') : $currentDate;
            } catch (\Exception $e) {
                $createdDate = $currentDate;
            }

            // ========================================
            // UPDATED: Retrieve creator's name and designation from designations table
            // ========================================
            $creatorName = '';
            $creatorDesignation = '';
            try {
                if ($application->session) {
                    Log::info('Session found', ['session_id' => $application->session->id]);
                    if ($application->session->user) {
                        Log::info('User found', ['user_id' => $application->session->user->id]);
                        
                        // Get user's full name
                        $fullName = $application->session->user->full_name ?? '';
                        $creatorName = strlen($fullName) > 15 ? substr($fullName, 0, 12) . '...' : $fullName;
                        
                        // CHANGED: Get designation from designations table instead of role
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
                        'designations.name as designation', // CHANGED: Get from designations.name
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
                        'designations.name as designation', // CHANGED: Get from designations.name
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
                    ->select(
                        'statuses.name as status_name',
                        'application_statuses.status_id',
                        'application_statuses.remark'
                    )
                    ->orderBy('application_statuses.created_date', 'desc')
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

            // Create HTML content
            $html = '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Travel Form</title>
                <style>
                    body {
                        font-family: ' . $fontName . ', Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    
                    .form-header {
                        margin-bottom: 20px;
                        text-align: right;
                        padding-right: 0;
                    }
                    
                    .form-number {
                        border: 2px solid black;
                        padding: 8px 15px;
                        font-size: 12px;
                        letter-spacing: 0.5px;
                    }
                    
                    .title {
                        text-align: center;
                        font-size: 16px;
                        text-decoration: underline;
                        margin: 10px 0 25px 0;
                        line-height: 1.8;
                        color: black;
                    }
                    
                    .form-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                        font-size: 11px;
                        color: black;
                    }
                    
                    .form-table td {
                        border: 1px solid black;
                        padding: 6px 8px;
                        vertical-align: middle;
                        background: white;
                    }
                    
                    .row-number {
                        width: 35px;
                        text-align: center;
                        font-weight: bold;
                        font-family: Arial, sans-serif;
                        background: white;
                    }
                    
                    .description {
                        width: 180px;
                        background: white;
                    }
                    
                    .value {
                        background: white;
                        color: black;
                    }
                    
                    .sub-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    
                    .sub-table td {
                        border: 0.5px solid black;
                        padding: 2px 4px;
                        text-align: center;
                        font-size: 11px;
                        background: white;
                    }
                    
                    .checkmark-cell {
                        font-size: 18px;
                        font-weight: bold;
                        text-align: center;
                        vertical-align: middle;
                        font-family: DejaVuSans, Arial, sans-serif;
                        line-height: 1.2;
                    }
                    
                    .signature-section {
                        margin-top: 35px;
                        font-size: 12px;
                        color: black;  
                    }
                    
                    .signature-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 8px;
                    }
                    
                    .signature-table td {
                        border: none;
                        padding: 0 10px;
                        text-align: center;
                        vertical-align: top;
                        width: 33.33%;
                    }
                    
                    .dotted-line {
                        border-bottom: 1px dotted black;
                        height: 20px;
                        margin-bottom: 5px;
                        width: 100%;
                    }
                    
                    .secretary-section {
                        text-align: left;
                        margin: 15px 0 15px 35px;
                        color: black;
                    }
                    
                    .secretary-title {
                        font-size: 14px;
                        margin-bottom: 15px;
                    }
                </style>
            </head>
            <body>
            <!-- Header -->
            <div style="text-align: right; margin-bottom: 20px;">
                <span style="border: 2px solid black; padding: 8px 15px; font-weight: bold; font-family: Arial, sans-serif; background: white; display: inline-block; font-size: 12px;">PMO/FMT/ADM/1/2</span>
            </div>
                
                <!-- Title -->
                <div class="title">
                    රාජකාරි / පෞද්ගලික විදේශ ගමන් යාම සඳහා ගරු අග්‍රාමාත්‍යතුමියගේ අවසරය ලබා ගැනීම
                </div>
                        
                        <!-- Main Table -->
                        <table class="form-table">
                            <tr>
                                <td class="row-number">01</td>
                                <td class="description">නිලධාරියාගේ නම</td>
                                <td class="value">' . htmlspecialchars($employeeName) . '</td>
                            </tr>
                            <tr>
                                <td class="row-number">02</td>
                                <td class="description">තනතුර</td>
                                <td class="value">' . htmlspecialchars($position) . '</td>
                            </tr>
                            <tr>
                                <td class="row-number">03</td>
                                <td class="description">ආයතනය</td>
                                <td class="value">' . htmlspecialchars($ministry) . '</td>
                            </tr>
                            <tr>
                                <td class="row-number">04</td>
                                <td class="description">අදළ අමාත්‍යාංශය</td>
                                <td class="value">' . htmlspecialchars($department) . '</td>
                            </tr>
                            <tr>
                                <td class="row-number" style="height: 40px;">05</td>
                                <td class="description" style="height: 40px;">රාජකාරී ආවරණයට / වැඩ<br>බැලීමට යොදා ඇති වැඩ<br>පිළිවෙළ</td>
                                <td class="value" style="height: 40px;">' . htmlspecialchars($arrangements) . '</td>
                            </tr>
                            <tr>
                                <td class="row-number" style="height: 40px;">06</td>
                                <td class="description" style="height: 40px;">නිල/ රාජකාරි හෝ පෞද්ගලික<br>ගමනක්ද යන වග</td>
                                <td class="value" style="height: 40px;">' . ucfirst($travelType) . '</td>
                            </tr>
                            
                            <tr>
                                <td rowspan="2" class="row-number" style="height: 60px; vertical-align: middle;">07</td>
                                <td style="display: flex; align-items: center;">
                                    <div style="width: 20px; text-align: center; font-weight: bold; font-size: 11px; border-right: 1px solid black; height: 30px; display: flex; align-items: center; justify-content: center;">i</div>
                                    <div style="flex: 1; padding: 4px 8px; font-size: 11px;">නිල/ රාජකාරි ගමනක් නම් ගමනේ අරමුණ</div>
                                </td>
                                <td class="value" style="padding: 8px;">' . htmlspecialchars($application->purpose_of_travel ?? '') . '</td>
                            </tr>
                            <tr>
                                <td style="display: flex; align-items: center;">
                                    <div style="width: 20px; text-align: center; font-weight: bold; font-size: 11px; border-right: 1px solid black; height: 30px; display: flex; align-items: center; justify-content: center;">ii</div>
                                    <div style="flex: 1; padding: 4px 8px; font-size: 11px;">පාඨමාලාව/ පුහුණුව/ සම්මන්ත්‍රණය ආරම්භක දිනය හා අවසාන වන දිනය</div>
                                </td>
                                <td style="padding: 0;">
                                    <table class="sub-table">
                                        <tr>
                                            <td style="width: 33%; font-size: 11px;">ආරම්භක දිනය</td>
                                            <td style="width: 33%; font-size: 11px;">අවසාන වන දිනය</td>
                                            <td style="width: 34%; font-size: 11px;">මුළු දින ගණන</td>
                                        </tr>
                                        <tr>
                                            <td style="height: 35px; font-size: 11px;">' . $startDate . '</td>
                                            <td style="height: 35px; font-size: 11px;">' . $endDate . '</td>
                                            <td style="height: 35px; font-size: 11px;">' . $totalDays . '</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr>
                                <td class="row-number">08</td>
                                <td class="description">ගමනට අදාළ කරන රට/ රටවල්</td>
                                <td class="value">' . htmlspecialchars($application->countries_visited ?? '') . '</td>
                            </tr>
                            
                            <tr>
                                <td class="row-number" style="height: 48px;">09</td>
                                <td class="description" style="height: 48px;font-size: 11px;">පිටත්වීමට යෝජිත දිනය</td>
                                <td style="padding: 0;">
                                    <table class="sub-table">
                                        <tr>
                                            <td style="font-size: 11px;">වර්ෂය</td>
                                            <td style="font-size: 11px;">මාසය</td>
                                            <td style="font-size: 11px;">දිනය</td>
                                        </tr>
                                        <tr>
                                            <td style="height: 30px;">' . $depYear . '</td>
                                            <td style="height: 30px;">' . $depMonth . '</td>
                                            <td style="height: 30px;">' . $depDay . '</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr>
                                <td class="row-number" style="height: 48px;">10</td>
                                <td class="description" style="height: 48px;">ආපසු පැමිණීමට යෝජිත දිනය</td>
                                <td style="padding: 0;">
                                    <table class="sub-table">
                                        <tr>
                                            <td style="font-size: 11px;">වර්ෂය</td>
                                            <td style="font-size: 11px;">මාසය</td>
                                            <td style="font-size: 11px;">දිනය</td>
                                        </tr>
                                        <tr>
                                            <td style="height: 30px;">' . $retYear . '</td>
                                            <td style="height: 30px;">' . $retMonth . '</td>
                                            <td style="height: 30px;">' . $retDay . '</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr>
                                <td class="row-number" style="height: 48px;">11</td>
                                <td class="description" style="height: 48px; font-size: 11px;">ප්‍රධාන වශයෙන්<br>වියදම් දරන්නේ<br>කෙසේද</td>
                                <td style="padding: 0;">
                                    <table class="sub-table">
                                        <tr>
                                            <td style="font-size: 11px; width: 20%;">වී.සම්.දෙ.<br>මගින්</td>
                                            <td style="font-size: 11px; ">ව්‍යාපෘතියකින්</td>
                                            <td style="font-size: 12px;">ඍජුව ලැබුණ<br>ප්‍රදානයක්</td>
                                            <td style="font-size: 12px;">තමාගේම<br>මුදලින්</td>
                                            <td style="font-size: 12px;">ශ්‍රී ලංකා<br>රජයෙන්</td>
                                        </tr>
                                        <tr>
                                            <td class="checkmark-cell" style="height: 30px;">' . $fundingChecks[0] . '</td>
                                            <td class="checkmark-cell" style="height: 30px;">' . $fundingChecks[1] . '</td>
                                            <td class="checkmark-cell" style="height: 30px; width: 20%;">' . $fundingChecks[2] . '</td>
                                            <td class="checkmark-cell" style="height: 30px; width: 20%;">' . $fundingChecks[3] . '</td>
                                            <td class="checkmark-cell" style="height: 30px; width: 20%;">' . $fundingChecks[4] . '</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr>
                                <td class="row-number" style="height: 48px;">12</td>
                                <td class="description" style="height: 48px; font-size: 11px;">ශ්‍රී ලංකා රජයෙන්<br>මුදලක් වැය වන්නේ<br>නම් මුදල සහ කාරණය<br>(ශ්‍රී ලංකා රුපියල්)</td>
                                <td style="padding: 0;">
                                    <table class="sub-table">
                                        <tr>
                                            <td style="font-size: 11px; width: 20%;">ගුවන් ගමන්</td>
                                            <td style="font-size: 11px;">සංයුක්ත දීමනා</td>
                                            <td style="font-size: 11px;">පාඨමාලා ගාස්තු</td>
                                            <td style="font-size: 11px;">අනියම් දිමනා</td>
                                            <td style="font-size: 11px;">වෙනත්</td>
                                        </tr>
                                        <tr>
                                            <td class="checkmark-cell" style="height: 46px;">' . $fundChecks[0] . '</td>
                                            <td class="checkmark-cell" style="height: 35px;">' . $fundChecks[1] . '</td>
                                            <td class="checkmark-cell" style="height: 35px; width: 20%;">' . $fundChecks[2] . '</td>
                                            <td class="checkmark-cell" style="height: 35px; width: 20%;">' . $fundChecks[3] . '</td>
                                            <td class="checkmark-cell" style="height: 35px; width: 20%;">' . $fundChecks[4] . '</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr>
                                <td class="row-number">13</td>
                                <td style="padding: 8px; font-size: 11px;">මෙම නාම යෝජනාව සඳහා අමාත්‍යතුමියගේ එකඟතාව ලැබී ඇති බව අමාත්‍යාංශ ලේකම් විසින් දන්වා ඇත.</td>
                                <td style="text-align: center; font-size: 18px; font-weight: bold;">&#10004;</td>
                            </tr>
                        </table>
                        
                        <!-- Signature Section -->
                        <div class="signature-section">
                            <table class="signature-table">
                                <tr>
                                    <td style="text-align: left;">
                                        <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;"> සකස් කළේ:' . '</div>
                                        <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">' . htmlspecialchars($creatorName) . ' (' . htmlspecialchars($creatorDesignation) .')'.'</div>
                                        <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">දිනය: ' . htmlspecialchars($createdDate) . '</div>
                                    </td>
                                    <td style="text-align: left;">
                                        <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;"> පරීක්ෂා කළේ:' . '</div>
                                        <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">' . htmlspecialchars($checkerName) . ' (' . htmlspecialchars($checkerDesignation) . ')' . '</div>
                                        <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">දිනය: ' . htmlspecialchars($checkerDate) . '</div>
                                    </td>
                                    <td style="text-align: left;">
                                        <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;"> නිර්දේශයට ඉදිරිපත් කළේ:' . '</div>
                                        <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">' . htmlspecialchars($recommenderName) . ' (' . htmlspecialchars($recommenderDesignation) . ')' . '</div>
                                        ' . (!empty($latestStatusName) ? '<div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4; font-weight: bold;">Status: ' . htmlspecialchars($latestStatusName) . '</div>' : '') . '
                                        ' . (!empty($latestStatusRemark) ? '<div style="margin-bottom: 4px; font-size: 10px; line-height: 1.3; color: #555;">Remark: ' . htmlspecialchars($latestStatusRemark) . '</div>' : '') . '
                                        <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">දිනය: ' . htmlspecialchars($recommenderDate) . '</div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <!-- Secretary Section -->
                        <div class="secretary-section">
                            <div class="secretary-title">අග්‍රාමාත්‍ය ලේකම්</div>
                            <div>ඉහත නම සඳහන් නිලධාරියා/ නිළධාරිනිය අංක 08 හි සඳහන් විදේශ ගමන යාම සඳහා ඉදිරිපත් කරන</div>
                            <div>ඉල්ලීම නිර්දේශ කර පූර්ව අවසරය සඳහා කාරුණිකව ඉදිරිපත් කරමි.</div>
                        </div>
                        
                        <!-- Final Signatures -->
                        <table class="final-signatures" style="width: 75%; border-collapse: collapse; margin-top: 20px; margin-left: -35px;">
                            <tr>
                                <td style="width: 50%; text-align: center; border: none; padding: 0;">
                                    <div style="margin-bottom: 4px;"></div>
                                    <div class="dotted-line"></div>
                                    <div>අතිරේක ලේකම් (පාලන)</div>
                                    <div>' . $approveText . '/ ' . $rejectText . '.</div>
                                    ' . (!empty($approverName) ? '<div style="margin-top: 5px; font-size: 12px; line-height: 1.2;">' . htmlspecialchars($approverName) . ' (' . htmlspecialchars($approverDesignation) . ')</div>' : '') . '
                                    ' . (!empty($approvalStatusRemark) ? '<div style="margin-top: 2px; font-size: 9px; line-height: 1.1; color: #555;">Remark: ' . htmlspecialchars($approvalStatusRemark) . '</div>' : '') . '
                                </td>
                                <td style="width: 50%; text-align: right; border: none; padding-right: 15px; vertical-align: top;">
                                    <div class="dotted-line"></div>
                                    ' . (!empty($approvalDate) ? '<div style="font-size: 12px;">දිනය: ' . htmlspecialchars($approvalDate) . '</div>' : '<div style="font-size: 12px;">දිනය</div>') . '
                                </td>
                            </tr>
                        </table>

                        <table class="final-signatures" style="width: 75%; border-collapse: collapse; margin-top: 25px; margin-left: -55px;">
                            <tr>
                                <td style="width: 50%; text-align: center; border: none; padding: 0; vertical-align: middle;">
                                    <div class="dotted-line"></div>
                                    <div>අග්‍රාමාත්‍ය ලේකම්</div>
                                </td>
                                <td style="width: 50%; text-align: right; border: none; padding-right: 20px; vertical-align: middle;">
                                    <div class="dotted-line"></div>
                                    <div style="font-size: 12px;">දිනය</div>
                                </td>
                            </tr>
                        </table>
            </body>
            </html>';

            // Write HTML to PDF
            $pdf->WriteHTML($html);

            // Clear output buffers
            while (ob_get_level() > 0) {
                ob_end_clean();
            }

            // Generate PDF content
            $pdfContent = $pdf->Output('', 'S');

            // Return PDF response
            return Response::make($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="application_' . $application->id . '.pdf"',
                'Cache-Control' => 'private, max-age=0, must-revalidate',
                'Pragma' => 'public'
            ]);
        } catch (\Exception $e) {
            Log::error('PDF Generation Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Error generating PDF: ' . $e->getMessage()
            ], 500);
        }
    }
}
