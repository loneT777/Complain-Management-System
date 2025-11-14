<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\ParliamentMember;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{ 
    public function getStats()
    { //written after 2025-10-14
        try {
            // Get application stats
            $poApplications = Application::where('application_type', 1);
            $pmApplications = Application::where('application_type', 2);

            $totalApplications = Application::count();
            
            // PO Applications status counts
            $poPendingCount = 0;
            $poApprovedCount = 0;
            $poRejectedCount = 0;
            $poRecommendedCount = 0;
            $poNotRecommendedCount = 0;
            $poCheckedCount = 0;
            $poRequiredResubmitCount = 0;
            $poResubmitPendingCount = 0;
            
            // PM Applications status counts
            $pmPendingCount = 0;
            $pmApprovedCount = 0;
            $pmRejectedCount = 0;
            $pmRecommendedCount = 0;
            $pmNotRecommendedCount = 0;
            $pmCheckedCount = 0;
            $pmRequiredResubmitCount = 0;
            $pmResubmitPendingCount = 0;

            // Try to get status counts if the relationship exists
            try {
                // PO Application status counts - Get latest status using application_status_id
                $poPendingCount = Application::where('application_type', 1)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'pending')
                                  ->orWhereRaw('LOWER(name) = "pending"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $poApprovedCount = Application::where('application_type', 1)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'approved')
                                  ->orWhereRaw('LOWER(name) = "approved"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $poRejectedCount = Application::where('application_type', 1)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'rejected')
                                  ->orWhereRaw('LOWER(name) = "rejected"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $poRecommendedCount = Application::where('application_type', 1)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'recommended')
                                  ->orWhereRaw('LOWER(name) = "recommended"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $poNotRecommendedCount = Application::where('application_type', 1)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'not_recommended')
                                  ->orWhereRaw('LOWER(name) = "not recommended"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $poCheckedCount = Application::where('application_type', 1)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'checked')
                                  ->orWhereRaw('LOWER(name) = "checked"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $poRequiredResubmitCount = Application::where('application_type', 1)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'required_resubmit')
                                  ->orWhereRaw('LOWER(name) = "resubmit required"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $poResubmitPendingCount = Application::where('application_type', 1)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'resubmit_pending')
                                  ->orWhereRaw('LOWER(name) = "resubmit pending"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                
                // PM Application status counts - Get latest status using application_status_id
                $pmPendingCount = Application::where('application_type', 2)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'pending')
                                  ->orWhereRaw('LOWER(name) = "pending"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $pmApprovedCount = Application::where('application_type', 2)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'approved')
                                  ->orWhereRaw('LOWER(name) = "approved"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $pmRejectedCount = Application::where('application_type', 2)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'rejected')
                                  ->orWhereRaw('LOWER(name) = "rejected"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $pmRecommendedCount = Application::where('application_type', 2)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'recommended')
                                  ->orWhereRaw('LOWER(name) = "recommended"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $pmNotRecommendedCount = Application::where('application_type', 2)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'not_recommended')
                                  ->orWhereRaw('LOWER(name) = "not recommended"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $pmCheckedCount = Application::where('application_type', 2)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'checked')
                                  ->orWhereRaw('LOWER(name) = "checked"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $pmRequiredResubmitCount = Application::where('application_type', 2)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'required_resubmit')
                                  ->orWhereRaw('LOWER(name) = "resubmit required"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
                    
                $pmResubmitPendingCount = Application::where('application_type', 2)
                    ->whereHas('statuses', function($q) {
                        $q->where(function($query) {
                            $query->where('code', 'resubmit_pending')
                                  ->orWhereRaw('LOWER(name) = "resubmit pending"');
                        })
                        ->whereRaw('application_statuses.id = (
                            SELECT id 
                            FROM application_statuses 
                            WHERE application_statuses.application_id = applications.id
                            ORDER BY id DESC
                            LIMIT 1
                        )');
                    })->count();
            } catch (\Exception $e) {
                // If statuses relationship doesn't exist, use default values
                $poPendingCount = $poApplications->count();
                $pmPendingCount = $pmApplications->count();
            }

            return response()->json([
                'employee_details' => [
                    'public_officers' => [
                        'title' => 'Public Officers',
                        'value' => Employee::count(),
                        'icon' => 'group'
                    ],
                    'parliament_members' => [
                        'title' => 'Parliament Members',
                        'value' => ParliamentMember::count(),
                        'icon' => 'account_balance'
                    ],
                    'total_members' => [
                        'title' => 'Total Members',
                        'value' => Employee::count() + ParliamentMember::count(),
                        'icon' => 'people'
                    ],
                    'po_total_applications' => [
                        'title' => 'PO Total Applications',
                        'value' => $poApplications->count(),
                        'icon' => 'description'
                    ],
                    'pm_total_applications' => [
                        'title' => 'PM Total Applications',
                        'value' => $pmApplications->count(),
                        'icon' => 'description'
                    ],
                    'all_total_applications' => [
                        'title' => 'All Total Applications',
                        'value' => $totalApplications,
                        'icon' => 'description'
                    ]
                ],
                'po_application_details' => [
                    'approved_applications' => [
                        'title' => 'Approved',
                        'value' => $poApprovedCount,
                        'icon' => 'check_circle'
                    ],
                    'rejected_applications' => [
                        'title' => 'Rejected',
                        'value' => $poRejectedCount,
                        'icon' => 'cancel'
                    ],
                    'recommended_applications' => [
                        'title' => 'Recommended',
                        'value' => $poRecommendedCount,
                        'icon' => 'thumb_up'
                    ],
                    'not_recommended_applications' => [
                        'title' => 'Not Recommended',
                        'value' => $poNotRecommendedCount,
                        'icon' => 'thumb_down'
                    ],
                    'pending_applications' => [
                        'title' => 'Pending',
                        'value' => $poPendingCount,
                        'icon' => 'pending_actions'
                    ],
                    'checked_applications' => [
                        'title' => 'Checked',
                        'value' => $poCheckedCount,
                        'icon' => 'fact_check'
                    ],
                    'required_resubmit_applications' => [
                        'title' => 'Resubmit Required',
                        'value' => $poRequiredResubmitCount,
                        'icon' => 'undo'
                    ],
                    'resubmit_pending_applications' => [
                        'title' => 'Resubmit Pending',
                        'value' => $poResubmitPendingCount,
                        'icon' => 'update'
                    ]
                ],
                'pm_application_details' => [
                    'approved_applications' => [
                        'title' => 'Approved',
                        'value' => $pmApprovedCount,
                        'icon' => 'check_circle'
                    ],
                    'rejected_applications' => [
                        'title' => 'Rejected',
                        'value' => $pmRejectedCount,
                        'icon' => 'cancel'
                    ],
                    'recommended_applications' => [
                        'title' => 'Recommended',
                        'value' => $pmRecommendedCount,
                        'icon' => 'thumb_up'
                    ],
                    'not_recommended_applications' => [
                        'title' => 'Not Recommended',
                        'value' => $pmNotRecommendedCount,
                        'icon' => 'thumb_down'
                    ],
                    'pending_applications' => [
                        'title' => 'Pending',
                        'value' => $pmPendingCount,
                        'icon' => 'pending_actions'
                    ],
                    'checked_applications' => [
                        'title' => 'Checked',
                        'value' => $pmCheckedCount,
                        'icon' => 'fact_check'
                    ],
                    'required_resubmit_applications' => [
                        'title' => 'Resubmit Required',
                        'value' => $pmRequiredResubmitCount,
                        'icon' => 'undo'
                    ],
                    'resubmit_pending_applications' => [
                        'title' => 'Resubmit Pending',
                        'value' => $pmResubmitPendingCount,
                        'icon' => 'update'
                    ]
                ],
                'application_details' => [
                    'approved_applications' => [
                        'title' => 'Approved',
                        'value' => $poApprovedCount + $pmApprovedCount,
                        'icon' => 'check_circle'
                    ],
                    'rejected_applications' => [
                        'title' => 'Rejected',
                        'value' => $poRejectedCount + $pmRejectedCount,
                        'icon' => 'cancel'
                    ],
                    'recommended_applications' => [
                        'title' => 'Recommended',
                        'value' => $poRecommendedCount + $pmRecommendedCount,
                        'icon' => 'thumb_up'
                    ],
                    'not_recommended_applications' => [
                        'title' => 'Not Recommended',
                        'value' => $poNotRecommendedCount + $pmNotRecommendedCount,
                        'icon' => 'thumb_down'
                    ],
                    'pending_applications' => [
                        'title' => 'Pending',
                        'value' => $poPendingCount + $pmPendingCount,
                        'icon' => 'pending_actions'
                    ],
                    'total_applications' => [
                        'title' => 'Total Applications',
                        'value' => $totalApplications,
                        'icon' => 'description'
                    ],    
                ],
                'applications' => [
                    'po' => [
                        'total' => $poApplications->count(),
                        'pending' => 0,
                        'approved' => 0,
                        'rejected' => 0,
                    ],
                    'pm' => [
                        'total' => $pmApplications->count(),
                        'pending' => 0,
                        'approved' => 0,
                        'rejected' => 0,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch dashboard stats',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

//     public function getStatsOld()
//     { //written before 2025-10-12
//         try {
//             $currentYear = date('Y');
//             $currentMonth = date('m');

//             // Get monthly stats for current year
//             $monthlyStats = Application::select(
//                 DB::raw('MONTH(created_at) as month'),
//                 DB::raw('COUNT(*) as total'),
//                 'application_type'
//             )
//             ->whereYear('created_at', $currentYear)
//             ->groupBy('month', 'application_type')
//             ->get();

//             // Get application stats
//             $poApplications = Application::where('application_type', 1);
//             $pmApplications = Application::where('application_type', 2);

//             $totalApplications = Application::count();
            
//             // PO Applications status counts
//             $poPendingCount = 0;
//             $poApprovedCount = 0;
//             $poRejectedCount = 0;
//             $poRecommendedCount = 0;
//             $poNotRecommendedCount = 0;
//             $poCheckedCount = 0;
            
//             // PM Applications status counts
//             $pmPendingCount = 0;
//             $pmApprovedCount = 0;
//             $pmRejectedCount = 0;
//             $pmRecommendedCount = 0;
//             $pmNotRecommendedCount = 0;
//             $pmCheckedCount = 0;

//             // Try to get status counts if the relationship exists
//             try {
//                 // PO Application status counts - Get latest status for each application
//                 $poPendingCount = Application::where('application_type', 1)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'pending')
//                           ->orWhereRaw('LOWER(name) = "pending"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                    
//                 $poApprovedCount = Application::where('application_type', 1)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'approved')
//                           ->orWhereRaw('LOWER(name) = "approved"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                    
//                 $poRejectedCount = Application::where('application_type', 1)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'rejected')
//                           ->orWhereRaw('LOWER(name) = "rejected"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                    
//                 $poRecommendedCount = Application::where('application_type', 1)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'recommended')
//                           ->orWhereRaw('LOWER(name) = "recommended"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                    
//                 $poNotRecommendedCount = Application::where('application_type', 1)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'not_recommended')
//                           ->orWhereRaw('LOWER(name) = "not recommended"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                    
//                 $poCheckedCount = Application::where('application_type', 1)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'checked')
//                           ->orWhereRaw('LOWER(name) = "checked"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                
//                 // PM Application status counts - Get latest status for each application
//                 $pmPendingCount = Application::where('application_type', 2)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'pending')
//                           ->orWhereRaw('LOWER(name) = "pending"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                    
//                 $pmApprovedCount = Application::where('application_type', 2)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'approved')
//                           ->orWhereRaw('LOWER(name) = "approved"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                    
//                 $pmRejectedCount = Application::where('application_type', 2)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'rejected')
//                           ->orWhereRaw('LOWER(name) = "rejected"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                    
//                 $pmRecommendedCount = Application::where('application_type', 2)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'recommended')
//                           ->orWhereRaw('LOWER(name) = "recommended"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                    
//                 $pmNotRecommendedCount = Application::where('application_type', 2)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'not_recommended')
//                           ->orWhereRaw('LOWER(name) = "not recommended"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
                    
//                 $pmCheckedCount = Application::where('application_type', 2)
//                     ->whereHas('statuses', function($q) {
//                         $q->where('code', 'checked')
//                           ->orWhereRaw('LOWER(name) = "checked"')
//                           ->whereRaw('application_statuses.created_date = (
//                               SELECT MAX(created_date) 
//                               FROM application_statuses 
//                               WHERE application_statuses.application_id = applications.id
//                           )');
//                     })->count();
//             } catch (\Exception $e) {
//                 // If statuses relationship doesn't exist, use default values
//                 $poPendingCount = $poApplications->count();
//                 $pmPendingCount = $pmApplications->count();
//             }

//             // Check if employees table has created_at column
//             $employeesThisMonth = 0;
//             try {
//                 $employeesThisMonth = Employee::whereMonth('created_at', $currentMonth)->count();
//             } catch (\Exception $e) {
//                 // If created_at column doesn't exist, skip this count
//                 $employeesThisMonth = 0;
//             }

//             return response()->json([
//                 'employee_details' => [
//                     'public_officers' => [
//                         'title' => 'Public Officers',
//                         'value' => Employee::count(),
//                         'icon' => 'group'
//                     ],
//                     'parliament_members' => [
//                         'title' => 'Parliament Members',
//                         'value' => ParliamentMember::count(),
//                         'icon' => 'account_balance'
//                     ],
//                     'total_members' => [
//                         'title' => 'Total Members',
//                         'value' => Employee::count() + ParliamentMember::count(),
//                         'icon' => 'people'
//                     ],
//                     'po_total_applications' => [
//                         'title' => 'PO Total Applications',
//                         'value' => $poApplications->count(),
//                         'icon' => 'description'
//                     ],
//                     'pm_total_applications' => [
//                         'title' => 'PM Total Applications',
//                         'value' => $pmApplications->count(),
//                         'icon' => 'description'
//                     ],
//                     'all_total_applications' => [
//                         'title' => 'All Total Applications',
//                         'value' => $totalApplications,
//                         'icon' => 'description'
//                     ]
//                 ],
//                 'po_application_details' => [
//                     'approved_applications' => [
//                         'title' => 'Approved',
//                         'value' => $poApprovedCount,
//                         'icon' => 'check_circle'
//                     ],
//                     'rejected_applications' => [
//                         'title' => 'Rejected',
//                         'value' => $poRejectedCount,
//                         'icon' => 'cancel'
//                     ],
//                     'recommended_applications' => [
//                         'title' => 'Recommended',
//                         'value' => $poRecommendedCount,
//                         'icon' => 'thumb_up'
//                     ],
//                     'not_recommended_applications' => [
//                         'title' => 'Not Recommended',
//                         'value' => $poNotRecommendedCount,
//                         'icon' => 'thumb_down'
//                     ],
//                     'pending_applications' => [
//                         'title' => 'Pending',
//                         'value' => $poPendingCount,
//                         'icon' => 'pending_actions'
//                     ],
//                     'checked_applications' => [
//                         'title' => 'Checked',
//                         'value' => $poCheckedCount,
//                         'icon' => 'fact_check'
//                     ]
//                 ],
//                 'pm_application_details' => [
//                     'approved_applications' => [
//                         'title' => 'Approved',
//                         'value' => $pmApprovedCount,
//                         'icon' => 'check_circle'
//                     ],
//                     'rejected_applications' => [
//                         'title' => 'Rejected',
//                         'value' => $pmRejectedCount,
//                         'icon' => 'cancel'
//                     ],
//                     'recommended_applications' => [
//                         'title' => 'Recommended',
//                         'value' => $pmRecommendedCount,
//                         'icon' => 'thumb_up'
//                     ],
//                     'not_recommended_applications' => [
//                         'title' => 'Not Recommended',
//                         'value' => $pmNotRecommendedCount,
//                         'icon' => 'thumb_down'
//                     ],
//                     'pending_applications' => [
//                         'title' => 'Pending',
//                         'value' => $pmPendingCount,
//                         'icon' => 'pending_actions'
//                     ],
//                     'checked_applications' => [
//                         'title' => 'Checked',
//                         'value' => $pmCheckedCount,
//                         'icon' => 'fact_check'
//                     ]
//                 ],
//                 'application_details' => [
//                     'approved_applications' => [
//                         'title' => 'Approved',
//                         'value' => $poApprovedCount + $pmApprovedCount,
//                         'icon' => 'check_circle'
//                     ],
//                     'rejected_applications' => [
//                         'title' => 'Rejected',
//                         'value' => $poRejectedCount + $pmRejectedCount,
//                         'icon' => 'cancel'
//                     ],
//                     'recommended_applications' => [
//                         'title' => 'Recommended',
//                         'value' => $poRecommendedCount + $pmRecommendedCount,
//                         'icon' => 'thumb_up'
//                     ],
//                     'not_recommended_applications' => [
//                         'title' => 'Not Recommended',
//                         'value' => $poNotRecommendedCount + $pmNotRecommendedCount,
//                         'icon' => 'thumb_down'
//                     ],
//                     'pending_applications' => [
//                         'title' => 'Pending',
//                         'value' => $poPendingCount + $pmPendingCount,
//                         'icon' => 'pending_actions'
//                     ],
//                     'total_applications' => [
//                         'title' => 'Total Applications',
//                         'value' => $totalApplications,
//                         'icon' => 'description'
//                     ],    
//                 ],
//                 'applications' => [
//                     'po' => [
//                         'total' => $poApplications->count(),
//                         'pending' => 0,
//                         'approved' => 0,
//                         'rejected' => 0,
//                     ],
//                     'pm' => [
//                         'total' => $pmApplications->count(),
//                         'pending' => 0,
//                         'approved' => 0,
//                         'rejected' => 0,
//                     ]
//                 ],
//                 'monthly_stats' => $monthlyStats
//             ]);

//         } catch (\Exception $e) {
//             return response()->json([
//                 'error' => 'Failed to fetch dashboard stats',
//                 'message' => $e->getMessage()
//             ], 500);
//         }
//     }
// }