# Design System Constants - TAG Logística

> **Única fuente de verdad** para tokens de diseño, espaciado, tipografía y componentes.  
> Cualquier cambio visual debe actualizarse aquí primero.

---

## 1. Paleta de Colores

### 1.1 Colores Base (Neutros)
```css
--bg-body: #fafdff;           /* Fondo principal página */
--bg-card: #ffffff;           /* Fondo tarjetas, modales, tablas */
--bg-hover: #f8fafc;          /* Hover filas, botones outline */
--bg-active: #f1f5f9;         /* Activo/seleccionado */
--bg-primary: #0f172a;        /* Sidebar, texto principal oscuro */
--bg-primary-rgb: 15, 23, 42; /* RGB para overlays */

--text-main: #1e293b;         /* Texto principal */
--text-muted: #64748b;        /* Texto secundario, placeholders */
--text-invert: #ffffff;       /* Texto sobre fondos oscuros */

--border-color: #e2e8f0;      /* Bordes por defecto */
```

### 1.2 Colores de Estado (Semánticos)
```css
/* Success - Guardado, éxito, válido */
--color-success-bg: #dcfce7;
--color-success-text: #166534;
--color-success-border: #86efac;

/* Warning - Guardando, advertencia, CUIT inválido */
--color-warning-bg: #fef9c3;
--color-warning-text: #854d0e;
--color-warning-border: #fde047;

/* Danger - Error, archivado, crítico */
--color-danger-bg: #fee2e2;
--color-danger-text: #991b1b;
--color-danger-border: #fca5a5;

/* Info - Neutro, informativo */
--color-info-bg: #e0f2fe;
--color-info-text: #075985;
--color-info-border: #7dd3fc;
```

### 1.3 Colores de Marca (Accent)
```css
--brand-primary: #0f172a;     /* Azul oscuro principal */
--brand-primary-hover: #1e293b;
--brand-accent: #3b82f6;      /* Azul para links, focus */
--brand-accent-hover: #2563eb;
```

---

## 2. Espaciado (Spacing Scale)

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Uso por Componente
| Componente | Padding Interno | Gap | Margin |
|---|---|---|---|
| **Celda tabla** | `var(--space-2) var(--space-3)` | - | - |
| **Header toolbar** | `var(--space-3)` | `var(--space-3)` | `var(--space-3)` bottom |
| **Modal body** | `var(--space-5)` | `var(--space-4)` | - |
| **Card** | `var(--space-6)` | - | - |
| **Button** | `var(--space-2) var(--space-4)` | `var(--space-2)` | - |
| **Input** | `var(--space-2) var(--space-3)` | - | - |

---

## 3. Tipografía

