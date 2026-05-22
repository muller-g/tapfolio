<?php

namespace App\Http\Requests\Link;

use Illuminate\Foundation\Http\FormRequest;

class ReorderLinksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:links,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'A lista de IDs é obrigatória.',
            'ids.array'    => 'O campo ids deve ser um array.',
            'ids.*.exists' => 'Um ou mais links não foram encontrados.',
        ];
    }
}
