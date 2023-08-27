<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ApiAuthenticate extends Middleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string[]  ...$guards
     * @return mixed
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    public function handle($request, Closure $next, ...$guards)
    {
        if (! $accountId = $request->headers->get('Authorization')) {
            return $this->errorJson(Response::HTTP_UNAUTHORIZED);
        }
        $user = User::query()->where('accountId', $accountId)->first();
        if (empty($user)) {
            $lastUser = User::query()->orderByDesc('id')->first();
            $user = User::query()->create([
                'id' => $lastUser === null ? 1 : ($lastUser->id + 1),
                'accountId' => $accountId,
                'createdAt' => now(),
            ]);
        }

        app()->singleton('authed', function () use ($user) {
            return $user;
        });

        return $next($request);
    }

    protected function errorJson($statusCode = Response::HTTP_BAD_REQUEST): Response
    {
        return new JsonResponse([
            'status' => false,
            'message' => 'Hey, who are you ?',
        ], $statusCode);
    }
}
