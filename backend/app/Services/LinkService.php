<?php

namespace App\Services;

use App\Models\Link;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class LinkService
{
    public function listForUser(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return $user->links()
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function create(User $user, array $data): Link
    {
        $maxOrder = $user->links()->max('sort_order') ?? -1;

        return $user->links()->create([
            'title'      => $data['title'],
            'url'        => $this->profileUrl($user->username),
            'is_active'  => $data['is_active'] ?? true,
            'sort_order' => $maxOrder + 1,
        ]);
    }

    public function update(Link $link, array $data): Link
    {
        $link->update(array_filter([
            'title'     => $data['title'] ?? null,
            'is_active' => $data['is_active'] ?? null,
        ], fn ($v) => $v !== null));

        return $link->fresh();
    }

    private function profileUrl(string $username): string
    {
        $base = rtrim(env('FRONTEND_URL', config('app.url')), '/');

        return "{$base}/{$username}";
    }

    public function toggleActive(Link $link): Link
    {
        $link->update(['is_active' => ! $link->is_active]);

        return $link->fresh();
    }

    public function delete(Link $link): void
    {
        $link->delete();
    }

    public function reorder(User $user, array $orderedIds): void
    {
        foreach ($orderedIds as $position => $id) {
            $user->links()->where('id', $id)->update(['sort_order' => $position]);
        }
    }
}
