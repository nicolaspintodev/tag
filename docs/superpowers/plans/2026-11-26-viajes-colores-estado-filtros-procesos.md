# Viajes: colores de Estado y filtros de procesos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restaurar badges con color en la columna `Estado` y reemplazar los checks sueltos `Facturado` / `Liquidado` por un dropdown de cuatro checks de procesos con lógica AND.

**Architecture:** El dropdown live en `Viajes.jsx` mantiene un estado temporal y aplica los filtros sólo al apretar `Aplicar`. `ViajeController::index` recibe cuatro params booleanos granulares y agrega `where(..., true)` por cada uno, por lo que varios checks se combinan con AND. La columna `Estado` pasa de texto plano a badges con clases CSS ya existentes en el tema.

**Tech Stack:** PHP 8.4 / Laravel 13; React + Vite; Vitest; ESLint.

**Spec:** `docs/superpowers/specs/2026-11-26-viajes-estado-colores-filtros-procesos-design.md`

## Global Constraints

- Sin migraciones ni cambios de base de datos.
- No usar el flag agregado legacy `liquidado` para filtrar ni colorear.
- Los checks del dropdown se aplican con el botón `Aplicar`, no al marcar/desmarcar.
- Múltiples checks marcados se combinan con AND (intersección).
- `Limpiar` desmarca todo y aplica sin filtros de procesos.
- No crear componentes reutilizables nuevos para el dropdown.
- Commit y push finales autorizados; sin merge.

## Review Focus

- Múltiples checks marcados: el viaje debe cumplir todos los flags; cubierto por `test_index_combina_filtros_de_procesos_con_and`.
- Ningún check marcado: no deben enviarse params y el listado queda sin filtro de procesos; cubierto por el test de `buildViajeProcessFilterParams` con objeto vacío.
- Params legacy: `liquidado=true` no debe filtrar porque legacy queda fuera; cubierto por `test_index_ignora_param_legacy_liquidado`.
- Estado vacío o desconocido: el badge debe mostrar `-` sin clase de color; cubierto por el test de render de estado desconocido.
- Cambios pendientes del dropdown: si se abre, se marcan checks y se cierra con click afuera, no deben aplicarse; cubierto por el smoke manual de la Task 4.

---

### Task 1: Filtros granulares en backend

**Files:**
- Modify: `api/app/Http/Controllers/ViajeController.php:68-74`
- Test: `api/tests/Feature/ViajeApiTest.php:116-125`

**Interfaces:**
- Consumes: query params booleanos `facturado`, `liquidado_cliente`, `liquidado_chofer`, `liquidado_proveedor` en `GET /api/viajes`.
- Produces: JSON filtrado; varios params presentes se combinan con AND.

- [ ] **Step 1: Write the failing tests**

Agregar estos métodos después de `test_index_lista_viajes` en `api/tests/Feature/ViajeApiTest.php`:

