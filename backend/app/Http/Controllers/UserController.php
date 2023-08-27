<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Services\UserService;

class UserController extends ApiController
{
    public function getService()
    {
        return c(UserService::class);
    }

}
