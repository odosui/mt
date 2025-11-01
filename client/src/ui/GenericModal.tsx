import { XIcon } from '@primer/octicons-react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { createPortal } from 'react-dom'

const GenericModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  contentLabel: string
  contentClass?: string
  children: React.ReactNode
}> = ({ isOpen, onClose, children, contentLabel, contentClass }) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="generic-modal-overlay"
          role="presentation"
          onClick={handleOverlayClick}
          // motion animation
          // appears from the top
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="generic-modal"
            aria-modal="true"
            role="dialog"
            aria-label={contentLabel}
            // motion animation
            // appears from the top
            initial={{ y: '-20vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-20vh', opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <a
              className="modalClose"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onClose()
              }}
            >
              <XIcon />
            </a>
            <div className={['generic-modal-content', contentClass].join(' ')}>
              {children}
            </div>
          </motion.div>
          ,
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default React.memo(GenericModal)
