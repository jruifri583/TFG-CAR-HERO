<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MensajeContacto;
use Illuminate\Http\Request;

class MensajeContactoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->query('sort', 'created_at');
        $order = $request->query('order', 'desc');

        $allowedSorts = ['nombre', 'email', 'created_at', 'leido_at'];

        $query = MensajeContacto::query();
        $search = $request->query("search");

        if ($search) {
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    // Si es número, buscamos por año, mes o día de la fecha de creación
                    $q->whereYear("created_at", $search)
                      ->orWhereMonth("created_at", $search)
                      ->orWhereDay("created_at", $search);
                } else {
                    // Si es texto, buscamos por nombre o email
                    $q->where("nombre", "like", "%" . $search . "%")
                      ->orWhere("email", "like", "%" . $search . "%");
                }
            });
        }

        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $order);
        }

        return response()->json($query->paginate(6));
    }

    /**
     * Mark a message as read.
     */
    public function markAsRead(MensajeContacto $mensaje)
    {
        if (is_null($mensaje->leido_at)) {
            $mensaje->leido_at = \Carbon\Carbon::now();
            $mensaje->save();
        }

        return response()->json(['success' => true, 'mensaje' => $mensaje]);
    }

    /**
     * Reply to a message and send email.
     */
    public function responder(Request $request, MensajeContacto $mensaje)
    {
        $request->validate([
            'respuesta' => 'required|string|min:5'
        ]);

        $mensaje->respuesta = $request->input('respuesta');
        
        if (is_null($mensaje->respondido_at)) {
            $mensaje->respondido_at = \Carbon\Carbon::now();
        }

        if (is_null($mensaje->leido_at)) {
            $mensaje->leido_at = \Carbon\Carbon::now();
        }

        $mensaje->save();

        \Illuminate\Support\Facades\Mail::to($mensaje->email)->send(new \App\Mail\ResponderContactoMailable($mensaje));

        return response()->json(['success' => true, 'mensaje' => $mensaje]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MensajeContacto $mensaje)
    {
        $mensaje->delete();
        return response()->json(null, 204);
    }
}
