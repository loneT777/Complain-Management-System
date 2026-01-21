<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    /**
     * Apply search filter to query
     *
     * @param Builder $query
     * @param string $search
     * @param array $columns
     * @return Builder
     */
    public function scopeSearch(Builder $query, string $search, array $columns = []): Builder
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search, $columns) {
            foreach ($columns as $index => $column) {
                // Handle relationship columns (e.g., 'user.name')
                if (str_contains($column, '.')) {
                    [$relation, $field] = explode('.', $column, 2);
                    
                    if ($index === 0) {
                        $q->whereHas($relation, function ($subQ) use ($field, $search) {
                            $subQ->where($field, 'LIKE', "%{$search}%");
                        });
                    } else {
                        $q->orWhereHas($relation, function ($subQ) use ($field, $search) {
                            $subQ->where($field, 'LIKE', "%{$search}%");
                        });
                    }
                } else {
                    // Handle direct columns
                    if ($index === 0) {
                        $q->where($column, 'LIKE', "%{$search}%");
                    } else {
                        $q->orWhere($column, 'LIKE', "%{$search}%");
                    }
                }
            }
        });
    }

    /**
     * Get paginated response with standardized format
     *
     * @param \Illuminate\Contracts\Pagination\LengthAwarePaginator $items
     * @param bool $success
     * @param string|null $message
     * @return array
     */
    protected function paginatedResponse($items, bool $success = true, ?string $message = null): array
    {
        $response = [
            'success' => $success,
            'data' => $items->items(),
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
                'from' => $items->firstItem(),
                'to' => $items->lastItem()
            ]
        ];

        if ($message) {
            $response['message'] = $message;
        }

        return $response;
    }

    /**
     * Get standard error response
     *
     * @param string $message
     * @param \Exception|null $exception
     * @return array
     */
    protected function errorResponse(string $message, ?\Exception $exception = null): array
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($exception && config('app.debug')) {
            $response['error'] = $exception->getMessage();
        }

        return $response;
    }
}
