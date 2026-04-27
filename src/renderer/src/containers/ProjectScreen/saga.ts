// Step 2 ships the data layer only — workers come in step 3 (load / upload /
// add / update). Keeping a default-exported root saga so index.tsx's
// useInjectSaga call stays valid; it just yields nothing for now.

export default function* projectScreenSaga(): Generator {
  // intentionally empty
}
