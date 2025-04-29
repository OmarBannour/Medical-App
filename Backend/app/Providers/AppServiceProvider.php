<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('update-user', function ($user) {
            return $user->role === 'admin';
        });

        Gate::define('delete-user', function ($user) {
            return $user->role === 'admin';
        });

        Gate::define('create-user', function ($user) {
            return $user->role === 'admin';
        });

        Gate::define('view-user', function ($user) {
            return $user->role === 'admin';
        });
    }

}
