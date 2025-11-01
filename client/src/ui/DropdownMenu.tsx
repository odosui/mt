import { AnimatePresence, motion } from 'motion/react'
import React, { memo, useCallback } from 'react'
import ClickOutside from './ClickOutside'

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

  return (
    <AnimatePresence>
      {open && (
        <ClickOutside onClickOutside={handleClose}>
          <motion.div
            className="dropdown-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {children}
          </motion.div>
        </ClickOutside>
      )}
    </AnimatePresence>
  )
}

export default memo(DropdownMenu)
