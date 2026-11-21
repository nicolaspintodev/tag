<?php

namespace Database\Seeders;

use App\Enums\EstadoViaje;
use App\Models\Chofer;
use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Unidad;
use App\Models\User;
use App\Models\Viaje;
use Illuminate\Database\Seeder;

class RecursosSeeder extends Seeder
{
    public function run(): void
    {
        // ===== USUARIOS (3) =====
        $users = [
            ['email' => 'admin@tag.com', 'name' => 'Admin', 'password' => 'Admin2026!', 'role' => 'admin'],
            ['email' => 'ajguillen@logisticatag.com.ar', 'name' => 'Ángel J. Guillén', 'password' => 'Angel2026!', 'role' => 'operador'],
            ['email' => 'aczerpa@logisticatag.com.ar', 'name' => 'Ana C. Zerpa', 'password' => 'Ana2026!', 'role' => 'operador'],
        ];
        foreach ($users as $data) {
            User::firstOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'], 'password' => bcrypt($data['password']), 'role' => $data['role']]
            );
        }

        // ===== PROVEEDORES (6) =====
        $proveedoresData = [
            // De TestSeeder
            ['razon_social' => 'Fletero López', 'cuit' => '27-33333333-1', 'direccion' => 'Belgrano 890, Córdoba', 'telefono' => '0351 666-3333', 'email' => 'fletero.lopez@gmail.com'],
            ['razon_social' => 'Transportes del Sur', 'cuit' => '33-44444444-9', 'direccion' => 'Ruta 8 km 45, La Plata', 'telefono' => '0221 777-4444', 'email' => 'contacto@tessur.com.ar'],
            // CUITs que ChoferSeeder/UnidadSeeder esperaban (antes se omitían)
            ['razon_social' => 'Transportes López', 'cuit' => '30-11111111-1', 'direccion' => 'Ruta 8 Km 45, Pilar', 'telefono' => '0230 444-1111', 'email' => 'admin@transporteslopez.com.ar'],
            ['razon_social' => 'Transportes del Centro', 'cuit' => '30-22222222-2', 'direccion' => 'Av. San Martín 123, Rosario', 'telefono' => '0341 555-2222', 'email' => 'contacto@transportescentro.com.ar'],
            ['razon_social' => 'Logística Norte', 'cuit' => '30-33333333-3', 'direccion' => 'Calle 9 de Julio 456, Tucumán', 'telefono' => '0381 666-3333', 'email' => 'info@logisticnorte.com.ar'],
            ['razon_social' => 'Fletes del Litoral', 'cuit' => '30-44444444-4', 'direccion' => 'Ruta 11 Km 12, Santa Fe', 'telefono' => '0342 777-4444', 'email' => 'ventas@fleteslitoral.com.ar'],
        ];
        $proveedores = [];
        foreach ($proveedoresData as $data) {
            $proveedores[] = Proveedor::firstOrCreate(['cuit' => $data['cuit']], $data);
        }
        $proveedoresByCuit = collect($proveedores)->keyBy('cuit');

