<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LinkEvent;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username'    => ['required', 'string'],
            'event_type'  => ['required', 'in:view,click'],
            'link_id'     => ['nullable', 'integer'],
            'button_key'  => ['nullable', 'string', 'max:255'],
            'button_type' => ['nullable', 'in:sublink,social'],
        ]);

        $user = User::where('username', $data['username'])->first();

        if (! $user) {
            return response()->json(['success' => false], 404);
        }

        LinkEvent::create([
            'user_id'     => $user->id,
            'link_id'     => $data['link_id'] ?? null,
            'event_type'  => $data['event_type'],
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
            'referer'     => $request->header('Referer'),
            'button_key'  => $data['button_key'] ?? null,
            'button_type' => $data['button_type'] ?? null,
        ]);

        return response()->json(['success' => true], 201);
    }
}