```css
--font-family-base: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

--font-size-xs: 0.7rem;     /* 11px - badges, timestamps */
--font-size-sm: 0.75rem;    /* 12px - labels, ayuda */
--font-size-base: 0.875rem; /* 14px - body, inputs, celdas */
--font-size-lg: 1rem;       /* 16px - headers, botones */
--font-size-xl: 1.125rem;   /* 18px - títulos sección */
--font-size-2xl: 1.25rem;   /* 20px - título página */
--font-size-3xl: 1.5rem;    /* 24px - título modal */

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Jerarquía Visual
| Elemento | Size | Weight | Color |
|---|---|---|---|
| **Título página** | `2xl` | `semibold` | `text-main` |
| **Título sección** | `xl` | `semibold` | `text-main` |
| **Label campo** | `sm` | `medium` | `text-muted` |
| **Input / Celda** | `base` | `normal` | `text-main` |
| **Ayuda / Error** | `xs` | `normal` | `danger/warning` |
| **Toolbar count** | `sm` | `normal` | `text-muted` |

---

## 4. Bordes y Radio (Border Radius)

```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px - badges, chips */
--radius-md: 0.5rem;    /* 8px - inputs, botones, cards */
--radius-lg: 0.75rem;   /* 12px - modales, dropdowns */
--radius-xl: 1rem;      /* 16px - contenedores grandes */
--radius-full: 9999px;  /* badges, avatares */
```

### Por Componente
| Componente | Radius |
|---|---|
| **Input / Select / Button** | `md` |
| **Badge** | `full` |
| **Card / Modal / Dropdown** | `lg` |
| **Tabla contenedor** | `none` (tabla) / `md` (wrapper) |

---

## 5. Sombras (Shadows)

```css
--shadow-xs: 0 1px 1px 0 rgb(0 0 0 / 0.03);
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
```

### Uso
| Contexto | Shadow |
|---|---|
| **Card** | `sm` |
| **Modal / Dropdown** | `lg` |
| **Tooltip / Popover** | `md` |
| **Sidebar** | `xl` (right edge) |
| **Hover fila tabla** | `none` (bg change) |

---

## 6. Z-Index Scale

```css
--z-hide: -1;
--z-base: 0;
--z-dropdown: 100;      /* Dropdowns, autocomplete */
--z-sticky: 200;        /* Sticky headers, footers */
--z-overlay: 300;       /* Modals, drawers, dialogs */
--z-tooltip: 400;       /* Tooltips, popovers */
--z-toast: 500;         /* Notifications, toasts */
--z-max: 9999;          /* Solo para debug */
```

### Jerarquía Visual
| Capa | Z-Index | Ejemplos |
|---|---|---|
| **Contenido base** | `base` | Contenido página |
| **Sticky headers** | `sticky` | `thead` sticky, toolbar |
| **Dropdowns** | `dropdown` | Autocomplete, select |
| **Modals/Overlays** | `overlay` | Modal, drawer, confirm |
| **Tooltips** | `tooltip` | Tooltip, popover |
| **Notificaciones** | `toast` | Toast, snackbar |

---

## 7. Breakpoints (Responsive)

```css
--bp-xs: 320px;   /* Mobile pequeño */
--bp-sm: 480px;   /* Mobile */
--bp-md: 768px;   /* Tablet */
--bp-lg: 1024px;  /* Desktop pequeño */
--bp-xl: 1280px;  /* Desktop */
--bp-2xl: 1536px; /* Wide */
```

### Tabla Responsive
| Breakpoint | Comportamiento Tabla |
|---|---|
| `< md` | Scroll horizontal, columnas prioritarias |
| `md - lg` | Todas las columnas, acciones en dropdown |
| `> lg` | Todas visibles, acciones inline |

---

## 8. Componentes Específicos

### 8.1 Tabla / Grid (Data Table)

```css
/* Contenedor scroll */
.table-container {
  max-height: calc(100vh - var(--toolbar-height) - var(--header-height) - var(--space-6));
  overflow-y: auto;
  overflow-x: auto;
}

/* Tabla */
.datatable {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

/* Header sticky */
.datatable thead th {
  position: sticky;
  top: var(--toolbar-height); /* Debajo de toolbar */
  z-index: var(--z-sticky);
  background: var(--bg-body);
  padding: var(--space-2) var(--space-3);
  border-bottom: 2px solid var(--border-color);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

/* Footer sticky */
.datatable tfoot {
  position: sticky;
  bottom: 0;
  z-index: var(--z-sticky);
  background: var(--bg-body);
}

.datatable tfoot td {
  padding: 0;
  border-top: 1px solid var(--border-color);
}

/* Celdas */
.datatable td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-size-base);
  vertical-align: middle;
}

/* Hover */
.datatable tbody tr:hover {
  background: var(--bg-hover);
}

/* Columna Estado (primera) */
.col-estado {
  width: 44px;
  text-align: center;
  padding: var(--space-2) 0;
}

/* Columna Acciones (última) */
.col-acciones {
  width: 120px;
  text-align: center;
  padding: var(--space-2) 0;
}

/* Estado dot */
.state-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  box-sizing: border-box;
}

