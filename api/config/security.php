<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Política de contraseñas
    |--------------------------------------------------------------------------
    |
    | Requisitos mínimos para contraseñas de usuarios. La expiración e
    | historial quedan diferidos hasta que exista gestión de usuarios.
    |
    */

    'password' => [
        'min_length' => (int) env('PASSWORD_MIN_LENGTH', 8),
    ],

];
