<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\UnauthorizedException;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name'     => $data['name'],
            'username' => $data['username'],
            'email'    => $data['email'],
            'password' => $data['password'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return compact('user', 'token');
    }

    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return compact('user', 'token');
    }
}
