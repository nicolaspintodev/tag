<?php

namespace Database\Seeders;

use App\Models\Proveedor;
use App\Models\Unidad;
use Illuminate\Database\Seeder;

class UnidadSeeder extends Seeder
{
    public function run(): void
    {
        $proveedores = Proveedor::all();

        // Unidades propias (proveedor_id = null) - 5 (3 tractoras + 2 acoplados/semis)
        $propias = [
            [
                'patente' => 'ABC-123',
                'tipo' => 'tractora',
                'marca' => 'Mercedes-Benz',
                'modelo' => 'Actros',
                'anio' => 2023,
                'numero' => 'TR-001',
                'vtv_vencimiento' => '2027-12-31',
                'seguro_vencimiento' => '2027-12-31',
                'activo' => true,
            ],
            [
                'patente' => 'DEF-456',
                'tipo' => 'tractora',
                'marca' => 'Scania',
                'modelo' => 'R450',
                'anio' => 2022,
                'numero' => 'TR-002',
                'vtv_vencimiento' => '2027-06-30',
                'seguro_vencimiento' => '2027-06-30',
                'activo' => true,
            ],
            [
                'patente' => 'GHI-789',
                'tipo' => 'tractora',
                'marca' => 'Volvo',
                'modelo' => 'FH16',
                'anio' => 2024,
                'numero' => 'TR-003',
                'vtv_vencimiento' => '2028-12-31',
                'seguro_vencimiento' => '2028-12-31',
                'activo' => true,
            ],
            [
                'patente' => 'ACOP-001',
                'tipo' => 'acoplado',
                'marca' => 'Randon',
                'modelo' => 'SR',
                'anio' => 2021,
                'numero' => 'AC-001',
                'vtv_vencimiento' => '2027-03-31',
                'seguro_vencimiento' => '2027-03-31',
                'activo' => true,
            ],
            [
                'patente' => 'SEMI-001',
                'tipo' => 'semirremolque',
                'marca' => 'Fruehauf',
                'modelo' => 'Tautliner',
                'anio' => 2022,
                'numero' => 'SM-001',
                'vtv_vencimiento' => '2027-09-30',
                'seguro_vencimiento' => '2027-09-30',
                'activo' => true,
            ],
        ];

        foreach ($propias as $data) {
            Unidad::firstOrCreate(
                ['patente' => $data['patente']],
                array_merge($data, ['proveedor_id' => null])
            );
        }

        // Unidades tercerizadas - 8 (5 tractoras + 3 acoplados/semis)
        $tercerizadas = [
            // Proveedor 1: 2 tractoras + 1 acoplado
            [
                'proveedor_cuit' => '30-11111111-1',
                'patente' => 'JKL-012',
                'tipo' => 'tractora',
                'marca' => 'Iveco',
                'modelo' => 'Stralis',
                'anio' => 2023,
                'numero' => 'EXT-TR-01',
                'vtv_vencimiento' => '2027-12-31',
                'seguro_vencimiento' => '2027-12-31',
                'activo' => true,
            ],
            [
                'proveedor_cuit' => '30-11111111-1',
                'patente' => 'MNO-345',
                'tipo' => 'tractora',
                'marca' => 'MAN',
                'modelo' => 'TGX',
                'anio' => 2022,
                'numero' => 'EXT-TR-02',
                'vtv_vencimiento' => '2027-06-30',
                'seguro_vencimiento' => '2027-06-30',
                'activo' => true,
            ],
            [
                'proveedor_cuit' => '30-11111111-1',
                'patente' => 'EXT-AC-01',
                'tipo' => 'acoplado',
                'marca' => 'Randon',
                'modelo' => 'SR',
                'anio' => 2021,
                'numero' => 'EXT-AC-01',
                'vtv_vencimiento' => '2027-03-31',
                'seguro_vencimiento' => '2027-03-31',
                'activo' => true,
            ],
            // Proveedor 2: 1 tractora + 1 semirremolque
            [
                'proveedor_cuit' => '30-22222222-2',
                'patente' => 'PQR-678',
                'tipo' => 'tractora',
                'marca' => 'Mercedes-Benz',
                'modelo' => 'Actros',
                'anio' => 2024,
                'numero' => 'EXT-TR-03',
                'vtv_vencimiento' => '2028-12-31',
                'seguro_vencimiento' => '2028-12-31',
                'activo' => true,
            ],
            [
                'proveedor_cuit' => '30-22222222-2',
                'patente' => 'EXT-SM-01',
                'tipo' => 'semirremolque',
                'marca' => 'Fruehauf',
                'modelo' => 'Tautliner',
                'anio' => 2022,
                'numero' => 'EXT-SM-01',
                'vtv_vencimiento' => '2027-09-30',
                'seguro_vencimiento' => '2027-09-30',
                'activo' => true,
            ],
            // Proveedor 3: 1 tractora + 1 acoplado
            [
                'proveedor_cuit' => '30-33333333-3',
                'patente' => 'STU-901',
                'tipo' => 'tractora',
                'marca' => 'Volvo',
                'modelo' => 'FH16',
                'anio' => 2023,
                'numero' => 'EXT-TR-04',
                'vtv_vencimiento' => '2027-12-31',
                'seguro_vencimiento' => '2027-12-31',
                'activo' => true,
            ],
            [
                'proveedor_cuit' => '30-33333333-3',
                'patente' => 'EXT-AC-02',
                'tipo' => 'acoplado',
                'marca' => 'Randon',
                'modelo' => 'SR',
                'anio' => 2023,
                'numero' => 'EXT-AC-02',
                'vtv_vencimiento' => '2027-12-31',
                'seguro_vencimiento' => '2027-12-31',
                'activo' => true,
            ],
            // Proveedor 4: 1 tractora
            [
                'proveedor_cuit' => '30-44444444-4',
                'patente' => 'VWX-234',
                'tipo' => 'tractora',
                'marca' => 'Scania',
                'modelo' => 'R500',
                'anio' => 2024,
                'numero' => 'EXT-TR-05',
                'vtv_vencimiento' => '2028-12-31',
                'seguro_vencimiento' => '2028-12-31',
                'activo' => true,
            ],
        ];

        foreach ($tercerizadas as $data) {
            $proveedor = $proveedores->where('cuit', $data['proveedor_cuit'])->first();
            if ($proveedor) {
                $unidadData = $data;
                unset($unidadData['proveedor_cuit']);
                Unidad::firstOrCreate(
                    ['patente' => $unidadData['patente']],
                    array_merge($unidadData, ['proveedor_id' => $proveedor->id])
                );
            }
        }

        $this->command->info('Unidades creadas: '.Unidad::count().' (propios + tercerizados)');
    }
}