```php
    public function test_index_filtra_por_flag_de_proceso(): void
    {
        $conCliente = $this->crearViaje(['origen' => 'Con cliente', 'liquidado_cliente' => true]);
        $conChofer = $this->crearViaje(['origen' => 'Con chofer', 'liquidado_chofer' => true]);
        $facturado = $this->crearViaje(['origen' => 'Facturado', 'facturado' => true]);

        $this->getJson('/api/viajes?liquidado_cliente=true')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $conCliente->id])
            ->assertJsonMissing(['id' => $conChofer->id])
            ->assertJsonMissing(['id' => $facturado->id]);
    }

    public function test_index_combina_filtros_de_procesos_con_and(): void
    {
        $ambos = $this->crearViaje([
            'origen' => 'Ambos',
            'liquidado_cliente' => true,
            'facturado' => true,
        ]);
        $soloCliente = $this->crearViaje([
            'origen' => 'Solo cliente',
            'liquidado_cliente' => true,
            'facturado' => false,
        ]);
        $soloFacturado = $this->crearViaje([
            'origen' => 'Solo facturado',
            'liquidado_cliente' => false,
            'facturado' => true,
        ]);

        $this->getJson('/api/viajes?liquidado_cliente=true&facturado=true')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $ambos->id])
            ->assertJsonMissing(['id' => $soloCliente->id])
            ->assertJsonMissing(['id' => $soloFacturado->id]);
    }

    public function test_index_ignora_param_legacy_liquidado(): void
    {
        $legacy = $this->crearViaje(['origen' => 'Legacy', 'liquidado' => true]);
        $normal = $this->crearViaje(['origen' => 'Normal', 'liquidado' => false]);

        $this->getJson('/api/viajes?liquidado=true')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $legacy->id])
            ->assertJsonFragment(['id' => $normal->id]);
    }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `C:/php84/php.exe vendor/bin/pint --test && C:/php84/php.exe artisan test --filter=ViajeApiTest`

Expected: FAIL en los tres tests nuevos; el controller todavía filtra por `liquidado` y no conoce los params granulares.

- [ ] **Step 3: Write minimal implementation**

En `api/app/Http/Controllers/ViajeController.php`, reemplazar:

```php
        if ($request->filled('facturado') && $request->boolean('facturado')) {
            $query->where('facturado', true);
        }

        if ($request->filled('liquidado') && $request->boolean('liquidado')) {
            $query->where('liquidado', true);
        }
```

por:

```php
        foreach ([
            'facturado' => 'facturado',
            'liquidado_cliente' => 'liquidado_cliente',
            'liquidado_proveedor' => 'liquidado_proveedor',
            'liquidado_chofer' => 'liquidado_chofer',
        ] as $param => $column) {
            if ($request->boolean($param)) {
                $query->where($column, true);
            }
        }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `C:/php84/php.exe vendor/bin/pint --test && C:/php84/php.exe artisan test --filter=ViajeApiTest`

Expected: PASS con los tres tests nuevos y los existentes.

---

### Task 2: Helper de params y badge de Estado

**Files:**
- Modify: `client/src/lib/columns/viajes.jsx:48-56`
- Modify: `client/src/lib/columns/viajes.test.js:1-2,91-99`
- Modify: `client/src/index.css:407-410`

**Interfaces:**
- Consumes: `ESTADO_LABELS`.
- Produces: `buildViajeProcessFilterParams(filters = {})` devuelve un objeto con los params `'true'` correspondientes a los flags verdaderos; `estadoRender` devuelve un badge con clase de color.

- [ ] **Step 1: Write the failing tests**

En `client/src/lib/columns/viajes.test.js`, reemplazar la importación:

```js
import { buildViajeProcesosView, buildViajesDetailFields, buildViajesGridColumns } from './viajes';
```

por:

```js
import {
  buildViajeProcessFilterParams,
  buildViajeProcesosView,
  buildViajesDetailFields,
  buildViajesGridColumns,
} from './viajes';
```

Reemplazar el bloque `describe('buildViajesGridColumns estado', ...)`:

```js
describe('buildViajesGridColumns estado', () => {
  it('muestra badge con color y texto completo', () => {
    const column = buildViajesGridColumns().find(item => item.id === 'estado');

    expect(column.render('planificado', {}).props).toMatchObject({
      className: 'estado-badge estado-badge-planificado',
      children: 'Planificado',
    });
    expect(column.render('iniciado', {}).props).toMatchObject({
      className: 'estado-badge estado-badge-iniciado',
      children: 'Iniciado',
    });
    expect(column.render('terminado', {}).props).toMatchObject({
      className: 'estado-badge estado-badge-terminado',
      children: 'Terminado',
    });
  });

  it('muestra badge neutral y guion para estado desconocido', () => {
    const column = buildViajesGridColumns().find(item => item.id === 'estado');

    expect(column.render('', {}).props).toMatchObject({
      className: 'estado-badge',
      children: '-',
    });
  });
});

describe('buildViajeProcessFilterParams', () => {
  it('devuelve objeto vacío cuando no hay filtros', () => {
    expect(buildViajeProcessFilterParams({})).toEqual({});
    expect(buildViajeProcessFilterParams({
      liquidado_cliente: false,
      liquidado_chofer: false,
      liquidado_proveedor: false,
      facturado: false,
    })).toEqual({});
  });

  it('incluye solamente los filtros marcados', () => {
    expect(buildViajeProcessFilterParams({
      liquidado_cliente: true,
      liquidado_chofer: false,
      liquidado_proveedor: false,
      facturado: true,
    })).toEqual({
      liquidado_cliente: 'true',
      facturado: 'true',
    });
  });

  it('combina los cuatro filtros', () => {
    expect(buildViajeProcessFilterParams({
      liquidado_cliente: true,
      liquidado_chofer: true,
      liquidado_proveedor: true,
      facturado: true,
    })).toEqual({
      liquidado_cliente: 'true',
      liquidado_chofer: 'true',
      liquidado_proveedor: 'true',
      facturado: 'true',
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/columns/viajes.test.js`

