<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

abstract class Base extends Model
{
    use HasFactory;
    public $incrementing = false;
    public $timestamps = false;

    protected array $raw = [];

    public function fill(array $attributes): Base
    {
        $this->raw = $attributes;
        return parent::fill($attributes);
    }

    public function getRaw(string $name, $default = null)
    {
        return $this->raw[$name] ?? $default;
    }

}
