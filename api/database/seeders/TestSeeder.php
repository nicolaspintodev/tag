<?php

namespace Database\Seeders;

use App\Models\Chofer;
use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Unidad;
use App\Models\User;
use App\Models\Viaje;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        // Usuarios
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@tag.com',
            'password' => bcrypt('Admin2026!'),
        ]);

        User::create([
            'name' => 'Ángel J. Guillén',
            'email' => 'ajguillen@logisticatag.com.ar',
            'password' => bcrypt('Angel2026!'),
            'role' => 'operador',
        ]);

        User::create([
            'name' => 'Ana C. Zerpa',
            'email' => 'aczerpa@logisticatag.com.ar',
            'password' => bcrypt('Ana2026!'),
            'role' => 'operador',
        ]);

        // Limpiar viajes existentes
        DB::table('viajes')->truncate();

        // Clientes - usar firstOrCreate para evitar duplicados
        $clientesModels = collect([
            ['razon_social' => 'Transporte SRL', 'cuit' => '30-71111111-9', 'direccion' => 'San Martín 1234, CABA', 'telefono' => '011 4444-1111', 'email' => 'info@transportesrl.com', 'contacto' => 'Mario Pérez'],
            ['razon_social' => 'Distribuidora Norte', 'cuit' => '30-22222222-5', 'direccion' => 'Av. Industrial 567, Rosario', 'telefono' => '0341 555-2222', 'email' => 'logistica@distnorte.com', 'contacto' => 'Laura Gómez'],
        ])->map(fn ($c) => Cliente::firstOrCreate(['cuit' => $c['cuit']], $c));

        // Proveedores - usar firstOrCreate para evitar duplicados
        $proveedoresModels = collect([
            ['razon_social' => 'Fletero López', 'cuit' => '27-33333333-1', 'direccion' => 'Belgrano 890, Córdoba', 'telefono' => '0351 666-3333', 'email' => 'fletero.lopez@gmail.com'],
            ['razon_social' => 'Transportes del Sur', 'cuit' => '33-44444444-9', 'direccion' => 'Ruta 8 km 45, La Plata', 'telefono' => '0221 777-4444', 'email' => 'contacto@tessur.com.ar'],
        ])->map(fn ($p) => Proveedor::firstOrCreate(['cuit' => $p['cuit']], $p));

        // Choferes (5)
        $choferes = [
            ['numero' => 'CH-001', 'nombre' => 'Juan', 'apellido' => 'García', 'dni' => '30.111.111', 'cuil' => '30-11111111-1', 'telefono' => '11 2222-3333', 'licencia_vencimiento' => '2027-05-15', 'proveedor_id' => null],
            ['numero' => 'CH-002', 'nombre' => 'Carlos', 'apellido' => 'López', 'dni' => '28.222.222', 'cuil' => '28-22222222-2', 'telefono' => '11 3333-4444', 'licencia_vencimiento' => '2027-08-20', 'proveedor_id' => null],
            ['numero' => 'CH-003', 'nombre' => 'Pedro', 'apellido' => 'Ramírez', 'dni' => '32.333.333', 'cuil' => '32-33333333-3', 'telefono' => '11 4444-5555', 'licencia_vencimiento' => '2027-03-10', 'proveedor_id' => $proveedoresModels[0]->id],
            ['numero' => 'CH-004', 'nombre' => 'Miguel', 'apellido' => 'Torres', 'dni' => '34.666.666', 'cuil' => '34-66666666-4', 'telefono' => '11 7777-8888', 'licencia_vencimiento' => '2028-01-20', 'proveedor_id' => $proveedoresModels[0]->id],
            ['numero' => 'CH-005', 'nombre' => 'Luis', 'apellido' => 'Fernández', 'dni' => '31.444.444', 'cuil' => '31-44444444-5', 'telefono' => '11 5555-6666', 'licencia_vencimiento' => '2027-11-25', 'proveedor_id' => $proveedoresModels[1]->id],
        ];

        // Unidades: 5 tractoras + 2 acoplados/semirremolques
        $unidades = [
            // Tractora 1
            ['patente' => 'TRA-001', 'marca' => 'Scania', 'modelo' => 'R450', 'tipo' => 'tractora', 'anio' => 2023, 'proveedor_id' => null],
            // Tractora 2
            ['patente' => 'TRA-002', 'marca' => 'Volvo', 'modelo' => 'FH16', 'tipo' => 'tractora', 'anio' => 2023, 'proveedor_id' => null],
            // Tractora 3
            ['patente' => 'TRA-003', 'marca' => 'Mercedes-Benz', 'modelo' => 'Actros', 'tipo' => 'tractora', 'anio' => 2023, 'proveedor_id' => null],
            // Tractora 4
            ['patente' => 'TRA-004', 'marca' => 'Iveco', 'modelo' => 'Stralis', 'tipo' => 'tractora', 'anio' => 2024, 'proveedor_id' => null],
            // Tractora 5
            ['patente' => 'TRA-005', 'marca' => 'Mercedes-Benz', 'modelo' => 'Actros', 'tipo' => 'tractora', 'anio' => 2023, 'proveedor_id' => null],
            // Acoplado 1
            ['patente' => 'ACO-001', 'marca' => 'Mercedes-Benz', 'modelo' => 'Actros', 'tipo' => 'acoplado', 'anio' => 2022, 'proveedor_id' => null],
            // Acoplado 2
            ['patente' => 'SEM-001', 'marca' => 'Scania', 'modelo' => 'R450', 'tipo' => 'semirremolque', 'anio' => 2023, 'proveedor_id' => null],
        ];

        $choferesModels = collect($choferes)->map(fn ($c) => Chofer::create($c));
        $unidadesModels = collect($unidades)->map(fn ($u) => Unidad::create($u));

        // Separar tractoras y acoplados
        $tractoras = $unidadesModels->where('tipo', 'tractora')->values();
        $acoplados = $unidadesModels->whereIn('tipo', ['acoplado', 'semirremolque'])->values();

        // Crear 10 viajes según distribución
        $viajes = [
            // 1. Planificado - C1, T1, sin acoplado
            [
                'chofer_id' => $choferesModels[0]->id,
                'cliente_id' => $clientesModels[0]->id,
                'proveedor_id' => null,
                'tractora_id' => $tractoras[0]->id,
                'acoplado_id' => null,
                'origen' => 'CABA',
                'destino' => 'Rosario',
                'fecha_salida' => '2026-07-20',
                'precio_pactado' => 100000,
                'costo_proveedor' => 80000,
                'estado' => 'planificado',
                'facturado' => false,
                'liquidado' => false,
            ],
            // 2. Planificado - C2, T2, A1
            [
                'chofer_id' => $choferesModels[1]->id,
                'cliente_id' => $clientesModels[1]->id,
                'proveedor_id' => null,
                'tractora_id' => $tractoras[1]->id,
                'acoplado_id' => $acoplados[0]->id,
                'origen' => 'Rosario',
                'destino' => 'Córdoba',
                'fecha_salida' => '2026-07-22',
                'precio_pactado' => 150000,
                'costo_proveedor' => 120000,
                'estado' => 'planificado',
                'facturado' => false,
                'liquidado' => false,
            ],
            // 3. Iniciado - C3, T3, sin acoplado
            [
                'chofer_id' => $choferesModels[2]->id,
                'cliente_id' => $clientesModels[0]->id,
                'proveedor_id' => $proveedoresModels[0]->id,
                'tractora_id' => $tractoras[2]->id,
                'acoplado_id' => null,
                'origen' => 'CABA',
                'destino' => 'Mendoza',
                'fecha_salida' => '2026-07-25',
                'precio_pactado' => 200000,
                'costo_proveedor' => 160000,
                'estado' => 'iniciado',
                'facturado' => false,
                'liquidado' => false,
            ],
            // 4. Iniciado - C4, T4, A2
            [
                'chofer_id' => $choferesModels[3]->id,
                'cliente_id' => $clientesModels[1]->id,
                'proveedor_id' => $proveedoresModels[1]->id,
                'tractora_id' => $tractoras[3]->id,
                'acoplado_id' => $acoplados[1]->id,
                'origen' => 'Rosario',
                'destino' => 'Bahía Blanca',
                'fecha_salida' => '2026-07-26',
                'precio_pactado' => 180000,
                'costo_proveedor' => 140000,
                'estado' => 'iniciado',
                'facturado' => false,
                'liquidado' => false,
            ],
            // 5. Iniciado - C5, T5, sin acoplado
            [
                'chofer_id' => $choferesModels[4]->id,
                'cliente_id' => $clientesModels[0]->id,
                'proveedor_id' => null,
                'tractora_id' => $tractoras[4]->id,
                'acoplado_id' => null,
                'origen' => 'Córdoba',
                'destino' => 'San Luis',
                'fecha_salida' => '2026-07-28',
                'precio_pactado' => 130000,
                'costo_proveedor' => 100000,
                'estado' => 'iniciado',
                'facturado' => false,
                'liquidado' => false,
            ],
            // 6. Terminado - C1, T1, facturado
            [
                'chofer_id' => $choferesModels[0]->id,
                'cliente_id' => $clientesModels[0]->id,
                'proveedor_id' => null,
                'tractora_id' => $tractoras[0]->id,
                'acoplado_id' => null,
                'origen' => 'CABA',
                'destino' => 'Rosario',
                'fecha_salida' => '2026-07-10',
                'precio_pactado' => 100000,
                'costo_proveedor' => 80000,
                'estado' => 'terminado',
                'facturado' => true,
                'liquidado' => false,
            ],
            // 7. Terminado - C2, T2, A1, liquidado
            [
                'chofer_id' => $choferesModels[1]->id,
                'cliente_id' => $clientesModels[1]->id,
                'proveedor_id' => null,
                'tractora_id' => $tractoras[1]->id,
                'acoplado_id' => $acoplados[0]->id,
                'origen' => 'Rosario',
                'destino' => 'Córdoba',
                'fecha_salida' => '2026-07-12',
                'precio_pactado' => 150000,
                'costo_proveedor' => 120000,
                'estado' => 'terminado',
                'facturado' => false,
                'liquidado' => true,
            ],
            // 8. Terminado - C3, T3, facturado y liquidado
            [
                'chofer_id' => $choferesModels[2]->id,
                'cliente_id' => $clientesModels[0]->id,
                'proveedor_id' => $proveedoresModels[0]->id,
                'tractora_id' => $tractoras[2]->id,
                'acoplado_id' => null,
                'origen' => 'CABA',
                'destino' => 'Mendoza',
                'fecha_salida' => '2026-07-15',
                'precio_pactado' => 200000,
                'costo_proveedor' => 160000,
                'estado' => 'terminado',
                'facturado' => true,
                'liquidado' => true,
            ],
            // 9. Terminado - C4, T4, A2, sin flags
            [
                'chofer_id' => $choferesModels[3]->id,
                'cliente_id' => $clientesModels[1]->id,
                'proveedor_id' => $proveedoresModels[1]->id,
                'tractora_id' => $tractoras[3]->id,
                'acoplado_id' => $acoplados[1]->id,
                'origen' => 'Rosario',
                'destino' => 'Bahía Blanca',
                'fecha_salida' => '2026-07-16',
                'precio_pactado' => 180000,
                'costo_proveedor' => 140000,
                'estado' => 'terminado',
                'facturado' => false,
                'liquidado' => false,
            ],
            // 10. Terminado - C5, T5, facturado
            [
                'chofer_id' => $choferesModels[4]->id,
                'cliente_id' => $clientesModels[0]->id,
                'proveedor_id' => null,
                'tractora_id' => $tractoras[4]->id,
                'acoplado_id' => null,
                'origen' => 'Córdoba',
                'destino' => 'San Luis',
                'fecha_salida' => '2026-07-18',
                'precio_pactado' => 130000,
                'costo_proveedor' => 100000,
                'estado' => 'terminado',
                'facturado' => true,
                'liquidado' => false,
            ],
        ];

        foreach ($viajes as $viajeData) {
            Viaje::create($viajeData);
        }
    }
}