        // ===== CLIENTES (14) =====
        $clientesData = [
            // De TestSeeder
            ['razon_social' => 'Transporte SRL', 'cuit' => '30-71111111-9', 'direccion' => 'San Martín 1234, CABA', 'telefono' => '011 4444-1111', 'email' => 'info@transportesrl.com', 'contacto' => 'Mario Pérez', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '123-456789-0', 'localidad' => 'CABA', 'provincia' => 'Buenos Aires', 'codigo_postal' => '1004'],
            ['razon_social' => 'Distribuidora Norte', 'cuit' => '30-22222222-5', 'direccion' => 'Av. Industrial 567, Rosario', 'telefono' => '0341 555-2222', 'email' => 'logistica@distnorte.com', 'contacto' => 'Laura Gómez', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '901-234567-1', 'localidad' => 'Rosario', 'provincia' => 'Santa Fe', 'codigo_postal' => '2000'],
            // De ClienteSeeder (12)
            ['razon_social' => 'Tabacalera del Norte SA', 'nombre_administrativo' => 'Tabacal', 'cuit' => '30-50000123-9', 'direccion' => 'Ruta 9 Km 120', 'telefono' => '381-444-5555', 'email' => 'contacto@tabacalnorte.com.ar', 'contacto' => 'Ana Pérez', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '123-456789-0', 'localidad' => 'San Miguel de Tucumán', 'provincia' => 'Tucumán', 'codigo_postal' => '4000'],
            ['razon_social' => 'Transportes González SRL', 'nombre_administrativo' => 'González', 'cuit' => '30-50000456-4', 'direccion' => 'Av. Rivadavia 4500', 'telefono' => '11-4444-1010', 'email' => 'operaciones@tgonzalez.com.ar', 'contacto' => 'Marcelo González', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '901-234567-1', 'localidad' => 'CABA', 'provincia' => 'Buenos Aires', 'codigo_postal' => '1424'],
            ['razon_social' => 'Distribuidora Sur SA', 'nombre_administrativo' => 'Distribuidora Sur', 'cuit' => '30-50000789-1', 'direccion' => 'Av. Colón 800', 'telefono' => '11-4444-2020', 'email' => 'compras@distribuidorasur.com.ar', 'contacto' => 'Carlos Ruiz', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '456-789012-2', 'localidad' => 'Avellaneda', 'provincia' => 'Buenos Aires', 'codigo_postal' => '1870'],
            ['razon_social' => 'Frigorífico La Pampa SA', 'nombre_administrativo' => 'La Pampa', 'cuit' => '30-50001012-6', 'direccion' => 'Ruta 5 Km 600', 'telefono' => '233-444-3333', 'email' => 'logistica@frigorificolapampa.com.ar', 'contacto' => 'María López', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '789-012345-3', 'localidad' => 'Santa Rosa', 'provincia' => 'La Pampa', 'codigo_postal' => '6300'],
            ['razon_social' => 'Cerealera El Trigo SA', 'nombre_administrativo' => 'El Trigo', 'cuit' => '30-50001345-3', 'direccion' => 'Av. Mitre 1200', 'telefono' => '341-555-4444', 'email' => 'ventas@cerealeraeltrigo.com.ar', 'contacto' => 'Jorge Martínez', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '012-345678-4', 'localidad' => 'Rosario', 'provincia' => 'Santa Fe', 'codigo_postal' => '2000'],
            ['razon_social' => 'Maderera Los Pinos SRL', 'nombre_administrativo' => 'Los Pinos', 'cuit' => '30-50001678-0', 'direccion' => 'Ruta 14 Km 50', 'telefono' => '375-444-5555', 'email' => 'compras@madereralospinos.com.ar', 'contacto' => 'Roberto Fernández', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '345-678901-5', 'localidad' => 'Posadas', 'provincia' => 'Misiones', 'codigo_postal' => '3300'],
            ['razon_social' => 'Petrolera Austral SA', 'nombre_administrativo' => 'Austral', 'cuit' => '30-50001901-7', 'direccion' => 'Av. San Martín 2000', 'telefono' => '296-444-6666', 'email' => 'logistica@petroleraaustral.com.ar', 'contacto' => 'Patricia Gómez', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '678-901234-6', 'localidad' => 'Comodoro Rivadavia', 'provincia' => 'Chubut', 'codigo_postal' => '9000'],
            ['razon_social' => 'Química del Plata SRL', 'nombre_administrativo' => 'Química Plata', 'cuit' => '30-50002234-4', 'direccion' => 'Ruta 11 Km 80', 'telefono' => '342-555-7777', 'email' => 'operaciones@quimicadelplata.com.ar', 'contacto' => 'Daniel Sánchez', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '901-234567-7', 'localidad' => 'Santa Fe', 'provincia' => 'Santa Fe', 'codigo_postal' => '3000'],
            ['razon_social' => 'Constructoras Unidas SA', 'nombre_administrativo' => 'Constructoras Unidas', 'cuit' => '30-50002567-1', 'direccion' => 'Av. Libertador 3000', 'telefono' => '11-4444-8080', 'email' => 'compras@constructorasunidas.com.ar', 'contacto' => 'Lucía Torres', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '234-567890-8', 'localidad' => 'CABA', 'provincia' => 'Buenos Aires', 'codigo_postal' => '1426'],
            ['razon_social' => 'Alimentos del Valle SA', 'nombre_administrativo' => 'Alimentos Valle', 'cuit' => '30-50002890-8', 'direccion' => 'Ruta 7 Km 1100', 'telefono' => '261-555-9999', 'email' => 'logistica@alimentosdelvalle.com.ar', 'contacto' => 'Fernando Díaz', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '567-890123-9', 'localidad' => 'Mendoza', 'provincia' => 'Mendoza', 'codigo_postal' => '5500'],
            ['razon_social' => 'Textiles Andes SRL', 'nombre_administrativo' => 'Textiles Andes', 'cuit' => '30-50003123-5', 'direccion' => 'Av. Belgrano 500', 'telefono' => '387-444-1111', 'email' => 'ventas@textilesandes.com.ar', 'contacto' => 'Sofía Herrera', 'condicion_iva' => 'responsable_inscripto', 'ingresos_brutos' => '890-123456-0', 'localidad' => 'Salta', 'provincia' => 'Salta', 'codigo_postal' => '4400'],
        ];
        $clientes = [];
        foreach ($clientesData as $data) {
            $clientes[] = Cliente::firstOrCreate(['cuit' => $data['cuit']], $data);
        }

