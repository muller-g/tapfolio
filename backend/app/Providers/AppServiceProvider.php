<?php

namespace App\Providers;

use App\Models\Link;
use App\Policies\LinkPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::policy(Link::class, LinkPolicy::class);
    }
}
