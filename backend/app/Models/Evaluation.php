<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Base
{

    protected $fillable = [
        'evaluatorId',
        'evaluatedId',
        'jobId',
        'star',
        'message',
        'createdAt',
    ];

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluatorId');
    }

    public function evaluated(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluatedId');
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'jobId');
    }

    public function getEvaluatorObjAttribute()
    {
        return $this->evaluator;
    }

    public function getEvaluatedObjAttribute()
    {
        return $this->evaluated;
    }

    public function getJobObjAttribute()
    {
        return $this->job;
    }

}
