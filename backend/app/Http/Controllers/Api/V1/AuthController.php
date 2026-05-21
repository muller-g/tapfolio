<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginUserRequest;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\UnauthorizedException;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function register(RegisterUserRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return response()->json([
            'success' => true,
            'data'    => [
                'user'  => new UserResource($result['user']),
                'token' => $result['token'],
            ],
        ], 201);
    }

    public function login(LoginUserRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->validated());
        } catch (UnauthorizedException) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciais inválidas.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'user'  => new UserResource($result['user']),
                'token' => $result['token'],
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => ['user' => new UserResource($request->user())],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
