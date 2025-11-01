import React, { memo, useCallback, useEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  onClickOutside: () => void
}

const ClickOutside = ({ children, onClickOutside }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClickOutside()
      }
    },
    [onClickOutside],
  )

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return <div ref={ref}>{children}</div>
}

export default memo(ClickOutside)
