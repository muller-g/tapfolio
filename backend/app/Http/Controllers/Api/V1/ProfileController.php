<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LinkResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function show(string $username): JsonResponse
    {
        $user = User::where('username', $username)->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Perfil não encontrado.',
            ], 404);
        }

        $links = $user->links()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'user'       => [
                    'name'     => $user->name,
                    'username' => $user->username,
                ],
                'appearance' => $user->appearance ?? [],
                'links'      => LinkResource::collection($links),
            ],
        ]);
    }
}