/* Row actions */
.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}

/* Add row button fixed */
.grid-add-row-fixed {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: transparent;
  color: var(--text-muted);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.grid-add-row-fixed:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* Cell states */
.grid-cell {
  cursor: cell;
}
.grid-cell.active {
  outline: 2px solid var(--brand-primary);
  outline-offset: -2px;
  z-index: 2;
  position: relative;
}
.grid-cell.cell-error { background: var(--color-danger-bg); }
.grid-cell.cell-warning { background: var(--color-warning-bg); }
```

### Anchos de Columna Estándar
| Columna | Ancho | Clase CSS |
|---|---|---|
| **Estado** | `44px` | `.col-estado` |
| **Acciones** | `120px` | `.col-acciones` |
| **Nombre/Razón Social** | `220px` | - |
| **CUIT** | `150px` | - |
| **Cond. IVA** | `170px` | - |
| **Teléfono** | `130px` | - |
| **Email** | `200px` | - |
| **Dirección** | `200px` | - |
| **Localidad** | `150px` | - |
| **Provincia** | `140px` | - |

---

### 8.2 Modal / Overlay

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgb(15 23 42 / 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: var(--z-overlay);
}

.modal {
  background: var(--bg-card);
  width: min(560px, 100%);
  max-height: 90vh;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  animation: modal-in 0.18s ease-out;
}

@keyframes modal-in {
  from { transform: translateY(8px) scale(0.98); opacity: 0; }
  to { transform: none; opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-color);
}

.modal-body {
  padding: var(--space-5);
  overflow-y: auto;
}

.modal-footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
```

---

### 8.3 Inputs / Form Controls

```css
.input-field {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--text-main);
  outline: none;
  background: var(--bg-card);
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
  min-height: 40px; /* Touch target */
}

.input-field:focus {
  border-color: var(--brand-accent);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.15);
}

.input-field::placeholder {
  color: var(--text-muted);
}

.input-field:disabled {
  background: var(--bg-hover);
  color: var(--text-muted);
  cursor: not-allowed;
}

/* Error state */
.input-field.error {
  border-color: var(--color-danger-text);
}

.input-field.error:focus {
  box-shadow: 0 0 0 3px rgb(153 27 27 / 0.15);
}

/* Select */
select.input-field {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-2) center;
  padding-right: var(--space-8);
}

/* Textarea */
textarea.input-field {
  resize: vertical;
  min-height: 80px;
  line-height: var(--line-height-normal);
}
```

---

### 8.3 Botones

```css
/* Base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s, opacity 0.15s;
  white-space: nowrap;
  min-height: 40px; /* Touch target */
}

/* Variants */
.btn-primary {
  background-color: var(--brand-primary);
  color: var(--text-invert);
  border-color: var(--brand-primary);
}
.btn-primary:hover { opacity: 0.9; }

.btn-outline {
  background-color: transparent;
  color: var(--text-main);
  border-color: var(--border-color);
}
.btn-outline:hover {
  background: var(--bg-hover);
}

.btn-danger {
  background-color: var(--color-danger-text);
  color: var(--text-invert);
}
.btn-danger:hover { opacity: 0.9; }

.btn-ghost {
  background-color: transparent;
  color: var(--text-muted);
  border-color: transparent;
  padding: var(--space-1) var(--space-2);
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* Sizes */
.btn-sm { padding: var(--space-1) var(--space-2); font-size: var(--font-size-sm); min-height: 32px; }
.btn-lg { padding: var(--space-3) var(--space-6); font-size: var(--font-size-lg); min-height: 48px; }

/* Icon button */
.btn-icon {
  padding: var(--space-1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

### 8.4 Toolbar

```css
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
  padding: var(--space-3) 0;
}

.search-field {
  position: relative;
  flex: 1 1 280px;
  max-width: 400px;
}

.search-field .input-field {
  padding-right: var(--space-10);
}