        // ===== CHOFERES (17) =====
        // 5 de TestSeeder
        $choferesTest = [
            ['numero' => 'CH-001', 'nombre' => 'Juan', 'apellido' => 'García', 'dni' => '30.111.111', 'cuil' => '30-11111111-1', 'telefono' => '11 2222-3333', 'licencia_vencimiento' => '2027-05-15', 'proveedor_id' => null],
            ['numero' => 'CH-002', 'nombre' => 'Carlos', 'apellido' => 'López', 'dni' => '28.222.222', 'cuil' => '28-22222222-2', 'telefono' => '11 3333-4444', 'licencia_vencimiento' => '2027-08-20', 'proveedor_id' => null],
            ['numero' => 'CH-003', 'nombre' => 'Pedro', 'apellido' => 'Ramírez', 'dni' => '32.333.333', 'cuil' => '32-33333333-3', 'telefono' => '11 4444-5555', 'licencia_vencimiento' => '2027-03-10', 'proveedor_id' => $proveedoresByCuit['30-11111111-1']->id],
            ['numero' => 'CH-004', 'nombre' => 'Miguel', 'apellido' => 'Torres', 'dni' => '34.666.666', 'cuil' => '34-66666666-4', 'telefono' => '11 7777-8888', 'licencia_vencimiento' => '2028-01-20', 'proveedor_id' => $proveedoresByCuit['30-11111111-1']->id],
            ['numero' => 'CH-005', 'nombre' => 'Luis', 'apellido' => 'Fernández', 'dni' => '31.444.444', 'cuil' => '31-44444444-5', 'telefono' => '11 5555-6666', 'licencia_vencimiento' => '2027-11-25', 'proveedor_id' => $proveedoresByCuit['33-44444444-9']->id],
        ];
        // 4 propios de ChoferSeeder (renumerados para evitar duplicar numero)
        $choferesPropios = [
            ['numero' => 'CH-006', 'nombre' => 'Carlos', 'apellido' => 'Rodríguez', 'dni' => '25.123.456', 'cuil' => '20-25123456-5', 'telefono' => '11-4444-1111', 'email' => 'carlos.rodriguez@tag.com.ar', 'direccion' => 'Av. Rivadavia 1234, CABA', 'fecha_nacimiento' => '1985-03-15', 'licencia_vencimiento' => '2028-03-15', 'activo' => true, 'proveedor_id' => null],
            ['numero' => 'CH-007', 'nombre' => 'Miguel', 'apellido' => 'Santos', 'dni' => '27.987.654', 'cuil' => '20-27987654-3', 'telefono' => '11-4444-2222', 'email' => 'miguel.santos@tag.com.ar', 'direccion' => 'San Martín 567, CABA', 'fecha_nacimiento' => '1982-07-22', 'licencia_vencimiento' => '2027-07-22', 'activo' => true, 'proveedor_id' => null],
            ['numero' => 'CH-008', 'nombre' => 'Roberto', 'apellido' => 'Fernández', 'dni' => '30.555.777', 'cuil' => '20-30555777-8', 'telefono' => '11-4444-3333', 'email' => 'roberto.fernandez@tag.com.ar', 'direccion' => 'Belgrano 890, CABA', 'fecha_nacimiento' => '1990-11-10', 'licencia_vencimiento' => '2029-11-10', 'activo' => true, 'proveedor_id' => null],
            ['numero' => 'CH-009', 'nombre' => 'Jorge', 'apellido' => 'López', 'dni' => '28.333.444', 'cuil' => '20-28333444-1', 'telefono' => '11-4444-4444', 'email' => 'jorge.lopez@tag.com.ar', 'direccion' => 'Corrientes 2345, CABA', 'fecha_nacimiento' => '1988-01-30', 'licencia_vencimiento' => '2028-01-30', 'activo' => true, 'proveedor_id' => null],
        ];
        // 8 tercerizados de ChoferSeeder (ahora con proveedores existentes)
        $choferesTercerizados = [
            ['proveedor_cuit' => '30-11111111-1', 'numero' => 'EXT-001', 'nombre' => 'Facundo', 'apellido' => 'García', 'dni' => '32.111.222', 'cuil' => '20-32111222-4', 'telefono' => '11-5555-1111', 'email' => 'facundo.garcia@transporteslopez.com.ar', 'direccion' => 'Ruta 8 Km 45, Pilar', 'fecha_nacimiento' => '1992-04-18', 'licencia_vencimiento' => '2028-04-18', 'activo' => true],
            ['proveedor_cuit' => '30-11111111-1', 'numero' => 'EXT-002', 'nombre' => 'Gonzalo', 'apellido' => 'Ruiz', 'dni' => '33.222.333', 'cuil' => '20-33222333-5', 'telefono' => '11-5555-2222', 'email' => 'gonzalo.ruiz@transporteslopez.com.ar', 'direccion' => 'Ruta 8 Km 45, Pilar', 'fecha_nacimiento' => '1989-09-25', 'licencia_vencimiento' => '2027-09-25', 'activo' => true],
            ['proveedor_cuit' => '30-22222222-2', 'numero' => 'EXT-003', 'nombre' => 'Hernán', 'apellido' => 'Morales', 'dni' => '34.333.444', 'cuil' => '20-34333444-6', 'telefono' => '11-5555-3333', 'email' => 'hernan.morales@transportescentro.com.ar', 'direccion' => 'Av. San Martín 123, Rosario', 'fecha_nacimiento' => '1991-01-12', 'licencia_vencimiento' => '2028-01-12', 'activo' => true],
            ['proveedor_cuit' => '30-22222222-2', 'numero' => 'EXT-004', 'nombre' => 'Iván', 'apellido' => 'Castro', 'dni' => '35.444.555', 'cuil' => '20-35444555-7', 'telefono' => '11-5555-4444', 'email' => 'ivan.castro@transportescentro.com.ar', 'direccion' => 'Av. San Martín 123, Rosario', 'fecha_nacimiento' => '1987-06-30', 'licencia_vencimiento' => '2027-06-30', 'activo' => true],
            ['proveedor_cuit' => '30-33333333-3', 'numero' => 'EXT-005', 'nombre' => 'Julián', 'apellido' => 'Ortega', 'dni' => '36.555.666', 'cuil' => '20-36555666-8', 'telefono' => '11-5555-5555', 'email' => 'julian.ortega@logisticnorte.com.ar', 'direccion' => 'Calle 9 de Julio 456, Tucumán', 'fecha_nacimiento' => '1993-03-22', 'licencia_vencimiento' => '2029-03-22', 'activo' => true],
            ['proveedor_cuit' => '30-33333333-3', 'numero' => 'EXT-006', 'nombre' => 'Kevin', 'apellido' => 'Vargas', 'dni' => '37.666.777', 'cuil' => '20-37666777-9', 'telefono' => '11-5555-6666', 'email' => 'kevin.vargas@logisticnorte.com.ar', 'direccion' => 'Calle 9 de Julio 456, Tucumán', 'fecha_nacimiento' => '1986-11-05', 'licencia_vencimiento' => '2027-11-05', 'activo' => true],
            ['proveedor_cuit' => '30-44444444-4', 'numero' => 'EXT-007', 'nombre' => 'Lucas', 'apellido' => 'Mendoza', 'dni' => '38.777.888', 'cuil' => '20-38777888-0', 'telefono' => '11-5555-7777', 'email' => 'lucas.mendoza@fleteslitoral.com.ar', 'direccion' => 'Ruta 11 Km 12, Santa Fe', 'fecha_nacimiento' => '1994-07-14', 'licencia_vencimiento' => '2029-07-14', 'activo' => true],
            ['proveedor_cuit' => '30-44444444-4', 'numero' => 'EXT-008', 'nombre' => 'Matías', 'apellido' => 'Rojas', 'dni' => '39.888.999', 'cuil' => '20-39888999-1', 'telefono' => '11-5555-8888', 'email' => 'matias.rojas@fleteslitoral.com.ar', 'direccion' => 'Ruta 11 Km 12, Santa Fe', 'fecha_nacimiento' => '1985-02-28', 'licencia_vencimiento' => '2027-02-28', 'activo' => true],
        ];

