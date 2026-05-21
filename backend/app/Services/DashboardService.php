<?php

namespace App\Services;

use App\Models\Link;
use App\Models\LinkEvent;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getStats(User $user, int $days = 30): array
    {
        $since = Carbon::now()->subDays($days)->startOfDay();

        $totalViews  = $this->countEvents($user->id, 'view');
        $totalClicks = $this->countEvents($user->id, 'click');
        $recentViews = $this->countEvents($user->id, 'view', $since);
        $recentClicks = $this->countEvents($user->id, 'click', $since);

        $activeLinks = $user->links()->where('is_active', true)->count();

        return [
            'total_views'     => $totalViews,
            'total_clicks'    => $totalClicks,
            'recent_views'    => $recentViews,
            'recent_clicks'   => $recentClicks,
            'active_links'    => $activeLinks,
            'ctr'             => $totalViews > 0 ? round(($totalClicks / $totalViews) * 100, 1) : 0,
            'period_days'     => $days,
        ];
    }

    public function getTopLinks(User $user, int $limit = 10): array
    {
        $totalClicks = $this->countEvents($user->id, 'click');

        $links = Link::withTrashed()
            ->where('user_id', $user->id)
            ->withCount(['events as clicks' => fn ($q) => $q->where('event_type', 'click')])
            ->orderByDesc('clicks')
            ->limit($limit)
            ->get();

        return $links->map(fn ($link) => [
            'id'         => $link->id,
            'title'      => $link->title,
            'url'        => $link->url,
            'is_active'  => $link->is_active,
            'clicks'     => $link->clicks,
            'percentage' => $totalClicks > 0 ? round(($link->clicks / $totalClicks) * 100, 1) : 0,
        ])->values()->all();
    }

    public function getWeeklyActivity(User $user): array
    {
        $days   = 7;
        $since  = Carbon::now()->subDays($days - 1)->startOfDay();
        $result = [];

        $events = LinkEvent::query()
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $since)
            ->selectRaw('DATE(created_at) as date, event_type, COUNT(*) as total')
            ->groupBy('date', 'event_type')
            ->get()
            ->groupBy('date');

        for ($i = $days - 1; $i >= 0; $i--) {
            $date    = Carbon::now()->subDays($i)->toDateString();
            $dayData = $events->get($date, collect());

            $result[] = [
                'date'   => $date,
                'label'  => Carbon::parse($date)->locale('pt_BR')->isoFormat('D/M'),
                'clicks' => (int) ($dayData->where('event_type', 'click')->first()?->total ?? 0),
                'views'  => (int) ($dayData->where('event_type', 'view')->first()?->total ?? 0),
            ];
        }

        return $result;
    }

    public function getDeviceBreakdown(User $user): array
    {
        $events = LinkEvent::query()
            ->where('user_id', $user->id)
            ->whereNotNull('user_agent')
            ->get(['user_agent']);

        $mobile  = 0;
        $desktop = 0;

        foreach ($events as $event) {
            if ($this->isMobile($event->user_agent)) {
                $mobile++;
            } else {
                $desktop++;
            }
        }

        $total = $mobile + $desktop;

        return [
            'mobile'          => $mobile,
            'desktop'         => $desktop,
            'mobile_percent'  => $total > 0 ? round(($mobile / $total) * 100) : 0,
            'desktop_percent' => $total > 0 ? round(($desktop / $total) * 100) : 0,
        ];
    }

    private function countEvents(int $userId, string $type, ?Carbon $since = null): int
    {
        $query = LinkEvent::where('user_id', $userId)->where('event_type', $type);

        if ($since) {
            $query->where('created_at', '>=', $since);
        }

        return $query->count();
    }

    private function isMobile(string $userAgent): bool
    {
        return (bool) preg_match(
            '/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i',
            $userAgent
        );
    }
}
