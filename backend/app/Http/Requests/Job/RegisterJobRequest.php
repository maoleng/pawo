<?php

namespace App\Http\Requests\Job;

use App\Http\Requests\BaseRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterJobRequest extends BaseRequest
{
    public function rules() : array
    {
        return [
            'message' => [
                'required',
            ],
        ];
    }

}
