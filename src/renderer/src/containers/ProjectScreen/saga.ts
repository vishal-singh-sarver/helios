// Root watcher for ProjectScreen.
//
// Coordinate state is synchronous, so there are no effects to take yet.
// When async flows are needed (loading a project from the backend,
// persisting coordinates, SSE streams, etc.), add workers here and wire
// them with takeLatest / takeEvery.

export default function* projectScreenSaga(): Generator {
  // Intentionally empty. Leave this function defined so the useInjectSaga
  // call in index.tsx has something to register.
}