        $choferes = [];
        foreach ($choferesTest as $data) {
            $choferes[] = Chofer::firstOrCreate(['dni' => $data['dni']], $data);
        }
        foreach ($choferesPropios as $data) {
            $choferes[] = Chofer::firstOrCreate(['dni' => $data['dni']], $data);
        }
        foreach ($choferesTercerizados as $data) {
            $proveedor = $proveedoresByCuit[$data['proveedor_cuit']];
            unset($data['proveedor_cuit']);
            $data['proveedor_id'] = $proveedor->id;
            $choferes[] = Chofer::firstOrCreate(['dni' => $data['dni']], $data);
        }

        // ===== UNIDADES (20) =====
        // 7 de TestSeeder
        $unidadesTest = [
            ['patente' => 'TRA-001', 'marca' => 'Scania', 'modelo' => 'R450', 'tipo' => 'tractora', 'anio' => 2023, 'proveedor_id' => null],
            ['patente' => 'TRA-002', 'marca' => 'Volvo', 'modelo' => 'FH16', 'tipo' => 'tractora', 'anio' => 2023, 'proveedor_id' => null],
            ['patente' => 'TRA-003', 'marca' => 'Mercedes-Benz', 'modelo' => 'Actros', 'tipo' => 'tractora', 'anio' => 2023, 'proveedor_id' => null],
            ['patente' => 'TRA-004', 'marca' => 'Iveco', 'modelo' => 'Stralis', 'tipo' => 'tractora', 'anio' => 2024, 'proveedor_id' => null],
            ['patente' => 'TRA-005', 'marca' => 'Mercedes-Benz', 'modelo' => 'Actros', 'tipo' => 'tractora', 'anio' => 2023, 'proveedor_id' => null],
            ['patente' => 'ACO-001', 'marca' => 'Mercedes-Benz', 'modelo' => 'Actros', 'tipo' => 'acoplado', 'anio' => 2022, 'proveedor_id' => null],
            ['patente' => 'SEM-001', 'marca' => 'Scania', 'modelo' => 'R450', 'tipo' => 'semirremolque', 'anio' => 2023, 'proveedor_id' => null],
        ];
        // 5 propias de UnidadSeeder
        $unidadesPropias = [
            ['patente' => 'ABC-123', 'tipo' => 'tractora', 'marca' => 'Mercedes-Benz', 'modelo' => 'Actros', 'anio' => 2023, 'numero' => 'TR-001', 'vtv_vencimiento' => '2027-12-31', 'seguro_vencimiento' => '2027-12-31', 'activo' => true, 'proveedor_id' => null],
            ['patente' => 'DEF-456', 'tipo' => 'tractora', 'marca' => 'Scania', 'modelo' => 'R450', 'anio' => 2022, 'numero' => 'TR-002', 'vtv_vencimiento' => '2027-06-30', 'seguro_vencimiento' => '2027-06-30', 'activo' => true, 'proveedor_id' => null],
            ['patente' => 'GHI-789', 'tipo' => 'tractora', 'marca' => 'Volvo', 'modelo' => 'FH16', 'anio' => 2024, 'numero' => 'TR-003', 'vtv_vencimiento' => '2028-12-31', 'seguro_vencimiento' => '2028-12-31', 'activo' => true, 'proveedor_id' => null],
            ['patente' => 'ACOP-001', 'tipo' => 'acoplado', 'marca' => 'Randon', 'modelo' => 'SR', 'anio' => 2021, 'numero' => 'AC-001', 'vtv_vencimiento' => '2027-03-31', 'seguro_vencimiento' => '2027-03-31', 'activo' => true, 'proveedor_id' => null],
            ['patente' => 'SEMI-001', 'tipo' => 'semirremolque', 'marca' => 'Fruehauf', 'modelo' => 'Tautliner', 'anio' => 2022, 'numero' => 'SM-001', 'vtv_vencimiento' => '2027-09-30', 'seguro_vencimiento' => '2027-09-30', 'activo' => true, 'proveedor_id' => null],
        ];
        // 8 tercerizadas de UnidadSeeder (ahora con proveedores existentes)
        $unidadesTercerizadas = [
            ['proveedor_cuit' => '30-11111111-1', 'patente' => 'JKL-012', 'tipo' => 'tractora', 'marca' => 'Iveco', 'modelo' => 'Stralis', 'anio' => 2023, 'numero' => 'TR-004', 'vtv_vencimiento' => '2027-12-31', 'seguro_vencimiento' => '2027-12-31', 'activo' => true],
            ['proveedor_cuit' => '30-11111111-1', 'patente' => 'MNO-345', 'tipo' => 'tractora', 'marca' => 'Scania', 'modelo' => 'R450', 'anio' => 2022, 'numero' => 'TR-005', 'vtv_vencimiento' => '2027-06-30', 'seguro_vencimiento' => '2027-06-30', 'activo' => true],
            ['proveedor_cuit' => '30-11111111-1', 'patente' => 'PQR-678', 'tipo' => 'acoplado', 'marca' => 'Randon', 'modelo' => 'SR', 'anio' => 2023, 'numero' => 'AC-002', 'vtv_vencimiento' => '2028-12-31', 'seguro_vencimiento' => '2028-12-31', 'activo' => true],
            ['proveedor_cuit' => '30-22222222-2', 'patente' => 'STU-901', 'tipo' => 'tractora', 'marca' => 'Volvo', 'modelo' => 'FH16', 'anio' => 2024, 'numero' => 'TR-006', 'vtv_vencimiento' => '2029-12-31', 'seguro_vencimiento' => '2029-12-31', 'activo' => true],
            ['proveedor_cuit' => '30-22222222-2', 'patente' => 'VWX-234', 'tipo' => 'tractora', 'marca' => 'Mercedes-Benz', 'modelo' => 'Actros', 'anio' => 2023, 'numero' => 'TR-007', 'vtv_vencimiento' => '2028-12-31', 'seguro_vencimiento' => '2028-12-31', 'activo' => true],
            ['proveedor_cuit' => '30-22222222-2', 'patente' => 'YZA-567', 'tipo' => 'semirremolque', 'marca' => 'Fruehauf', 'modelo' => 'Tautliner', 'anio' => 2022, 'numero' => 'SM-002', 'vtv_vencimiento' => '2027-09-30', 'seguro_vencimiento' => '2027-09-30', 'activo' => true],
            ['proveedor_cuit' => '30-33333333-3', 'patente' => 'BCD-890', 'tipo' => 'tractora', 'marca' => 'Iveco', 'modelo' => 'Stralis', 'anio' => 2023, 'numero' => 'TR-008', 'vtv_vencimiento' => '2028-12-31', 'seguro_vencimiento' => '2028-12-31', 'activo' => true],
            ['proveedor_cuit' => '30-44444444-4', 'patente' => 'EFG-123', 'tipo' => 'tractora', 'marca' => 'Scania', 'modelo' => 'R450', 'anio' => 2024, 'numero' => 'TR-009', 'vtv_vencimiento' => '2029-12-31', 'seguro_vencimiento' => '2029-12-31', 'activo' => true],
        ];

