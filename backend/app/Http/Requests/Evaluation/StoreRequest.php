<?php

namespace App\Http\Requests\Evaluation;

use App\Http\Requests\BaseRequest;

class StoreRequest extends BaseRequest
{

    public function rules() : array
    {
        return [
            'userId' => [
                'required',
            ],
            'jobId' => [
                'required',
            ],
            'star' => [
                'required',
                'regex:/^([0-5](\.\d)?)$/',
            ],
            'message' => [
                'required',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'regex' => ':attribute should be 0~5, only 1 decimal.',
        ];
    }

}
