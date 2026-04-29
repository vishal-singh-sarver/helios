---

## Goal
Let users (a) create weather columns whose data type and unit are picked from the loaded catalog (with both fields optional), and (b) edit name / data type / unit on any backend-managed weather column directly from its table header — each edit hits `PATCH /api/weather/project/{project_id}/scenario/{scenario_id}/weather_data_header/{header_id}` independently.

## Acceptance criteria

### Add Column dialog
- Fields: **Column Name** (required, max 50 chars), **Data Type** (optional dropdown of `selectAllDataTypes`), **Unit Type** (optional dropdown — populated from the selected Data Type's `units[]`; disabled when no Data Type is selected), **Enter Value** (optional).
- Selecting / changing Data Type clears the Unit selection (no auto-pick of base unit).
- Submit dispatches `addColumnRequested` with numeric `dataTypeId` / `dataUnitId` (or null) — existing saga / wire shape unchanged.
- Cancel resets the form.

### Inline header editor
- For backend-managed columns (header id present, i.e. column id is numeric), each header cell exposes:
  - editable column name (commits on blur if changed),
  - data-type dropdown (commits on change),
  - unit dropdown (commits on change; options come from the column's current data type — disabled when no data type set).
- Reserved date/time pseudo-columns and upload-slug columns (no header id) remain read-only.
- Each commit fires one PATCH with only the changed field; success keeps the optimistic local value, failure rolls it back.
- Changing the data type leaves the unit unchanged (do not auto-clear or auto-pick); the user is responsible for picking a compatible unit afterward — verified by visual sanity-check this pass.

### State + wire
- New service: `patchHeaderRequest(projectId, scenarioId, headerId, body)` → PATCH the header endpoint with a partial `{ name?, helios_data_type_id?, unit_id? }` body. `display_order` is **not** sent this pass.
- New actions: `UPDATE_COLUMN_REQUESTED` / `UPDATE_COLUMN_SUCCEEDED` / `UPDATE_COLUMN_FAILED` in ProjectScreen.
- Reducer applies the optimistic patch on `_REQUESTED`, no-op on `_SUCCEEDED`, restores the prior values on `_FAILED`.
- Saga: `takeEvery` PATCH worker that resolves the column id → header id (`Number(colId)`) and calls the service; only network errors trigger `_FAILED`.

## Affected files
- [src/renderer/src/utils/constants.ts](src/renderer/src/utils/constants.ts) — add `weather.headerPatch` route builder.
- [src/renderer/src/containers/Weather/service.ts](src/renderer/src/containers/Weather/service.ts) — `patchHeaderRequest`.
- [src/renderer/src/containers/ProjectScreen/constants.ts](src/renderer/src/containers/ProjectScreen/constants.ts) — `UPDATE_COLUMN_*` action types.
- [src/renderer/src/containers/ProjectScreen/actions.ts](src/renderer/src/containers/ProjectScreen/actions.ts) — payload type + action creators.
- [src/renderer/src/containers/ProjectScreen/reducer.ts](src/renderer/src/containers/ProjectScreen/reducer.ts) — optimistic patch + rollback.
- [src/renderer/src/containers/ProjectScreen/saga.ts](src/renderer/src/containers/ProjectScreen/saga.ts) — PATCH worker.
- [src/renderer/src/containers/Weather/AddColumnDialog.tsx](src/renderer/src/containers/Weather/AddColumnDialog.tsx) — catalog-driven Data Type + Unit Type fields.
- [src/renderer/src/containers/Weather/WeatherTable.tsx](src/renderer/src/containers/Weather/WeatherTable.tsx) — inline header editor.
- [src/renderer/src/containers/Weather/messages.ts](src/renderer/src/containers/Weather/messages.ts) — copy for the new fields.

## Constraints
- Out of scope: column reorder (`display_order`), column delete from header, server-side validation surfacing beyond rollback.
- Wire field names: `helios_data_type_id`, `unit_id` (snake_case, per the API).
- Reuse `selectAllDataTypes` (already populated on ProjectScreen mount). No new catalog fetch.
- Don't auto-select base unit when data type changes — user picks.
- Strict TS; no `any` without justification.