.search-clear {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: var(--space-1);
  display: inline-flex;
  border-radius: var(--radius-sm);
}

.search-clear:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  cursor: pointer;
}

.toolbar-count {
  margin-left: auto;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
```

---

## 9. Animaciones y Transiciones

```css
--duration-fast: 100ms;
--duration-normal: 150ms;
--duration-slow: 250ms;

--easing-ease: ease;
--easing-ease-out: ease-out;
--easing-ease-in-out: ease-in-out;
--easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Uso Estándar
| Propiedad | Duración | Easing |
|---|---|---|
| **Hover buttons/links** | `fast` | `ease` |
| **Focus ring** | `fast` | `ease-out` |
| **Modal enter** | `normal` | `ease-out` |
| **Modal exit** | `fast` | `ease-in` |
| **Toast enter/exit** | `normal` | `ease-out` |
| **Row hover** | `fast` | `ease` |
| **Tooltip** | `fast` | `ease-out` |

---

## 10. Estados de Celdas (Grid)

```css
/* Estados de guardado */
.cell-state-saving   { color: var(--color-warning-text); }
.cell-state-saved    { color: var(--color-success-text); }
.cell-state-error    { color: var(--color-danger-text); }

/* Validación inline */
.cell-error   { background: var(--color-danger-bg); }
.cell-warning { background: var(--color-warning-bg); }

/* Focus visible */
.grid-cell[tabindex="0"]:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: -2px;
}

/* Active cell */
.grid-cell.active {
  outline: 2px solid var(--brand-primary);
  outline-offset: -2px;
  z-index: 2;
  position: relative;
}
```

---

## 10. Estados de Guardado (Save States)

```css
.cell-save-state {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

/* Spinner inline */
.cell-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--border-color);
  border-top-color: var(--brand-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 11. Accessibility (a11y)

```css
/* Focus visible global */
*:focus-visible {
  outline: 2px solid var(--brand-accent);
  outline-offset: 2px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: var(--brand-primary);
  color: var(--text-invert);
  border-radius: var(--radius-md);
  z-index: var(--z-max);
  transition: top var(--duration-fast);
}
.skip-link:focus { top: var(--space-4); }

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast */
@media (prefers-contrast: high) {
  :root {
    --border-color: currentColor;
    --text-muted: currentColor;
  }
}
```

---

## 12. Print Styles

```css
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }

  .page-header,
  .toolbar,
  .table-footer-fixed,
  .overlay,
  .modal,
  .btn { display: none !important; }

  .clientes-page,
  .grid-container,
  .table-body-wrapper {
    height: auto !important;
    overflow: visible !important;
    max-height: none !important;
  }

  .datatable {
    page-break-inside: auto;
  }

  .datatable thead {
    display: table-header-group;
  }

  .datatable tbody {
    display: table-row-group;
  }

  .datatable tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  body {
    background: white;
    color: black;
  }
}
```

---

## 13. Checklist de Uso

Antes de hacer cualquier cambio visual:

- [ ] ¿El color ya existe en la paleta? → Usar variable existente
- [ ] ¿El espaciado sigue la escala? → Usar `var(--space-X)`
- [ ] ¿El radio coincide con el componente? → Ver tabla §4
- [ ] ¿La sombra corresponde a la elevación? → Ver tabla §5
- [ ] ¿El z-index respeta la jerarquía? → Ver §6
- [ ] ¿El color de estado es semántico? → Usar variables §1.2
- [ ] ¿El focus-visible es visible? → Test keyboard nav
- [ ] ¿El motion se reduce? → Test `prefers-reduced-motion`
- [ ] ¿El contraste pasa WCAG AA? → Test contraste 4.5:1

---

## 13. Versionado

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-11-13 | Versión inicial - Tokens base, tabla, modal, forms, toolbar |

---

> **Nota**: Este documento vive en `docs/design/DESIGN_CONSTANTS.md`. Cualquier PR que toque estilos debe actualizar este archivo.