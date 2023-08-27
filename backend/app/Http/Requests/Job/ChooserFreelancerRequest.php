<?php

namespace App\Http\Requests\Job;

use App\Http\Requests\BaseRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Routing\Route;

class ChooserFreelancerRequest extends BaseRequest
{
    public function rules() : array
    {
        $job = services()->jobService()->findOrFail(request()->route('id'));
        if ($job->creatorId !== c('authed')->id) {
            throw new \RuntimeException('This job is not yours');
        }
        $this->merge(['job' => $job]);

        return [
            'userId' => [
                'required',
            ],
        ];
    }

}