        $unidades = [];
        foreach ($unidadesTest as $data) {
            $unidades[] = Unidad::firstOrCreate(['patente' => $data['patente']], $data);
        }
        foreach ($unidadesPropias as $data) {
            $unidades[] = Unidad::firstOrCreate(['patente' => $data['patente']], $data);
        }
        foreach ($unidadesTercerizadas as $data) {
            $proveedor = $proveedoresByCuit[$data['proveedor_cuit']];
            unset($data['proveedor_cuit']);
            $data['proveedor_id'] = $proveedor->id;
            $unidades[] = Unidad::firstOrCreate(['patente' => $data['patente']], $data);
        }

        // ===== VIAJES (10) =====
        // Reutilizar el dataset exacto de TestSeeder para mantener compatibilidad con tests
        // Mapear choferes/unidades por patente/dni para obtener IDs frescos
        $choferesByDni = collect($choferes)->keyBy('dni');
        $unidadesByPatente = collect($unidades)->keyBy('patente');
        $clientesByCuit = collect($clientes)->keyBy('cuit');
        $proveedoresById = collect($proveedores)->keyBy('id');

        $tractoras = $unidadesByPatente->filter(fn ($u) => in_array($u->tipo, ['tractora']))->values();
        $acoplados = $unidadesByPatente->filter(fn ($u) => in_array($u->tipo, ['acoplado', 'semirremolque']))->values();

