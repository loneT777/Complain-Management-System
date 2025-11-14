<?php

namespace App\Http\Controllers;

use App\Models\GoslFundType;
use Illuminate\Http\Request;

class GoslFundTypeController extends Controller
{
    // public function index()
    // {
    //     return GoslFundType::select('id', 'name')->get();
    // }

    public function getAll()
    {
        return GoslFundType::select('id', 'name')->get();
    }

    // public function store(Request $request)
    // {
    //     $request->validate([
    //         'name' => 'required|string|max:100'
    //     ]);

    //     $fundType = GoslFundType::create($request->only('name'));
    //     return response()->json($fundType, 201);
    // }

    // public function update(Request $request, $id)
    // {
    //     $request->validate([
    //         'name' => 'required|string|max:100'
    //      ]);

    //     $fundType = GoslFundType::findOrFail($id);
    //     $fundType->update($request->only('name'));
        
    //      return response()->json($fundType);
    //  }

    // public function destroy($id)
    // {
    //     $fundType = GoslFundType::findOrFail($id);
    //     $fundType->delete();
        
    //     return response()->json(['message' => 'Deleted successfully']);
    // }
}