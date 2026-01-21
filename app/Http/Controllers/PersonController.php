<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PersonController extends Controller
{
    /**
     * Display a listing of the resource with pagination and search.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search', '');

            $query = Person::orderBy('created_at', 'desc');

            // Filter by division_id if provided
            if ($request->has('division_id') && $request->division_id) {
                $query->where('division_id', $request->division_id);
            }

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'LIKE', "%{$search}%")
                        ->orWhere('nic', 'LIKE', "%{$search}%")
                        ->orWhere('email', 'LIKE', "%{$search}%")
                        ->orWhere('office_phone', 'LIKE', "%{$search}%")
                        ->orWhere('whatsapp', 'LIKE', "%{$search}%")
                        ->orWhere('designation', 'LIKE', "%{$search}%")
                        ->orWhere('code', 'LIKE', "%{$search}%");
                });
            }

            $people = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $people->items(),
                'pagination' => [
                    'current_page' => $people->currentPage(),
                    'last_page' => $people->lastPage(),
                    'per_page' => $people->perPage(),
                    'total' => $people->total(),
                    'from' => $people->firstItem(),
                    'to' => $people->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching persons',
                'error' => $e->getMessage()
            ], 500);
        }
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
            'nic' => 'required|string|max:12|unique:persons,nic',
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
            'nic' => 'required|string|max:12|unique:persons,nic,' . $id,
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
