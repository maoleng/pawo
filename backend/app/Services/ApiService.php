<?php

namespace App\Services;

use App\Lib\Helper\Result;
use App\Models\Base as BaseModel;
use ArrayAccess;
use DateTime;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use JetBrains\PhpStorm\ArrayShape;

abstract class ApiService extends BaseService
{
    protected $maxPerPage = 2000;
    protected $fieldsName = '_fields';
    protected $filterData = [];

    protected function newQuery()
    {
        return $this->query();
    }

    protected function updateQuery()
    {
        return $this->query();
    }

    protected function destroyQuery()
    {
        return $this->query();
    }

    public function getMany(Request $request): array
    {
        if ((bool) $request->query->get('_noPagination') === true) {
            return $this->getWithoutPage($request);
        }

        return $this->getWithPage($request);
    }

    #[ArrayShape(['status' => "bool", 'data' => "array", 'meta' => "array"])]
    protected function getWithPage(Request $request): array
    {
        $page = max((int) $request->query->get('_page', 1), 1);
        $perPage = min(max((int) $request->query->get('_perPage', 10), 1), $this->maxPerPage);
        $query = $this->builderForGetMany($request);
        $items = $this->beforeRenderGetMany($query->paginate($perPage, ['*'], '_page', $page), $request);
        return $this->renderApi($items, $request);
    }

    #[ArrayShape(['status' => "bool", 'data' => "array", 'meta' => "array"])]
    protected function getWithoutPage(Request $request): array
    {
        $query = $this->builderForGetMany($request);
        $items = $this->beforeRenderGetMany($query->get(), $request);
        return $this->renderApi($items, $request);
    }

    protected function getCastValue($key, $value): bool|string
    {
        $casts = c($this->model)->getCasts();
        if ($cast = $casts[$key] ?? null) {
            switch ($cast) {
                case 'int':
                case 'integer':
                    return (string) (int) $value;
                case 'float':
                    return (string) (float) $value;
                case 'bool':
                case 'boolean':
                    if (!$value) {
                        return false;
                    }
                    if ($value === 'true' || $value === '1' || $value === 1) {
                        return true;
                    }
                    if ($value === 'false' || $value === '0' || $value === 0) {
                        return false;
                    }
                default:
                    return $value;
            }
        }
        return $value;
    }

    protected function builderForGetMany(Request $request)
    {
        // chạy các câu query trước
        $query = $this->newQuery();

        // thanh lọc các query param order by
        $hasDefaultOrderBy = false;
        $orderBy = [];
        $orderByArr = array_filter(explode(';', $request->query->get('_orderBy', '')));
        foreach ($orderByArr as $orderByStr) {
            $arr = explode(':', $orderByStr);
            if ($this->isOrderbyable($name = $arr[0] ?? null)) {
                if (in_array($type = $arr[1] ?? 'asc', ['asc', 'desc'])) {
                    $orderBy[] = [$name, $type];
                    if ($name === 'created_at') {
                        $hasDefaultOrderBy = true;
                    }
                }
            }
        }
        if (! $hasDefaultOrderBy && c($this->model)->timestamps === true) {
            $orderBy[] = ['created_at', 'desc'];
        }
        // bắt đầu order by
        foreach ($orderBy as $orderByItem) {
            $query->orderBy(...$orderByItem); // viết tắt của chèn dấu phẩy giữa 2 phần tử mảng
        }

        // thanh lọc các query param filter
        $this->filterData = getFilters($request);
        $filters = [];
        foreach ($this->filterData as $column => $value) {
            if (array_key_exists($column, $this->mapFilters()) && $value !== '') {
                $value = $this->getCastValue($column, $value); // lấy các filter từ query param
                $filters[] = $this->filter($column, $value, $this->filterData); // lưu các closure của filter
            }
        }
        // bắt đầu filter
        foreach ($filters as $filter) {
            if (is_callable($filter)) {
                $filter($query);
            }
        }

        return $query;
    }

    abstract protected function getOrderbyableFields();
    protected function isOrderbyable($field): bool
    {
        return in_array($field, $this->getOrderbyableFields(), true);
    }

    protected function mapFilters(): array
    {
        return [];
    }

    protected function filter($field, $value, $filters)
    {
        $maps = $this->mapFilters();
        return call_user_func($maps[$field], $value, $filters);
    }

