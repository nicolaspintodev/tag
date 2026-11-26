# Integración de `fix/liquidaciones` a `develop` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar `fix/liquidaciones` en `develop` con un único PR, verificación local, CI verde y merge commit.

**Architecture:** Se conserva el historial ya publicado de la rama, se agregan dos commits (docs y cambios pendientes), se abre un PR contra `develop` y se mergea con merge commit. No se reescribe historial.

**Tech Stack:** Git, GitHub CLI (`gh`), GitHub Actions, Laravel 13/PHP 8.4, React/Vite.

**Spec:** `docs/superpowers/specs/2026-11-26-integracion-prs-develop-design.md`

## Global Constraints

- Base `develop`; head `fix/liquidaciones`.
- `origin/develop` = `568b2e5`; no crear PRs para ramas ya integradas.
- No push directo a `develop` o `main`; no force-push; no stash ni reset.
- Merge commit, sin squash ni rebase.
- No secretos, `.env`, bases ni datos reales de clientes.
- PR #106 queda intacto.
- El botón azul oscuro se valida visualmente; no llevará test automático.

## Review Focus

- Botón sin entidad con fondo azul oscuro y texto invertido: verificación visual/manual.
- Botón con entidad vuelve a `outline`: `client/src/components/liquidacion/LiquidacionToolbar.test.js`.
- `ConfirmDialog` default rojo: `client/src/components/ui/ConfirmDialog.test.js`.
- Diálogo “Pasar a pendiente” primary: `client/src/components/ui/ConfirmDialog.test.js`.
- Conflicto con `origin/develop` en `index.css`: `git merge-tree` + CI.

---

### Task 1: Documentación de la integración

**Files:**
- Create: `docs/superpowers/specs/2026-11-26-integracion-prs-develop-design.md`
- Create: `docs/superpowers/plans/2026-11-26-integracion-prs-develop.md`

**Interfaces:**
- Consumes: aprobación del usuario sobre alcance y estrategia.
- Produces: spec y plan versionados en la rama.

- [ ] **Step 1: Escribir la spec**

Contenido obligatorio: objetivo, alcance (`fix/liquidaciones` solamente), decisiones (1 PR, merge commit, sin force-push), cambios incluidos, verificación, PR, riesgos y criterios de aceptación.

- [ ] **Step 2: Escribir el plan**

Usar este archivo con tareas ejecutables y comandos exactos.

- [ ] **Step 3: Commitear los docs**

```bash
git add docs/superpowers/specs/2026-11-26-integracion-prs-develop-design.md docs/superpowers/plans/2026-11-26-integracion-prs-develop.md
git commit -m "docs: spec y plan de integración a develop"
```

---

### Task 2: Commit de los cambios pendientes

**Files:**
- Modify: `client/src/components/liquidacion/LiquidacionDetailModal.jsx`
- Modify: `client/src/components/liquidacion/LiquidacionToolbar.jsx`
- Modify: `client/src/components/ui/ConfirmDialog.jsx`
- Modify: `client/src/index.css`
- Test: `client/src/components/liquidacion/LiquidacionToolbar.test.js`
- Test: `client/src/components/ui/ConfirmDialog.test.js`

**Interfaces:**
- Consumes: working tree actual de `fix/liquidaciones`.
- Produces: commit `fix(liquidaciones): ajustar confirmación y resaltar entidad`.

- [ ] **Step 1: Verificar archivos a incluir**

```bash
git status --short
git diff --check
```

Expected: aparecen exactamente los 6 archivos anteriores; `index.css.test.js` no aparece.

- [ ] **Step 2: Stagear sólo esos archivos**

```bash
git add client/src/components/liquidacion/LiquidacionDetailModal.jsx client/src/components/liquidacion/LiquidacionToolbar.jsx client/src/components/ui/ConfirmDialog.jsx client/src/index.css client/src/components/liquidacion/LiquidacionToolbar.test.js client/src/components/ui/ConfirmDialog.test.js
git diff --cached --stat
```

Expected: 6 archivos; 0 secretos ni `.env`.

- [ ] **Step 3: Commitear**

```bash
git commit -m "fix(liquidaciones): ajustar confirmación y resaltar entidad"
```

---

### Task 3: Verificación local y revisión

**Files:**
- No se modifican archivos en esta tarea.

**Interfaces:**
- Consumes: commits de Task 1 y Task 2.
- Produces: evidencia verde y aprobación de revisión antes del PR.

