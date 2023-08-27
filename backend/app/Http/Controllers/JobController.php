<?php

namespace App\Http\Controllers;

use App\Enums\JobStatus;
use App\Http\Requests\Job\ChooserFreelancerRequest;
use App\Http\Requests\Job\RegisterJobRequest;
use App\Http\Requests\Job\UpdateJobRequest;
use App\Http\Requests\UserRequest;
use App\Models\User;
use App\Services\JobService;
use App\Services\UserService;
use http\Exception\RuntimeException;

class JobController extends ApiController
{

    public function getService()
    {
        return c(JobService::class);
    }

    public function getUpdateRequest()
    {
        return c(UpdateJobRequest::class);
    }

    public function register(RegisterJobRequest $request, $id): array
    {
        $user = c('authed');
        $message = $request->validated()['message'];

        $job = services()->jobService()->findOrFail($id);

        if ($job->users->where('id', $user->id)->isNotEmpty()) {
            return [
                'status' => false,
                'message' => 'You have registered this job before',
            ];
        }

        $job->users()->attach([$user->id => [
            'message' => $message,
            'createdAt' => now(),
        ]]);

        return [
            'status' => true,
            'message' => 'Register successfully',
        ];
    }

    public function choose(ChooserFreelancerRequest $request)
    {
        $user = services()->userService()->find($request->validated()['userId']);
        $job = $request->input('job');

        $freelancer = $job->freelancer;
        if ($freelancer !== null) {
            return [
                'status' => false,
                'message' => "You have chose $freelancer->accountId for doing this job.",
            ];
        }
        if ($job->users->where('id', $user->id)->isEmpty()) {
            return [
                'status' => false,
                'message' => 'This user not register this job',
            ];
        }

        $job->freelancerId = $user->id;
        $job->save();

        return [
            'status' => true,
            'message' => 'Choose freelancer successfully',
        ];
    }

    public function requestPayment($id): array
    {
        $job = services()->jobService()->findOrFail($id);
        if ($job->users->where('id', c('authed')->id)->isEmpty()) {
            throw new \RuntimeException('You have not registered this job before');
        }

        $checkJobStatus = services()->jobService()->allStatusFailExcept($job->status, JobStatus::PROCESSING);
        if ($checkJobStatus !== true) {
            throw new \RuntimeException($checkJobStatus);
        }
        $job->status = JobStatus::PENDING;
        $job->finishedAts = array_merge($job->finishedAts ?? [], [now()->toDateTimeString()]);
        $job->save();

        return [
            'status' => true,
            'message' => 'Send payment request successfully',
        ];
    }

    public function verifyPayment($id): array
    {
        $job = services()->jobService()->findOrFail($id);

        if ($job->creatorId !== c('authed')->id) {
            throw new \RuntimeException('This job is not yours');
        }

        $checkJobStatus = services()->jobService()->allStatusFailExcept($job->status, JobStatus::PENDING);
        if ($checkJobStatus !== true) {
            throw new \RuntimeException($checkJobStatus);
        }

        $job->status = JobStatus::PAID;
        $job->save();

        return [
            'status' => true,
            'message' => 'Verify payment successfully',
        ];
    }

}
