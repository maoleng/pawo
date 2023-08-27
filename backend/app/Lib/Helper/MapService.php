<?php

namespace App\Lib\Helper;

use App\Services\EvaluationService;
use App\Services\JobService;
use App\Services\UserService;
use Psr\Container\ContainerInterface;

class MapService
{
    protected ContainerInterface $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function userService(): UserService
    {
        return c(UserService::class);
    }

    public function jobService(): JobService
    {
        return c(JobService::class);
    }

    public function evaluationService(): EvaluationService
    {
        return c(EvaluationService::class);
    }

}
