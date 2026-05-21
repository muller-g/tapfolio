<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'max:255'],
            'username'              => ['required', 'string', 'min:3', 'max:50', 'unique:users,username', 'regex:/^[a-z0-9_\-]+$/'],
            'email'                 => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.regex'  => 'O username deve conter apenas letras minúsculas, números, hífens e underscores.',
            'username.unique' => 'Este username já está em uso.',
            'email.unique'    => 'Este e-mail já está cadastrado.',
        ];
    }
}
