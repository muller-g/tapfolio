<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $days = (int) $request->query('days', 30);

        if (! in_array($days, [7, 30, 90])) {
            $days = 30;
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'stats'           => $this->dashboardService->getStats($user, $days),
                'top_links'       => $this->dashboardService->getTopLinks($user),
                'weekly_activity' => $this->dashboardService->getWeeklyActivity($user),
                'devices'         => $this->dashboardService->getDeviceBreakdown($user),
            ],
        ]);
    }
}