    public function getOne(Request $request): ?array
    {
        $query = $this->newQuery();
        $id = $this->getRequestId($request);
        $item = $id ? $query->find($id) : null;
        if ($item instanceof BaseModel) {
            return $this->renderApi($item, $request);
        }
        return null;
    }

    protected function getRequestId(Request $request): string|null
    {
        return $request->route('id');
    }

    protected function beforeRenderGetMany($items, Request $request)
    {
        return $items;
    }


    private function getFields(Request $request): array
    {
        if (is_string($this->fieldsName)) {
            $allow_fields = $this->fields();
            return array_intersect($allow_fields, array_filter(explode(',', $request->query->get($this->fieldsName))));
        }
    }

    #[ArrayShape(['status' => "bool", 'data' => "array", 'meta' => "array"])]
    protected function renderApi($data, Request $request): array
    {
        $fields = $this->getFields($request);
        $meta = [
            'fields' => $this->fields(),
            'filter_fields' => array_keys($this->mapFilters()),
            'order_by_fields' => $this->getOrderbyableFields(),
        ];
        if ($data instanceof BaseModel) {
            $result = $this->item($data, $fields);
        } elseif ($data instanceof LengthAwarePaginator) {
            $result = $this->items($data->getCollection(), $fields);
            $meta['pagination'] = [
                'page' => $data->currentPage(),
                'perPage' => $data->perPage(),
                'total' => $data->total(),
                'lastPage' => $data->lastPage(),
            ];
        } elseif ($data instanceof ArrayAccess) {
            $result = $this->items($data, $fields);
        }

        return [
            'status' => true,
            'data' => $result ?? [],
            'meta' => $meta,
        ];
    }

    private function items(ArrayAccess $items, array $fields): array
    {
        $rows = [];
        foreach ($items as $item) {
            $row = $this->item($item, $fields);
            $rows[] = $row;
        }

        return $rows;
    }

    private function item($item, array $fields): array
    {
        $row = $item->id !== null ? ['id' => $item->id] : [];
        foreach ($fields as $field) {
            $name = "get_{$field}_value";
            $value = $item->{$field};
            if (method_exists($this, $name)) {
                $value = $this->$name($value, $item);
            }
            $row[$field] = $value;
        }
        if ($item->timestamps) {
            if ($item->created_at instanceof DateTime) {
                $row['created_at'] = $item->created_at->format('Y-m-d H:i:s');
            }
            if ($item->updated_at instanceof DateTime) {
                $row['updated_at'] = $item->updated_at->format('Y-m-d H:i:s');
            }
        }

        return $row;
    }

    protected function errorResult($e): Result
    {
        $message = method_exists($e, 'getMessage') ? $e->getMessage() : "";
        return new Result([
            'status' => false,
            'message' => $message,
        ]);
    }

    public function create($data): Result
    {
        try {
            DB::beginTransaction();
            $model = $this->make($data);
            $this->emit('creating', [$model]);
            $this->emit('saving', [$model]);
            $save = $model->save();
            $this->emit('created', [$model]);
            $this->emit('saved', [$model]);
            DB::commit();
            return new Result([
                'status' => $save,
                'model' => $model,
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResult($e);
        }
    }

    public function update($id, array $data): Result
    {
        try {
            $query = $this->updateQuery();
            $model = $query->find($id);
            if (!$model instanceof BaseModel) {
                throw new \RuntimeException("Record not found!");
            }
            DB::beginTransaction();
            $model->fill($data);
            $this->emit('updating', [$model]);
            $this->emit('saving', [$model]);
            $save = $model->save();
            $this->emit('updated', [$model]);
            $this->emit('saved', [$model]);
            DB::commit();
            return new Result([
                'status' => $save,
                'model' => $model,
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResult($e);
        }
    }

    public function delete($id): Result
    {
        try {
            $query = $this->destroyQuery();
            $model = $query->find($id);
            if (!$model instanceof BaseModel) {
                throw new \RuntimeException("Record not found!");
            }
            DB::beginTransaction();
            $this->emit('deleting', [$model]);
            $save = $model->delete();
            $this->emit('deleted', [$model]);
            DB::commit();
            return new Result([
                'status' => $save,
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResult($e);
        }
    }

}
