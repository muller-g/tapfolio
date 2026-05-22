<?php

namespace App\Http\Requests\Link;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'     => ['sometimes', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.max' => 'O título deve ter no máximo 255 caracteres.',
        ];
    }
}