- [ ] **Step 1: Verificar frontend**

```bash
cd client && npm test && npm run lint && npm run build
```

Expected: 14 test files, 114 tests, lint sin errores, build exitoso.

- [ ] **Step 2: Verificar backend**

```bash
cd api && composer test && composer lint
```

Expected: tests y Pint sin errores.

- [ ] **Step 3: Detectar conflictos con `develop`**

```bash
cd ..
BASE=$(git merge-base origin/develop HEAD)
git merge-tree "$BASE" origin/develop HEAD
```

Expected: sin secciones de conflicto.

- [ ] **Step 4: Revisar el diff con subagente**

Base: `568b2e5`. Head: SHA obtenido con `git rev-parse HEAD`. Usar el template `code-reviewer.md`. Corregir Critical e Important con commits nuevos antes de continuar.

---

### Task 4: Push y Pull Request

**Files:**
- Create fuera del repo: `C:/Users/nclpn/AppData/Local/Temp/opencode/pr-body-fix-liquidaciones.md`

**Interfaces:**
- Consumes: verificación y revisión de Task 3.
- Produces: PR abierto y URL reportada.

- [ ] **Step 1: Pushear la rama**

```bash
git push origin fix/liquidaciones
```

Expected: fast-forward desde `c62bad9`; sin rechazo.

- [ ] **Step 2: Escribir el cuerpo del PR**

```markdown
## Qué cambia

- Colorea los estados de viajes y filtra procesos en la vista de Viajes.
- Muestra procesos y montos de liquidaciones en el detalle de viaje.
- Ajusta `ConfirmDialog` para permitir variante primary y la aplica al pasar una liquidación a pendiente.
- Resalta con azul oscuro el botón para elegir cliente/chofer cuando falta la entidad.
- Agrega tests de resaltado y de variantes del diálogo de confirmación.

## Issue relacionado

- Ninguno.

## Cómo probar

- [x] `cd api && composer test`
- [x] `cd api && composer lint`
- [x] `cd client && npm test`
- [x] `cd client && npm run lint`
- [x] `cd client && npm run build`
- [ ] Verificación manual de colores y diálogo en la UI.

## Checklist

- [x] No se incluyeron secretos, `.env`, bases ni datos reales de clientes.
- [x] Se incluyeron spec y plan de la integración.
- [x] Se ejecutaron tests y verificaciones locales.
- [x] El cambio está acotado a una sola rama corta.
```

- [ ] **Step 3: Crear el PR**

```bash
gh pr create --base develop --head fix/liquidaciones --title "feat(viajes): colorear estados, filtrar procesos y ajustes de liquidación" --body-file "C:/Users/nclpn/AppData/Local/Temp/opencode/pr-body-fix-liquidaciones.md"
```

Expected: URL del PR reportada al usuario.

---

### Task 5: CI y merge

**Files:**
- No se modifican archivos en esta tarea.

**Interfaces:**
- Consumes: PR abierto de Task 4.
- Produces: PR mergeado en `develop` o correcciones en la rama.

- [ ] **Step 1: Obtener número de PR**

```bash
PR_NUMBER=$(gh pr view --json number --jq .number fix/liquidaciones)
```

- [ ] **Step 2: Esperar checks**

```bash
gh pr checks "$PR_NUMBER" --watch
```

Expected: `backend` y `frontend` verdes.

- [ ] **Step 3: Corregir si falla**

Si un check falla, leer `gh run view --log-failed`, corregir en `fix/liquidaciones`, pushear y volver a Step 2. No mergear con checks rojos.

- [ ] **Step 4: Mergear**

```bash
gh pr merge "$PR_NUMBER" --merge
```

Expected: PR `MERGED`, merge commit creado en `develop`.

---

### Task 6: Verificación post-merge

**Files:**
- No se modifican archivos en esta tarea.

**Interfaces:**
- Consumes: PR mergeado.
- Produces: reporte final con URL y SHA.

- [ ] **Step 1: Confirmar estado del PR**

```bash
gh pr view "$PR_NUMBER" --json state,mergedAt,url,mergeCommit
```

Expected: `state = MERGED`, `mergedAt` presente.

- [ ] **Step 2: Confirmar head de `develop`**

```bash
git fetch origin develop
git log -1 --oneline origin/develop
```

Expected: el commit es el merge del PR.

- [ ] **Step 3: Reportar resultado**

Incluir URL del PR, SHA del merge, checks y aclarar que PR #106 y la rama local quedan intactos.
