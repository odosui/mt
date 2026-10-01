import { TabIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useRef, useState } from 'react'
import { usePresence } from '../hooks/usePresence'

type Props = {
  visible: boolean
  toggleVisible: () => void
  className: string
  children: React.ReactNode
  onExitComplete?: () => void
}

const EXIT_MS = 200

const SidePanel = ({
  visible,
  toggleVisible,
  className,
  children,
  onExitComplete,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const { isMounted, isExiting } = usePresence(visible, EXIT_MS, onExitComplete)
  // A panel that is already open on first render shouldn't slide in.
  const [animateEnter, setAnimateEnter] = useState(!visible)

  if (!visible && !animateEnter) {
    setAnimateEnter(true)
  }

  if (!isMounted) {
    return null
  }

  const panelClass = [
    'util-side-panel',
    animateEnter && 'is-entering',
    isExiting && 'is-exiting',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={panelClass} ref={ref}>
      <div className={className}>
        <div className="util-side-panel-toggle" onClick={toggleVisible}>
          <TabIcon />
        </div>

        <div className="util-side-panel-content">{children}</div>
      </div>
    </div>
  )
}

export default SidePanel
