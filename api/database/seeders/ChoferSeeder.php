<?php

namespace Database\Seeders;

use App\Models\Chofer;
use App\Models\Proveedor;
use Illuminate\Database\Seeder;

class ChoferSeeder extends Seeder
{
    public function run(): void
    {
        $proveedores = Proveedor::all();

        // Choferes propios (proveedor_id = null) - 4
        $propios = [
            [
                'numero' => 'CH-001',
                'nombre' => 'Carlos',
                'apellido' => 'Rodríguez',
                'dni' => '25.123.456',
                'cuil' => '20-25123456-5',
                'telefono' => '11-4444-1111',
                'email' => 'carlos.rodriguez@tag.com.ar',
                'direccion' => 'Av. Rivadavia 1234, CABA',
                'fecha_nacimiento' => '1985-03-15',
                'licencia_vencimiento' => '2028-03-15',
                'activo' => true,
            ],
            [
                'numero' => 'CH-002',
                'nombre' => 'Miguel',
                'apellido' => 'Santos',
                'dni' => '27.987.654',
                'cuil' => '20-27987654-3',
                'telefono' => '11-4444-2222',
                'email' => 'miguel.santos@tag.com.ar',
                'direccion' => 'San Martín 567, CABA',
                'fecha_nacimiento' => '1982-07-22',
                'licencia_vencimiento' => '2027-07-22',
                'activo' => true,
            ],
            [
                'numero' => 'CH-003',
                'nombre' => 'Roberto',
                'apellido' => 'Fernández',
                'dni' => '30.555.777',
                'cuil' => '20-30555777-8',
                'telefono' => '11-4444-3333',
                'email' => 'roberto.fernandez@tag.com.ar',
                'direccion' => 'Belgrano 890, CABA',
                'fecha_nacimiento' => '1990-11-10',
                'licencia_vencimiento' => '2029-11-10',
                'activo' => true,
            ],
            [
                'numero' => 'CH-004',
                'nombre' => 'Jorge',
                'apellido' => 'López',
                'dni' => '28.333.444',
                'cuil' => '20-28333444-1',
                'telefono' => '11-4444-4444',
                'email' => 'jorge.lopez@tag.com.ar',
                'direccion' => 'Corrientes 2345, CABA',
                'fecha_nacimiento' => '1988-01-30',
                'licencia_vencimiento' => '2028-01-30',
                'activo' => true,
            ],
        ];

        foreach ($propios as $data) {
            Chofer::firstOrCreate(
                ['dni' => $data['dni']],
                array_merge($data, ['proveedor_id' => null])
            );
        }

        // Choferes tercerizados - 8 (2 por proveedor si hay 4 proveedores)
        $tercerizados = [
            // Proveedor 1
            [
                'proveedor_cuit' => '30-11111111-1',
                'numero' => 'EXT-001',
                'nombre' => 'Facundo',
                'apellido' => 'García',
                'dni' => '32.111.222',
                'cuil' => '20-32111222-4',
                'telefono' => '11-5555-1111',
                'email' => 'facundo.garcia@transporteslopez.com.ar',
                'direccion' => 'Ruta 8 Km 45, Pilar',
                'fecha_nacimiento' => '1987-05-18',
                'licencia_vencimiento' => '2028-05-18',
                'activo' => true,
            ],
            [
                'proveedor_cuit' => '30-11111111-1',
                'numero' => 'EXT-002',
                'nombre' => 'Lucas',
                'apellido' => 'Martínez',
                'dni' => '33.222.333',
                'cuil' => '20-33222333-7',
                'telefono' => '11-5555-2222',
                'email' => 'lucas.martinez@transporteslopez.com.ar',
                'direccion' => 'Ruta 8 Km 45, Pilar',
                'fecha_nacimiento' => '1991-09-25',
                'licencia_vencimiento' => '2029-09-25',
                'activo' => true,
            ],
            // Proveedor 2
            [
                'proveedor_cuit' => '30-22222222-2',
                'numero' => 'EXT-003',
                'nombre' => 'Andrés',
                'apellido' => 'Pereira',
                'dni' => '31.444.555',
                'cuil' => '20-31444555-2',
                'telefono' => '11-6666-1111',
                'email' => 'andres.pereira@logisticagos.com.ar',
                'direccion' => 'Av. Perón 3000, Avellaneda',
                'fecha_nacimiento' => '1984-12-03',
                'licencia_vencimiento' => '2027-12-03',
                'activo' => true,
            ],
            [
                'proveedor_cuit' => '30-22222222-2',
                'numero' => 'EXT-004',
                'nombre' => 'Diego',
                'apellido' => 'Silva',
                'dni' => '34.555.666',
                'cuil' => '20-34555666-9',
                'telefono' => '11-6666-2222',
                'email' => 'diego.silva@logisticagos.com.ar',
                'direccion' => 'Av. Perón 3000, Avellaneda',
                'fecha_nacimiento' => '1989-04-17',
                'licencia_vencimiento' => '2029-04-17',
                'activo' => true,
            ],
            // Proveedor 3
            [
                'proveedor_cuit' => '30-33333333-3',
                'numero' => 'EXT-005',
                'nombre' => 'Nicolás',
                'apellido' => 'Acosta',
                'dni' => '29.777.888',
                'cuil' => '20-29777888-6',
                'telefono' => '11-7777-1111',
                'email' => 'nicolas.acosta@fletesnorte.com.ar',
                'direccion' => 'Acceso Norte Km 32, Escobar',
                'fecha_nacimiento' => '1986-08-14',
                'licencia_vencimiento' => '2028-08-14',
                'activo' => true,
            ],
            [
                'proveedor_cuit' => '30-33333333-3',
                'numero' => 'EXT-006',
                'nombre' => 'Sebastián',
                'apellido' => 'Vega',
                'dni' => '35.888.999',
                'cuil' => '20-35888999-3',
                'telefono' => '11-7777-2222',
                'email' => 'sebastian.vega@fletesnorte.com.ar',
                'direccion' => 'Acceso Norte Km 32, Escobar',
                'fecha_nacimiento' => '1992-02-28',
                'licencia_vencimiento' => '2029-02-28',
                'activo' => true,
            ],
            // Proveedor 4
            [
                'proveedor_cuit' => '30-44444444-4',
                'numero' => 'EXT-007',
                'nombre' => 'Fernando',
                'apellido' => 'Rojas',
                'dni' => '26.999.000',
                'cuil' => '20-26999000-1',
                'telefono' => '11-8888-1111',
                'email' => 'fernando.rojas@transportessur.com.ar',
                'direccion' => 'Av. Hipólito Yrigoyen 4500, Lomas de Zamora',
                'fecha_nacimiento' => '1983-10-05',
                'licencia_vencimiento' => '2027-10-05',
                'activo' => true,
            ],
            [
                'proveedor_cuit' => '30-44444444-4',
                'numero' => 'EXT-008',
                'nombre' => 'Gabriel',
                'apellido' => 'Molina',
                'dni' => '36.111.222',
                'cuil' => '20-36111222-8',
                'telefono' => '11-8888-2222',
                'email' => 'gabriel.molina@transportewur.com.ar',
                'direccion' => 'Av. Hipólito Yrigoyen 4500, Lomas de Zamora',
                'fecha_nacimiento' => '1993-06-12',
                'licencia_vencimiento' => '2030-06-12',
                'activo' => true,
            ],
        ];

        foreach ($tercerizados as $data) {
            $proveedor = $proveedores->where('cuit', $data['proveedor_cuit'])->first();
            if ($proveedor) {
                $choferData = $data;
                unset($choferData['proveedor_cuit']);
                Chofer::firstOrCreate(
                    ['dni' => $choferData['dni']],
                    array_merge($choferData, ['proveedor_id' => $proveedor->id])
                );
            }
        }

        $this->command->info('Choferes creados: '.Chofer::count().' (propios + tercerizados)');
    }
}
