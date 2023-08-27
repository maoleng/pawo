<?php

namespace App\Http\Controllers;

use App\Http\Requests\Evaluation\StoreRequest;
use App\Services\EvaluationService;

class EvaluationController extends ApiController
{
    public function getService()
    {
        return c(EvaluationService::class);
    }

    protected function getStoreRequest()
    {
        return c(StoreRequest::class);
    }


}
