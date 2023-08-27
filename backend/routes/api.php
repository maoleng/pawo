<?php

use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobUserController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\ApiAuthenticate;
use Illuminate\Support\Facades\Route;

Route::post('/authed', function () {
    return [
        'status' => true,
        'data' => c('authed'),
    ];
})->middleware(ApiAuthenticate::class);

Route::group(['prefix' => 'job'], function () {
    Route::get('/', [JobController::class, 'index']);
    Route::get('/{id}', [JobController::class, 'show']);
    Route::group(['middleware' => ApiAuthenticate::class], function () {
        Route::post('/', [JobController::class, 'store']);
        Route::put('/{id}', [JobController::class, 'update']);
        Route::delete('/{id}', [JobController::class, 'destroy']);
        Route::post('/register/{id}', [JobController::class, 'register']);
        Route::post('/choose/{id}', [JobController::class, 'choose']);
        Route::post('/request_payment/{id}', [JobController::class, 'requestPayment']);
        Route::post('/verify_payment/{id}', [JobController::class, 'verifyPayment']);
    });
});

Route::group(['prefix' => 'user'], function () {
    Route::get('/', [UserController::class, 'index']);
    Route::get('/{id}', [UserController::class, 'show']);
});

Route::group(['prefix' => 'job_user'], function () {
    Route::get('/', [JobUserController::class, 'index']);
});

Route::group(['prefix' => 'evaluation'], function () {
    Route::get('/', [EvaluationController::class, 'index']);
    Route::post('/', [EvaluationController::class, 'store'])->middleware(ApiAuthenticate::class);
});
