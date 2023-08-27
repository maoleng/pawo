<?php

use App\Lib\Helper\MapService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

if (!function_exists('c')) {
    function c(string $key)
    {
        return App::make($key);
    }
}

if (!function_exists('services')) {
    function services(): MapService
    {
        return c(MapService::class);
    }
}


if (! function_exists('getJsonData')) {
    function getJsonData(): array
    {
        return request()->all();
    }
}

if (! function_exists('getFilters')) {
    function getFilters(Request $request): array
    {
        $raw = $request->query->get('_filter', '');
        $data = [];
        $raws = array_filter(explode(';', $raw));
        foreach ($raws as $item) {
            $items = explode(':', $item);
            if (is_array($items) && count($items) >= 2) {
                $data[array_shift($items)] = implode(':', $items);
            }
        }

        return $data;
    }
}

if (! function_exists('getFields')) {
    function getFields(Request $q = null): array
    {
        $request = $q ?? request();
        $raw = $request->query->get('_fields', '');

        return explode(',', $raw);
    }
}

if (! function_exists('currentFunction')) {
    function currentFunction(): string
    {
        $action_name = Route::getCurrentRoute()->getActionName();

        return explode('@', $action_name)[1];
    }
}

