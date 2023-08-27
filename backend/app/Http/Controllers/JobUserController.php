<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Services\JobUserService;
use App\Services\UserService;

class JobUserController extends ApiController
{

    public function getService()
    {
        return c(JobUserService::class);
    }

}
