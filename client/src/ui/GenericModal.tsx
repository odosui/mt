import { XIcon } from '@primer/octicons-react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { usePresence } from '../hooks/usePresence'

const EXIT_MS = 200

const GenericModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  contentLabel: string
  contentClass?: string
  children: React.ReactNode
}> = ({ isOpen, onClose, children, contentLabel, contentClass }) => {
  const { isMounted, isExiting } = usePresence(isOpen, EXIT_MS)

  if (!isMounted) {
    return null
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className={
        isExiting ? 'generic-modal-overlay is-exiting' : 'generic-modal-overlay'
      }
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div
        className="generic-modal"
        aria-modal="true"
        role="dialog"
        aria-label={contentLabel}
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
      </div>
    </div>,
    document.body,
  )
}

export default React.memo(GenericModal)
