<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Job extends Base
{

    protected $fillable = [
        'title',
        'description',
        'categories',
        'money',
        'creatorId',
        'status',
        'freelancerId',
        'startedAt',
        'finishedAts',
        'deadline',
        'createdAt',
    ];

    protected $casts = [
        'categories' => 'json',
        'finishedAts' => 'json',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'job_user', 'jobId', 'userId')->withPivot([
            'message', 'createdAt',
        ]);
    }

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'freelancerId');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'jobId');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creatorId');
    }

}
