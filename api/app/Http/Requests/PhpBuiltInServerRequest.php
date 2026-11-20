<?php
declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Http\Request;

class PhpBuiltInServerRequest extends Request
{
    public static function capture(): static
    {
        $request = new static();
        $content = file_get_contents('php://input') ?: '';

        $request->initialize(
            $_GET ?? [],
            [],
            [],
            $_COOKIE ?? [],
            $_FILES ?? [],
            $_SERVER ?? [],
            $content
        );

        if (in_array($request->getMethod(), ['PUT', 'PATCH', 'DELETE'], true) && $content !== '') {
            $contentType = $request->headers->get('CONTENT_TYPE') ?? '';

            if (str_contains($contentType, 'application/json')) {
                $data = json_decode($content, true);
            } elseif (str_contains($contentType, 'application/x-www-form-urlencoded')) {
                $data = [];
                parse_str($content, $data);
            } else {
                $data = null;
            }

            if (is_array($data)) {
                $request->request = new \Symfony\Component\HttpFoundation\InputBag($data);
            }
        }

        return $request;
    }
}
