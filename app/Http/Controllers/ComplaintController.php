<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    /**
     * Return a paginated list of complaints
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $complaints = Complaint::paginate(10);
        return response()->json($complaints);
    }
}
