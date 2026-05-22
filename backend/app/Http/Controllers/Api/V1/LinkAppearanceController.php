<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Link;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LinkAppearanceController extends Controller
{
    public function show(Request $request, Link $link): JsonResponse
    {
        $this->authorize('view', $link);

        return response()->json([
            'success' => true,
            'data'    => ['appearance' => $link->appearance ?? []],
        ]);
    }

    public function update(Request $request, Link $link): JsonResponse
    {
        $this->authorize('update', $link);

        $request->validate([
            'appearance' => ['required', 'array'],
        ]);

        $link->update(['appearance' => $request->input('appearance')]);

        return response()->json([
            'success' => true,
            'data'    => ['appearance' => $link->fresh()->appearance ?? []],
        ]);
    }
}
