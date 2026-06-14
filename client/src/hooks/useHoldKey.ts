import { useEffect, useRef, useState } from 'react'

type UseHoldKeyOptions = {
  /** The key (KeyboardEvent.key) to hold, e.g. 'm'. */
  key: string
  /** How long the key must be held, in milliseconds. */
  durationMs: number
  /** Fires once the key has been held for `durationMs` without releasing. */
  onComplete: () => void
  /** When false, the listeners are detached and nothing fires. */
  enabled?: boolean
}

const isTypingTarget = (target: EventTarget | null) => {
  const el = target as HTMLElement | null
  if (!el) return false
  return (
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
  )
}

/**
 * Detects holding a single key for a sustained duration. Returns `holding`,
 * which is true while the key is being held, so callers can drive a progress
 * animation. Ignores key auto-repeat, modifier combos and typing in inputs.
 */
export function useHoldKey({
  key,
  durationMs,
  onComplete,
  enabled = true,
}: UseHoldKeyOptions): { holding: boolean } {
  const [holding, setHolding] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep a stable ref to the latest callback so the listeners don't re-bind.
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!enabled) {
      return
    }

    const cancel = () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
      setHolding(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== key || e.repeat || e.metaKey || e.ctrlKey || e.altKey) {
        return
      }
      if (isTypingTarget(e.target) || timer.current) {
        return
      }
      setHolding(true)
      timer.current = setTimeout(() => {
        timer.current = null
        setHolding(false)
        onCompleteRef.current()
      }, durationMs)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === key) {
        cancel()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', cancel)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', cancel)
      cancel()
    }
  }, [key, durationMs, enabled])

  return { holding }
}
