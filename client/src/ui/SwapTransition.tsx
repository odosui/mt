import * as React from 'react'
import { useEffect, useState } from 'react'

type Shown = { key: string; children: React.ReactNode }

type Props = {
  itemKey: string
  className: string
  durationMs: number
  children: React.ReactNode
}

/**
 * When `itemKey` changes, keeps the previous content rendered with an
 * `is-leaving` class for `durationMs` while the new one enters with
 * `is-entering`. The very first item doesn't animate.
 */
const SwapTransition = ({ itemKey, className, durationMs, children }: Props) => {
  const [shown, setShown] = useState<Shown>({ key: itemKey, children })
  const [leaving, setLeaving] = useState<Shown | null>(null)
  const [hasSwapped, setHasSwapped] = useState(false)

  if (shown.key !== itemKey) {
    setLeaving(shown)
    setHasSwapped(true)
  }
  if (shown.key !== itemKey || shown.children !== children) {
    setShown({ key: itemKey, children })
  }

  useEffect(() => {
    if (!leaving) {
      return
    }
    const timer = setTimeout(() => setLeaving(null), durationMs)
    return () => clearTimeout(timer)
  }, [leaving, durationMs])

  return (
    <>
      {leaving && leaving.key !== itemKey && (
        <div key={leaving.key} className={`${className} is-leaving`}>
          {leaving.children}
        </div>
      )}
      <div
        key={itemKey}
        className={hasSwapped ? `${className} is-entering` : className}
      >
        {children}
      </div>
    </>
  )
}

export default SwapTransition