Expected: FAIL por `buildViajeProcessFilterParams` no definido y por `className` distinto de `estado-badge`.

- [ ] **Step 3: Write minimal implementation**

En `client/src/lib/columns/viajes.jsx`, reemplazar:

```js
const estadoRender = (v) => (
  <span className="estado-texto">{ESTADO_LABELS[v] ?? v ?? '-'}</span>
);
```

por:

```js
const ESTADO_BADGE_CLASSES = {
  planificado: 'estado-badge estado-badge-planificado',
  iniciado: 'estado-badge estado-badge-iniciado',
  terminado: 'estado-badge estado-badge-terminado',
};

const estadoRender = (v) => (
  <span className={ESTADO_BADGE_CLASSES[v] ?? 'estado-badge'}>{ESTADO_LABELS[v] ?? v ?? '-'}</span>
);

const PROCESO_FILTER_KEYS = [
  'liquidado_cliente',
  'liquidado_chofer',
  'liquidado_proveedor',
  'facturado',
];

export const buildViajeProcessFilterParams = (filters = {}) => PROCESO_FILTER_KEYS.reduce((params, key) => {
  if (filters[key]) params[key] = 'true';
  return params;
}, {});
```

En `client/src/index.css`, reemplazar:

```css
.estado-texto {
  color: var(--text-main);
  font-weight: 500;
}
```

por:

```css
.estado-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.estado-badge-planificado {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.estado-badge-iniciado {
  background: var(--color-info-bg);
  color: var(--color-info-text);
}

.estado-badge-terminado {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/columns/viajes.test.js`

Expected: PASS con los tests de badge y helper.

---

### Task 3: Estado del dropdown y wiring de filtros

**Files:**
- Modify: `client/src/pages/Viajes.jsx:12-16,30-37,99-116,160-173`

**Interfaces:**
- Consumes: `buildViajeProcessFilterParams(filters)` de `client/src/lib/columns/viajes.jsx`.
- Produces: `processFilters` aplicado, `draftProcessFilters` temporal y `fetchRows` con los params del helper.

- [ ] **Step 1: Establish the red state**

Run: `npm run dev` desde `client` y abrir la pantalla de Viajes.

Expected: la toolbar muestra los checks sueltos `Facturado` y `Liquidado`; no existe dropdown `Procesos`.

- [ ] **Step 2: Add module constants**

Agregar antes de `const Viajes = () => {` en `client/src/pages/Viajes.jsx`:

```js
const PROCESS_FILTER_KEYS = [
  'liquidado_cliente',
  'liquidado_chofer',
  'liquidado_proveedor',
  'facturado',
];

const PROCESS_FILTER_OPTIONS = [
  { key: 'liquidado_cliente', label: 'L. Cliente' },
  { key: 'liquidado_chofer', label: 'L. Chofer' },
  { key: 'liquidado_proveedor', label: 'L. Proveedor' },
  { key: 'facturado', label: 'Facturado' },
];

const emptyProcessFilters = () => Object.fromEntries(PROCESO_FILTER_KEYS.map(key => [key, false]));
```

