function PubSub<T extends Record<string, (...args: any[]) => void>>() {
  type Event = keyof T

  const callbacks = {} as Record<keyof T, Set<(...args: any[]) => void>>

  return {
    publish: <K extends Event>(event: K, ...args: Parameters<T[K]>) => {
      ;(callbacks[event] ?? []).forEach((cb) => cb(...args))
    },

    on: <K extends Event>(event: K, callback: T[K]) => {
      if (!callbacks[event]) {
        callbacks[event] = new Set()
      }

      callbacks[event].add(callback)
    },

    off: <K extends Event>(event: K, callback: T[K]) => {
      if (!callbacks[event]) {
        return
      }

      callbacks[event].delete(callback)
    },
  }
}

export default PubSub
