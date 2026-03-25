import { eventChannel, END, EventChannel } from 'redux-saga'
import { BASE_URL } from './constants'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SseMessage<T = unknown> {
  type: string
  data: T
}

// ── Channel factory ───────────────────────────────────────────────────────────

/**
 * Creates a redux-saga EventChannel backed by an SSE connection.
 *
 * Usage inside a saga:
 *   const channel: SseChannel = yield call(createSseChannel, '/api/stream')
 *   try {
 *     while (true) {
 *       const { msg, stop } = yield race({ msg: take(channel), stop: take(SSE_DISCONNECT) })
 *       if (stop) break
 *       yield put(actions.sseEvent(msg))
 *     }
 *   } finally {
 *     channel.close()
 *   }
 *
 * @param path        - Path appended to BASE_URL (e.g. '/api/events')
 * @param namedEvents - Optional list of named SSE event types to listen to
 *                      (beyond the default `message` event)
 */
export type SseChannel<T = unknown> = EventChannel<SseMessage<T>>

export function createSseChannel<T = unknown>(
  path: string,
  namedEvents: string[] = []
): SseChannel<T> {
  return eventChannel<SseMessage<T>>((emit) => {
    const source = new EventSource(`${BASE_URL}${path}`)

    // Default `message` events
    source.onmessage = (e: MessageEvent) => {
      try {
        emit({ type: 'message', data: JSON.parse(e.data) as T })
      } catch {
        emit({ type: 'message', data: e.data as unknown as T })
      }
    }

    // Named event types (e.g. 'status', 'log', 'error')
    for (const eventType of namedEvents) {
      source.addEventListener(eventType, (e: Event) => {
        const me = e as MessageEvent
        try {
          emit({ type: eventType, data: JSON.parse(me.data) as T })
        } catch {
          emit({ type: eventType, data: me.data as unknown as T })
        }
      })
    }

    source.onerror = () => {
      emit(END) // closes the channel; saga's finally block runs
      source.close()
    }

    // Returned function is called when the channel is closed (saga cancel / END)
    return () => source.close()
  })
}