        $viajesData = [
            // 1. Planificado - C1, T1, sin acoplado
            [
                'chofer_id' => $choferesByDni['30.111.111']->id,
                'cliente_id' => $clientesByCuit['30-71111111-9']->id,
                'proveedor_id' => null,
                'tractora_id' => $unidadesByPatente['TRA-001']->id,
                'acoplado_id' => null,
                'origen' => 'CABA',
                'destino' => 'Rosario',
                'fecha_salida' => '2026-07-20',
                'precio_pactado' => 100000,
                'costo_proveedor' => 80000,
                'estado' => EstadoViaje::PLANIFICADO,
                'facturado' => false,
                'liquidado' => false,
            ],
            // 2. Planificado - C2, T2, A1
            [
                'chofer_id' => $choferesByDni['28.222.222']->id,
                'cliente_id' => $clientesByCuit['30-22222222-5']->id,
                'proveedor_id' => null,
                'tractora_id' => $unidadesByPatente['TRA-002']->id,
                'acoplado_id' => $unidadesByPatente['ACO-001']->id,
                'origen' => 'Rosario',
                'destino' => 'Córdoba',
                'fecha_salida' => '2026-07-22',
                'precio_pactado' => 150000,
                'costo_proveedor' => 120000,
                'estado' => EstadoViaje::PLANIFICADO,
                'facturado' => false,
                'liquidado' => false,
            ],
            // 3. Iniciado - C3, T3, sin acoplado
            [
                'chofer_id' => $choferesByDni['32.333.333']->id,
                'cliente_id' => $clientesByCuit['30-71111111-9']->id,
                'proveedor_id' => $proveedoresByCuit['27-33333333-1']->id,
                'tractora_id' => $unidadesByPatente['TRA-003']->id,
                'acoplado_id' => null,
                'origen' => 'CABA',
                'destino' => 'Mendoza',
                'fecha_salida' => '2026-07-25',
                'precio_pactado' => 200000,
                'costo_proveedor' => 160000,
                'estado' => EstadoViaje::INICIADO,
                'facturado' => false,
                'liquidado' => false,
            ],
            // 4. Iniciado - C4, T4, A2
            [
                'chofer_id' => $choferesByDni['34.666.666']->id,
                'cliente_id' => $clientesByCuit['30-22222222-5']->id,
                'proveedor_id' => $proveedoresByCuit['33-44444444-9']->id,
                'tractora_id' => $unidadesByPatente['TRA-004']->id,
                'acoplado_id' => $unidadesByPatente['SEM-001']->id,
                'origen' => 'Rosario',
                'destino' => 'Bahía Blanca',
                'fecha_salida' => '2026-07-26',
                'precio_pactado' => 180000,
                'costo_proveedor' => 140000,
                'estado' => EstadoViaje::INICIADO,
                'facturado' => false,
                'liquidado' => false,
            ],
            // 5. Iniciado - C5, T5, sin acoplado
            [
                'chofer_id' => $choferesByDni['31.444.444']->id,
                'cliente_id' => $clientesByCuit['30-71111111-9']->id,
                'proveedor_id' => null,
                'tractora_id' => $unidadesByPatente['TRA-005']->id,
                'acoplado_id' => null,
                'origen' => 'Córdoba',
                'destino' => 'San Luis',
                'fecha_salida' => '2026-07-28',
                'precio_pactado' => 130000,
                'costo_proveedor' => 100000,
                'estado' => EstadoViaje::INICIADO,
                'facturado' => false,
                'liquidado' => false,
            ],
            // 6. Terminado - C1, T1, facturado
            [
                'chofer_id' => $choferesByDni['30.111.111']->id,
                'cliente_id' => $clientesByCuit['30-71111111-9']->id,
                'proveedor_id' => null,
                'tractora_id' => $unidadesByPatente['TRA-001']->id,
                'acoplado_id' => null,
                'origen' => 'CABA',
                'destino' => 'Rosario',
                'fecha_salida' => '2026-07-10',
                'precio_pactado' => 100000,
                'costo_proveedor' => 80000,
                'estado' => EstadoViaje::TERMINADO,
                'facturado' => true,
                'liquidado' => false,
            ],
            // 7. Terminado - C2, T2, A1, liquidado
            [
                'chofer_id' => $choferesByDni['28.222.222']->id,
                'cliente_id' => $clientesByCuit['30-22222222-5']->id,
                'proveedor_id' => null,
                'tractora_id' => $unidadesByPatente['TRA-002']->id,
                'acoplado_id' => $unidadesByPatente['ACO-001']->id,
                'origen' => 'Rosario',
                'destino' => 'Córdoba',
                'fecha_salida' => '2026-07-12',
                'precio_pactado' => 150000,
                'costo_proveedor' => 120000,
                'estado' => EstadoViaje::TERMINADO,
                'facturado' => false,
                'liquidado' => true,
            ],
            // 8. Terminado - C3, T3, facturado y liquidado
            [
                'chofer_id' => $choferesByDni['32.333.333']->id,
                'cliente_id' => $clientesByCuit['30-71111111-9']->id,
                'proveedor_id' => $proveedoresByCuit['27-33333333-1']->id,
                'tractora_id' => $unidadesByPatente['TRA-003']->id,
                'acoplado_id' => null,
                'origen' => 'CABA',
                'destino' => 'Mendoza',
                'fecha_salida' => '2026-07-15',
                'precio_pactado' => 200000,
                'costo_proveedor' => 160000,
                'estado' => EstadoViaje::TERMINADO,
                'facturado' => true,
                'liquidado' => true,
            ],
            // 9. Terminado - C4, T4, A2, sin flags
            [
                'chofer_id' => $choferesByDni['34.666.666']->id,
                'cliente_id' => $clientesByCuit['30-22222222-5']->id,
                'proveedor_id' => $proveedoresByCuit['33-44444444-9']->id,
                'tractora_id' => $unidadesByPatente['TRA-004']->id,
                'acoplado_id' => $unidadesByPatente['SEM-001']->id,
                'origen' => 'Rosario',
                'destino' => 'Bahía Blanca',
                'fecha_salida' => '2026-07-16',
                'precio_pactado' => 180000,
                'costo_proveedor' => 140000,
                'estado' => EstadoViaje::TERMINADO,
                'facturado' => false,
                'liquidado' => false,
            ],
            // 10. Terminado - C5, T5, facturado
            [
                'chofer_id' => $choferesByDni['31.444.444']->id,
                'cliente_id' => $clientesByCuit['30-71111111-9']->id,
                'proveedor_id' => null,
                'tractora_id' => $unidadesByPatente['TRA-005']->id,
                'acoplado_id' => null,
                'origen' => 'Córdoba',
                'destino' => 'San Luis',
                'fecha_salida' => '2026-07-18',
                'precio_pactado' => 130000,
                'costo_proveedor' => 100000,
                'estado' => EstadoViaje::TERMINADO,
                'facturado' => true,
                'liquidado' => false,
            ],
        ];

        foreach ($viajesData as $data) {
            Viaje::updateOrCreate(
                ['chofer_id' => $data['chofer_id'], 'cliente_id' => $data['cliente_id'], 'tractora_id' => $data['tractora_id'], 'fecha_salida' => $data['fecha_salida']],
                $data
            );
        }

        $this->command?->info('RecursosSeeder: completado (users, proveedores, clientes, choferes, unidades, viajes).');
    }
}
