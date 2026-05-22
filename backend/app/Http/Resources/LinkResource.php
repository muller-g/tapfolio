<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'title'      => $this->title,
            'url'        => $this->url,
            'is_active'  => $this->is_active,
            'sort_order' => $this->sort_order,
            'appearance' => $this->appearance ?? [],
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
