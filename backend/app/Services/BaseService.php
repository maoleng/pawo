<?php

namespace App\Services;

use Evenement\EventEmitterTrait;

abstract class BaseService
{
    use EventEmitterTrait;

    protected $container;
    protected $db;
    protected $model;

    public function __construct()
    {
        $this->boot();
    }

    public function __get(string $key)
    {
        return $this->container->get($key);
    }

    public function __call($method, $params)
    {
        if ($this->model) {
            return call_user_func_array([$this->model, $method], $params);
        }
        return call_user_func_array([$this->db->getDatabaseManager()->connection(), $method], $params);
    }

    protected function boot()
    {
    }
}
