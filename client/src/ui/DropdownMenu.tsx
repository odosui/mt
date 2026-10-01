import React, { memo, useCallback } from 'react'
import { usePresence } from '../hooks/usePresence'
import ClickOutside from './ClickOutside'

const EXIT_MS = 200

type Props = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const DropdownMenu = ({ open, onClose, children }: Props) => {
  const handleClose = useCallback(() => {
    if (open) {
      onClose()
    }
  }, [open, onClose])
  const { isMounted, isExiting } = usePresence(open, EXIT_MS)

  if (!isMounted) {
    return null
  }

  return (
    <ClickOutside onClickOutside={handleClose}>
      <div className={isExiting ? 'dropdown-menu is-exiting' : 'dropdown-menu'}>
        {children}
      </div>
    </ClickOutside>
  )
}

export default memo(DropdownMenu)
