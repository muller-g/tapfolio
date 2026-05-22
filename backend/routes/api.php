<?php

use App\Http\Controllers\Api\V1\AppearanceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\LinkAppearanceController;
use App\Http\Controllers\Api\V1\LinksController;
use App\Http\Controllers\Api\V1\MetricsController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\TrackController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('profile/{username}', [ProfileController::class, 'show']);
    Route::post('track', [TrackController::class, 'store']);
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index']);
        Route::get('metrics', [MetricsController::class, 'index']);

        Route::get('appearance', [AppearanceController::class, 'show']);
        Route::put('appearance', [AppearanceController::class, 'update']);

        Route::prefix('links')->group(function () {
            Route::get('/', [LinksController::class, 'index']);
            Route::post('/', [LinksController::class, 'store']);
            Route::put('reorder', [LinksController::class, 'reorder']);
            Route::put('{link}', [LinksController::class, 'update']);
            Route::patch('{link}/toggle', [LinksController::class, 'toggle']);
            Route::delete('{link}', [LinksController::class, 'destroy']);
            Route::get('{link}/appearance', [LinkAppearanceController::class, 'show']);
            Route::put('{link}/appearance', [LinkAppearanceController::class, 'update']);
        });
    });
});
