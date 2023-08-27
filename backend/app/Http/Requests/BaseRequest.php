<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

abstract class BaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function failedValidation(Validator $validator): void
    {
        $response = new Response([
            'status' => false,
            'message' => $validator->errors()->first(),
        ], 200);
        throw new ValidationException($validator, $response);
    }

    public function messages(): array
    {
        return [
            'required' => 'You did not fill :attribute',
            'email' => ':attribute is invalid',
            'same' => ':attribute is not match',
            'unique' => 'There are somebody choose :attribute',
            'exists' => ':attribute does not exist',
        ];
    }

    abstract public function rules();
}
