<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function sanitizeUtf8($data)
    {
        if (is_array($data)) {
            return array_map([$this, 'sanitizeUtf8'], $data);
        }
        if (is_object($data)) {
            if (method_exists($data, 'toArray')) {
                return $this->sanitizeUtf8($data->toArray());
            }

            return $data;
        }
        if (is_string($data)) {
            return mb_convert_encoding($data, 'UTF-8', 'UTF-8');
        }

        return $data;
    }

    protected function safeJson($data, int $status = 200, array $headers = [], int $options = 0)
    {
        return response()->json($this->sanitizeUtf8($data), $status, $headers, $options);
    }
}
