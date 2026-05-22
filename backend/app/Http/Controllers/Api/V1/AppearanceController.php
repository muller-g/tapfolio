<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppearanceController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => ['appearance' => $request->user()->appearance ?? []],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'appearance' => ['required', 'array'],
        ]);

        $request->user()->update(['appearance' => $request->input('appearance')]);

        return response()->json([
            'success' => true,
            'data'    => ['appearance' => $request->user()->fresh()->appearance ?? []],
        ]);
    }
}
