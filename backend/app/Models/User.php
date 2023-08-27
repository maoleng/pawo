<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Base
{

    protected $fillable = [
        'name',
        'rate',
        'accountId',
        'token',
        'createdAt',
    ];

    protected $hidden = [
        'token',
    ];

    public function jobs(): BelongsToMany
    {
        return $this->belongsToMany(Job::class, 'job_user', 'userId', 'jobId')
            ->withPivot([
                'message', 'createdAt',
            ]);
    }

    public function evaluationsAsEvaluated(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'evaluatedId');
    }

    public function evaluationsAsEvaluator(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'evaluatorId');
    }

    public function getStarAsFreelancerAttribute(): float
    {
        $evaluations = $this->evaluationsAsEvaluated->where('evaluatedId', $this->id);
        if ($evaluations->isEmpty()) {
            return 0;
        }

        $sumOfStars = $evaluations->sum('star');
        $totalEvaluations = $evaluations->count();

        return $sumOfStars / $totalEvaluations;
    }

    public function getStarAsEmployerAttribute(): float
    {
        $evaluations = $this->evaluationsAsEvaluator->where('evaluatorId', $this->id);
        if ($evaluations->isEmpty()) {
            return 0;
        }

        $sumOfStars = $evaluations->sum('star');
        $totalEvaluations = $evaluations->count();

        return $sumOfStars / $totalEvaluations;
    }

}
