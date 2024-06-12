import * as React from 'react'
import Modal from 'react-modal'
import CloseIcon from '@mui/icons-material/Close'

Modal.setAppElement('body')

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 3px 7px rgba(0, 0, 0, 0.3)',
  },
  overlay: {
    zIndex: 3,
  },
}

const GenericModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  contentLabel: string
  contentClass?: string
  children: React.ReactNode
}> = ({ isOpen, onClose, children, contentLabel, contentClass }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={contentLabel}
      style={customStyles}
    >
      <a
        className="modalClose"
        href="#"
        onClick={(e) => {
          e.preventDefault()
          onClose()
        }}
      >
        <CloseIcon />
      </a>
      <div className={['generic-modal-content', contentClass].join(' ')}>
        {children}
      </div>
    </Modal>
  )
}

export default React.memo(GenericModal)
