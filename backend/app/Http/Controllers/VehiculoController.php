<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VehiculoController extends Controller
{
    public function index()
    {
        return response()->json(Vehiculo::where('usuario_id', Auth::id())->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'matricula'        => 'required|string|max:20|unique:vehiculos,matricula',
            'vin'              => 'required|string|max:20|unique:vehiculos,vin',
            'marca'            => 'nullable|string|max:100',
            'modelo'           => 'nullable|string|max:100',
            'antiguedad'       => 'nullable|integer|min:1900|max:' . date('Y'),
            'kilometros'       => 'nullable|integer|min:0',
            'fecha_ultima_itv' => 'nullable|date',
            'imagen'           => 'nullable|string|max:255'
        ]);

        $vehiculo = Vehiculo::create([
            'usuario_id'       => Auth::id(),
            'matricula'        => $request->matricula,
            'vin'              => $request->vin,
            'marca'            => $request->marca,
            'modelo'           => $request->modelo,
            'antiguedad'       => $request->antiguedad,
            'kilometros'       => $request->kilometros,
            'fecha_ultima_itv' => $request->fecha_ultima_itv,
            'imagen'           => $request->imagen,
        ]);

        return response()->json([
            'message' => 'Vehículo registrado correctamente',
            'data'    => $vehiculo
        ], 201);
    }

    public function show($id)
    {
        $vehiculo = Vehiculo::where('usuario_id', Auth::id())->findOrFail($id);
        return response()->json($vehiculo);
    }

    public function update(Request $request, $id)
    {
        $vehiculo = Vehiculo::where('usuario_id', Auth::id())->findOrFail($id);

        $request->validate([
            'matricula'        => 'string|max:20|unique:vehiculos,matricula,' . $id,
            'vin'              => 'string|max:20|unique:vehiculos,vin,' . $id,
            'marca'            => 'nullable|string|max:100',
            'modelo'           => 'nullable|string|max:100',
            'antiguedad'       => 'nullable|integer|min:1900|max:' . date('Y'),
            'kilometros'       => 'nullable|integer|min:0',
            'fecha_ultima_itv' => 'nullable|date',
            'imagen'           => 'nullable|string|max:255'
        ]);

        $vehiculo->update($request->all());

        return response()->json([
            'message' => 'Vehículo actualizado con éxito',
            'data'    => $vehiculo
        ]);
    }

    public function destroy($id)
    {
        $vehiculo = Vehiculo::where('usuario_id', Auth::id())->findOrFail($id);
        $vehiculo->delete();

        return response()->json(['message' => 'Vehículo eliminado correctamente']);
    }
}