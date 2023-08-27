<?php

namespace App\Services;

use App\Models\JobUser;
use App\Models\User;

class JobUserService extends ApiService
{

    protected $model = JobUser::class;

    protected function getOrderbyableFields(): array
    {
        return [
            'createdAt',
        ];
    }

    protected function mapFilters(): array
    {
        return [
            'jobId' => function ($value) {
                return static function ($q) use ($value) {
                    $q->where('jobId', $value);
                };
            },
            'userId' => function ($value) {
                return static function ($q) use ($value) {
                    $q->where('userId', $value);
                };
            },
        ];
    }

    protected function fields(): array
    {
        return [
            'jobId',
            'userId',
            'message',
            'createdAt',
            'jobObj',
            'userObj',
        ];
    }

    public function newQuery()
    {
        $query = parent::newQuery();

        $fields = getFields();
        $eager = [];
        if (in_array('jobObj', $fields, true)) {
            $eager[] = 'job';
        }
        if (in_array('userObj', $fields, true)) {
            $eager[] = 'user';
        }
        if (! empty($eager)) {
            $query->with($eager);
        }

        return $query;
    }

}
