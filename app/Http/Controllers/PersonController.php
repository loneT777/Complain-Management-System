<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PersonController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $people = Person::orderBy('created_at', 'desc')->get();
        return response()->json($people);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:200',
            'nic' => 'required|string|max:12|unique:people,nic',
            'title' => 'nullable|string|max:20',
            'code' => 'nullable|string|max:50',
            'office_phone' => 'nullable|string|max:15',
            'whatsapp' => 'nullable|string|max:15',
            'address' => 'nullable|string',
            'type' => 'nullable|string|max:50',
            'designation' => 'nullable|string|max:100',
            'remark' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $person = Person::create($request->all());
        return response()->json($person, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $person = Person::findOrFail($id);
        return response()->json($person);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $person = Person::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:200',
            'nic' => 'required|string|max:12|unique:people,nic,' . $id,
            'title' => 'nullable|string|max:20',
            'code' => 'nullable|string|max:50',
            'office_phone' => 'nullable|string|max:15',
            'whatsapp' => 'nullable|string|max:15',
            'address' => 'nullable|string',
            'type' => 'nullable|string|max:50',
            'designation' => 'nullable|string|max:100',
            'remark' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $person->update($request->all());
        return response()->json($person);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $person = Person::findOrFail($id);
        $person->delete();
        return response()->json(['message' => 'Person deleted successfully']);
    }
}
