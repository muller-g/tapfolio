<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LinkEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'link_id',
        'event_type',
        'ip_address',
        'user_agent',
        'referer',
        'button_key',
        'button_type',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function link(): BelongsTo
    {
        return $this->belongsTo(Link::class);
    }
}