- [ ] **Step 3: Replace filter state**

Reemplazar:

```js
  const [facturadoFilter, setFacturadoFilter] = useState(false); // false=all, true=facturado
  const [liquidadoFilter, setLiquidadoFilter] = useState(false);
```

por:

```js
  const [processFilters, setProcessFilters] = useState(emptyProcessFilters);
  const [draftProcessFilters, setDraftProcessFilters] = useState(emptyProcessFilters);
  const [processMenuOpen, setProcessMenuOpen] = useState(false);
  const processMenuRef = useRef(null);
```

- [ ] **Step 4: Wire fetchRows**

En la importación de `../lib/columns/viajes`, agregar `buildViajeProcessFilterParams`:

```js
import {
  buildViajesGridColumns,
  buildViajesDetailFields,
  buildViajeProcesosView,
  buildViajeProcessFilterParams,
} from '../lib/columns/viajes';
```

En `fetchRows`, reemplazar:

```js
    const facturadoValue = overrides.facturadoValue ?? facturadoFilter;
    const liquidadoValue = overrides.liquidadoValue ?? liquidadoFilter;
```

por:

```js
    const processValues = overrides.processValues ?? processFilters;
```

Reemplazar:

```js
      facturado: facturadoValue === true ? 'true' : undefined,
      liquidado: liquidadoValue === true ? 'true' : undefined,
```

por:

```js
      ...buildViajeProcessFilterParams(processValues),
```

- [ ] **Step 5: Replace filter handlers**

Reemplazar:

```js
  const handleFacturadoFilterChange = (checked) => {
    setFacturadoFilter(checked);
    fetchRows({ facturadoValue: checked });
  };

  const handleLiquidadoFilterChange = (checked) => {
    setLiquidadoFilter(checked);
    fetchRows({ liquidadoValue: checked });
  };
```

por:

```js
  const handleApplyProcessFilters = () => {
    setProcessFilters(draftProcessFilters);
    setProcessMenuOpen(false);
    fetchRows({ processValues: draftProcessFilters });
  };

  const handleClearProcessFilters = () => {
    const empty = emptyProcessFilters();
    setProcessFilters(empty);
    setDraftProcessFilters(empty);
    setProcessMenuOpen(false);
    fetchRows({ processValues: empty });
  };
```

Agregar después del `useEffect` existente de carga de catálogos:

```js
  useEffect(() => {
    if (!processMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (processMenuRef.current && !processMenuRef.current.contains(event.target)) {
        setProcessMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [processMenuOpen]);
```

- [ ] **Step 6: Run tests to confirm no regressions**

Run: `npm test`

Expected: PASS con la suite frontend; el dropdown aún no se renderiza pero el helper y el badge ya están cubiertos.

---

### Task 4: Dropdown visual y estilos

**Files:**
- Modify: `client/src/pages/Viajes.jsx:326-380`
- Modify: `client/src/index.css:576-578`

**Interfaces:**
- Consumes: `PROCESS_FILTER_OPTIONS`, `draftProcessFilters`, `handleApplyProcessFilters`, `handleClearProcessFilters` de la Task 3.
- Produces: toolbar con dropdown `Procesos`, checks y botones `Aplicar` / `Limpiar`.

- [ ] **Step 1: Add active-count derivation**

Agregar después de `const selected = useMemo(...)`:

```js
  const activeProcessFilterCount = Object.values(processFilters).filter(Boolean).length;
```

- [ ] **Step 2: Replace toolbar checkboxes**

Reemplazar los dos `<label>` de `Facturado` y `Liquidado` en la toolbar por:

