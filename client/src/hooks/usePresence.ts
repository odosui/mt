import { useEffect, useRef, useState } from 'react'

/**
 * Keeps an element mounted for `exitMs` after `visible` turns false, so a CSS
 * exit animation can play before it is removed. `isExiting` is true meanwhile.
 */
export function usePresence(
  visible: boolean,
  exitMs: number,
  onExitComplete?: () => void,
): { isMounted: boolean; isExiting: boolean } {
  const [isMounted, setIsMounted] = useState(visible)

  if (visible && !isMounted) {
    setIsMounted(true)
  }

  const onExitCompleteRef = useRef(onExitComplete)
  onExitCompleteRef.current = onExitComplete

  useEffect(() => {
    if (visible || !isMounted) {
      return
    }
    const timer = setTimeout(() => {
      setIsMounted(false)
      onExitCompleteRef.current?.()
    }, exitMs)
    return () => clearTimeout(timer)
  }, [visible, isMounted, exitMs])

  return { isMounted, isExiting: isMounted && !visible }
}
