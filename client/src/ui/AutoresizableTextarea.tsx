import React, { forwardRef, useCallback, useEffect, useRef } from 'react'

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minHeight: number
}

const AutoresizableTextarea = (
  { minHeight, ...props }: Props,
  ref: React.HTMLProps<HTMLTextAreaElement>['ref'],
) => {
  const initialStyles = useRef<CSSStyleDeclaration | null>(null)
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const prevHeight = useRef(0)

  const updateHeight = useCallback(() => {
    const ta = taRef.current
    if (!ta || !initialStyles.current) {
      return
    }

    const restoreScrollTops = cacheScrollTops(ta)

    // Reset height so scrollHeight gives the natural content height
    ta.style.height = 'auto'

    const { paddingTop, paddingBottom } = initialStyles.current

    const newHeight =
      ta.scrollHeight - (parseFloat(paddingTop) + parseFloat(paddingBottom))

    // remember scroll position
    // const { scrollTop } = ta

    if (newHeight !== prevHeight.current) {
      ta.style.height = `${newHeight}px`
      prevHeight.current = newHeight
    } else {
      ta.style.height = `${prevHeight.current}px`
    }

    restoreScrollTops()
    // ta.scrollTop = scrollTop
  }, [])

  const handleInput = useCallback(() => {
    updateHeight()
  }, [updateHeight])

  useEffect(() => {
    if (!taRef.current) {
      return
    }
    initialStyles.current = window.getComputedStyle(taRef.current)
    taRef.current.addEventListener('input', handleInput)

    updateHeight()

    return () => {
      if (!taRef.current) {
        return
      }
      taRef.current.removeEventListener('input', handleInput)
    }
  }, [handleInput])

  return (
    <textarea
      {...props}
      ref={(el: HTMLTextAreaElement | null) => {
        taRef.current = el
        if (ref) {
          if (typeof ref === 'function') {
            ref(el)
          } else {
            ;(ref as any).current = el
          }
        }
      }}
    />
  )
}

export default forwardRef(AutoresizableTextarea)

function cacheScrollTops(el: HTMLElement | null) {
  const out: [HTMLElement, number][] = []

  while (el && el.parentNode && el.parentNode instanceof HTMLElement) {
    if (el.parentNode.scrollTop) {
      out.push([el.parentNode, el.parentNode.scrollTop])
    }
    el = el.parentNode
  }

  return () =>
    out.forEach(([node, scrollTop]) => {
      node.style.scrollBehavior = 'auto'
      node.scrollTop = scrollTop
      node.style.scrollBehavior = ''
    })
}
