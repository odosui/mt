import { useEffect } from 'react'

const MIN_HEIGHT = 128
const MAX_HEIGHT = 1024

function useResizable(
  cont: React.RefObject<HTMLDivElement>,
  resizeRef: React.RefObject<HTMLDivElement>,
  initialHeight: number | 'full',
  onResize?: (height: number | 'full') => void,
) {
  useEffect(() => {
    if (!cont.current) return

    // initial height
    if (initialHeight === 'full') {
      cont.current.style.height = 'auto'
    } else {
      cont.current.style.height = `${initialHeight}px`
    }

    // resize
    let startY = 0
    let startHeight = 0

    const onMouseMove = (e: MouseEvent) => {
      if (!cont.current) return

      const delta = e.clientY - startY
      const height = startHeight + delta

      if (height < MIN_HEIGHT || height > MAX_HEIGHT) return

      cont.current.style.height = `${height}px`
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)

      if (!cont.current) return

      const height = cont.current.offsetHeight
      onResize?.(height)
    }

    const onMouseDown = (e: MouseEvent) => {
      if (!cont.current) return

      startY = e.clientY
      startHeight = cont.current.offsetHeight

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    resizeRef.current?.addEventListener('mousedown', onMouseDown)

    // now on double click on resizeRef, we set the height to auto
    const onDoubleClick = () => {
      if (!cont.current) return

      cont.current.style.height = 'auto'
      onResize?.('full')
    }

    resizeRef.current?.addEventListener('dblclick', onDoubleClick)

    return () => {
      resizeRef.current?.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      resizeRef.current?.removeEventListener('dblclick', onDoubleClick)
    }
  }, [initialHeight, cont, resizeRef, onResize])
}

export default useResizable
