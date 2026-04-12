import { TabIcon } from '@primer/octicons-react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { useRef } from 'react'

type Props = {
  visible: boolean
  toggleVisible: () => void
  className: string
  children: React.ReactNode
  onExitComplete?: () => void
}

const noop = () => {}

const SidePanel = ({
  visible,
  toggleVisible,
  className,
  children,
  onExitComplete,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <AnimatePresence initial={false} onExitComplete={onExitComplete || noop}>
      {visible && (
        <motion.div
          className="util-side-panel"
          ref={ref}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300, transition: { duration: 0.2 } }}
          transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
        >
          <div className={className}>
            <div className="util-side-panel-toggle" onClick={toggleVisible}>
              <TabIcon />
            </div>

            <div className="util-side-panel-content">{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SidePanel
