<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobUser extends Base
{

    protected $table = 'job_user';

    protected $fillable = [
        'jobId',
        'userId',
        'message',
        'createdAt',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'jobId', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'userId');
    }

    public function getJobObjAttribute()
    {
        return $this->job;
    }

    public function getUserObjAttribute()
    {
        return $this->user;
    }

}
