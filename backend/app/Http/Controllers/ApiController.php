<?php

namespace App\Http\Controllers;

use App\Models\Base as BaseModel;
use App\Services\ApiService;
use Illuminate\Http\Request;
use App\Http\Requests\BaseRequest;


abstract class ApiController extends BaseController
{
    /**
     * @return ApiService
     */
    abstract protected function getService();

    public function index(Request $request): array
    {
        return $this->getService()->getMany($request);
    }

    public function show(Request $request): array
    {
        $result = $this->getService()->getOne($request);
        if (empty($result)) {
            return [
                'status' => false,
                'message' => trans('messages.id_is_not_exist'),
            ];
        }
        return $result;
    }

    public function store(): array
    {
        $data = $this->getStoreData();
        $result = $this->getService()->create($data);
        if ($result->get('status')) {
            return [
                'status' => true,
            ];
        }
        return [
            'status' => false,
            'message' => $result->get('message'),
        ];
    }

    public function update($id): array
    {
        $data = $this->getUpdateData();
        $result = $this->getService()->update($id, $data);
        if ($result->get('status')) {
            return [
                'status' => true,
            ];
        }
        return [
            'status' => false,
            'message' => $result->get('message'),
        ];
    }

    public function destroy($id): array
    {
        $result = $this->getService()->delete($id);
        if ($result->get('status')) {
            return [
                'status' => true,
            ];
        }
        return [
            'status' => false,
            'message' => $result->get('message'),
        ];
    }

    protected function getStoreRequest() {}
    protected function getUpdateRequest() {}

    protected function getStoreData()
    {
        $request = $this->getStoreRequest();

        if ($request instanceof BaseRequest) {
            return $request->validated();
        }
        return $this->getJsonData();
    }

    protected function getUpdateData()
    {
        $request = $this->getUpdateRequest();
        if ($request instanceof BaseRequest) {
            return $request->validated();
        }
        return $this->getJsonData();
    }

}
