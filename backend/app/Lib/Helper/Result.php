<?php

namespace App\Lib\Helper;

class Result
{
    protected array $data;

    public function __construct(array $data = [])
    {
        $this->data = $data;
    }

    public function get($key)
    {
        return $this->data[$key] ?? null;
    }

}
