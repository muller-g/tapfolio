<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('link_events', function (Blueprint $table) {
            $table->string('button_key', 255)->nullable()->after('referer');
            $table->enum('button_type', ['sublink', 'social'])->nullable()->after('button_key');

            $table->index(['link_id', 'button_type', 'button_key', 'created_at'], 'link_events_button_idx');
        });
    }

    public function down(): void
    {
        Schema::table('link_events', function (Blueprint $table) {
            $table->dropIndex('link_events_button_idx');
            $table->dropColumn(['button_key', 'button_type']);
        });
    }
};
