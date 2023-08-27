<?php

namespace App\Services;

use App\Enums\JobStatus;
use App\Models\Job;

class JobService extends ApiService
{

    protected $model = Job::class;

    protected function getOrderbyableFields(): array
    {
        return [
            'title', 'money', 'status', 'startedAt', 'deadline', 'createdAt',
        ];
    }

    protected function mapFilters(): array
    {
        return [
            'title' => function ($value) {
                return (static function ($q) use ($value) {
                    $q->where('name', 'LIKE', $value);
                });
            },
            'categories' => function ($value) {
                return static function ($q) use ($value) {
                    $q->whereJsonContains('categories', $value);
                };
            },
            'creatorId' => function ($value) {
                return (static function ($q) use ($value) {
                    $q->where('creatorId', $value);
                });
            },
            'freelancerId' => function ($value) {
                return (static function ($q) use ($value) {
                    $q->where('freelancerId', $value);
                });
            },
            'status' => function ($value) {
                return (static function ($q) use ($value) {
                    $q->where('status', $value);
                });
            },

        ];
    }

    protected function fields(): array
    {
        return [
            'title', 'description', 'categories', 'money', 'creatorId', 'status', 'freelancerId', 'startedAt',
            'finishedAts', 'deadline', 'createdAt',
        ];
    }

    public function newQuery()
    {
        $query = parent::newQuery();

        return $query;
    }

    protected function updateQuery()
    {
        $query = parent::updateQuery();

        return $query->where('creatorId', c('authed')->id);
    }

    protected function destroyQuery()
    {
        $query = parent::updateQuery();

        return $query->where('creatorId', c('authed')->id);
    }

    public function boot(): void
    {
        $this->on('creating', function ($model) {
            $model->creatorId = c('authed')->id;
            $model->status = JobStatus::WAITING;
            $model->createdAt = now();
        });

        $this->on('updating', function ($model) {
            $deadline = request()->get('deadline');
            if ($deadline !== null) {
                if (empty($model->freelancer)) {
                    throw new \RuntimeException('There is no freelancer, please choose one then set deadline');
                }
                $model->status = JobStatus::PROCESSING;
                $model->startedAt = $model->startedAt ?? now();
                $model->deadline = $deadline;
            }
        });
    }

    public function allStatusFailExcept($status, $exceptStatus)
    {
        if (is_array($exceptStatus)) {
            if (in_array($status, $exceptStatus, true)) {
                return true;
            }

            return 'This job is not finish';
        }

        if ($status === $exceptStatus) {
            return true;
        }

        switch ($status) {
            case JobStatus::WAITING:
                return 'This job is still waiting';
            case JobStatus::PROCESSING:
                return 'This job is still processing';
            case JobStatus::PENDING:
                return 'This job is pending for the recruiter send money';
            case JobStatus::STOPPED:
                return 'This job is stopped already';
            case JobStatus::PAID:
                return 'This job is paid already';
            case JobStatus::OVERDUE:
                return 'This job is overdue already';
        }
    }


}