```jsx
            <div className="process-filter" ref={processMenuRef}>
              <Button variant="outline" size="sm" onClick={() => setProcessMenuOpen(open => !open)}>
                <Filter size={14} />
                {activeProcessFilterCount > 0 ? `Procesos (${activeProcessFilterCount})` : 'Procesos'}
              </Button>
              {processMenuOpen && (
                <div className="process-filter-menu">
                  {PROCESS_FILTER_OPTIONS.map(({ key, label }) => (
                    <label key={key} className="process-filter-option">
                      <input
                        type="checkbox"
                        checked={Boolean(draftProcessFilters[key])}
                        onChange={(event) => setDraftProcessFilters(prev => ({ ...prev, [key]: event.target.checked }))}
                      />
                      {label}
                    </label>
                  ))}
                  <div className="process-filter-actions">
                    <Button variant="ghost" size="sm" onClick={handleClearProcessFilters}>Limpiar</Button>
                    <Button size="sm" onClick={handleApplyProcessFilters}>Aplicar</Button>
                  </div>
                </div>
              )}
            </div>
```

- [ ] **Step 3: Add dropdown CSS**

Reemplazar:

```css
.filter-select {
  max-width: 200px;
}
```

por:

```css
.filter-select {
  max-width: 200px;
}

.process-filter {
  position: relative;
  margin-left: 0.5rem;
}

.process-filter-menu {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  z-index: 20;
  min-width: 200px;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.process-filter-option {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  color: var(--text-main);
  white-space: nowrap;
  cursor: pointer;
}

.process-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}
```

- [ ] **Step 4: Smoke test the UI**

Run: `npm run dev` desde `client` y abrir la pantalla de Viajes.

Expected:
- La columna `Estado` muestra badges con fondo y texto completo.
- La toolbar ya no muestra los checks sueltos.
- El botón `Procesos` abre un menú con `L. Cliente`, `L. Chofer`, `L. Proveedor`, `Facturado`, `Limpiar` y `Aplicar`.
- Marcar `L. Cliente` + `Facturado` no cambia la grilla hasta apretar `Aplicar`.
- Después de `Aplicar`, el botón muestra `Procesos (2)` y la grilla contiene solamente viajes con ambos flags.
- `Limpiar` desmarca todo, cierra el menú y devuelve el listado sin filtros de procesos.
- Abrir, marcar un check y hacer click afuera cierra el menú sin aplicar; el botón sigue sin contador.

---

### Task 5: Verificación final y commit

**Files:**
- Verify: `api/app/Http/Controllers/ViajeController.php`
- Verify: `api/tests/Feature/ViajeApiTest.php`
- Verify: `client/src/index.css`
- Verify: `client/src/lib/columns/viajes.jsx`
- Verify: `client/src/lib/columns/viajes.test.js`
- Verify: `client/src/pages/Viajes.jsx`

**Interfaces:**
- Consumes: cambios de las Tasks 1-4.
- Produces: commit pusheado en `fix/liquidaciones`, sin merge.

- [ ] **Step 1: Run frontend verification**

Run: `npm test && npm run lint && npm run build`

Expected: PASS; `npm test` debe terminar con todos los test files y tests en verde, incluyendo los cinco tests nuevos de helper y badge.

- [ ] **Step 2: Run backend verification**

Run: `C:/php84/php.exe vendor/bin/pint --test && C:/php84/php.exe artisan test`

Expected: PASS con Pint y la suite completa; los tests nuevos de filtros deben aparecer como passed.

- [ ] **Step 3: Inspect git state**

Run: `git status --short && git diff --check && git diff --stat && git log --oneline -5`

Expected: sólo los seis archivos de esta implementación como modified; sin untracked inesperados; `git diff --check` sin salida.

- [ ] **Step 4: Stage and commit**

Run:

```bash
git add -- api/app/Http/Controllers/ViajeController.php api/tests/Feature/ViajeApiTest.php client/src/index.css client/src/lib/columns/viajes.jsx client/src/lib/columns/viajes.test.js client/src/pages/Viajes.jsx
git commit -m "feat(viajes): colorear estados y filtrar procesos"
```

Expected: commit creado con seis archivos modifications.

- [ ] **Step 5: Push**

Run: `git push origin fix/liquidaciones`

Expected: push aceptado; `git status -sb` muestra `fix/liquidaciones...origin/fix/liquidaciones` sin adelantos ni cambios locales.
