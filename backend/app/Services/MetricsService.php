<?php

namespace App\Services;

use App\Models\Link;
use App\Models\LinkEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MetricsService
{
    public function getMetrics(User $user): array
    {
        $totalViews  = LinkEvent::where('user_id', $user->id)->where('event_type', 'view')->count();
        $totalClicks = LinkEvent::where('user_id', $user->id)->where('event_type', 'click')->count();

        $links = Link::withTrashed()
            ->where('user_id', $user->id)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get();

        $viewsByLink = LinkEvent::where('user_id', $user->id)
            ->where('event_type', 'view')
            ->whereNotNull('link_id')
            ->select('link_id', DB::raw('COUNT(*) as total'))
            ->groupBy('link_id')
            ->pluck('total', 'link_id');

        $buttonClicksByLink = LinkEvent::where('user_id', $user->id)
            ->where('event_type', 'click')
            ->whereNotNull('link_id')
            ->whereNotNull('button_key')
            ->select('link_id', 'button_type', 'button_key', DB::raw('COUNT(*) as total'))
            ->groupBy('link_id', 'button_type', 'button_key')
            ->get()
            ->groupBy('link_id');

        $mappedLinks = $links->map(function (Link $link) use ($viewsByLink, $buttonClicksByLink) {
            $appearance = $link->appearance ?? [];
            $subLinks   = collect($appearance['subLinks'] ?? []);
            $labelMap   = $subLinks->keyBy('id')->map(fn ($sl) => ['label' => $sl['title'] ?? '', 'url' => $sl['url'] ?? '']);

            $events = $buttonClicksByLink->get($link->id, collect());

            $subLinkClicks = $events->where('button_type', 'sublink')
                ->map(fn ($row) => [
                    'button_key' => $row->button_key,
                    'label'      => $labelMap->get($row->button_key)['label'] ?? $row->button_key,
                    'url'        => $labelMap->get($row->button_key)['url'] ?? '',
                    'clicks'     => (int) $row->total,
                ])
                ->sortByDesc('clicks')
                ->values()
                ->all();

            $socialClicks = $events->where('button_type', 'social')
                ->map(fn ($row) => [
                    'platform' => $row->button_key,
                    'clicks'   => (int) $row->total,
                ])
                ->sortByDesc('clicks')
                ->values()
                ->all();

            $totalButtonClicks = $events->sum('total');

            return [
                'id'           => $link->id,
                'title'        => $link->title,
                'is_active'    => $link->is_active,
                'views'        => (int) ($viewsByLink->get($link->id, 0)),
                'total_clicks' => (int) $totalButtonClicks,
                'sub_links'    => $subLinkClicks,
                'social'       => $socialClicks,
            ];
        })->values()->all();

        return [
            'summary' => [
                'total_views'  => $totalViews,
                'total_clicks' => $totalClicks,
                'ctr'          => $totalViews > 0 ? round(($totalClicks / $totalViews) * 100, 1) : 0,
            ],
            'links' => $mappedLinks,
        ];
    }
}
