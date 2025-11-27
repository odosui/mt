import { PencilIcon, XIcon, CheckIcon } from '@primer/octicons-react'
import React from 'react'
import Button from './Button'

const EditSwitch: React.FC<{
  value: 'edit' | 'view'
  onChange: (m: 'edit' | 'view', shouldSave: boolean) => void
  saving: boolean
  hasChanges: boolean
}> = ({ value, onChange, saving, hasChanges }) => {
  const handleEdit: React.MouseEventHandler = (e) => {
    e.preventDefault()
    onChange('edit', false)
  }

  const handleSave: React.MouseEventHandler = (e) => {
    e.preventDefault()
    onChange('view', true)
  }

  const handleClose: React.MouseEventHandler = (e) => {
    e.preventDefault()
    onChange('view', false)
  }

  if (saving) {
    return <Button className="lite-btn edit-btn">Saving...</Button>
  }

  if (value === 'edit') {
    return (
      <>
        <Button
          className="lite-btn edit-btn"
          icon={<XIcon />}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          className={`lite-btn edit-btn${hasChanges ? ' pending' : ''}`}
          icon={<CheckIcon />}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Save <kbd>⌘↵</kbd>
        </Button>
      </>
    )
  } else {
    return (
      <Button
        className="lite-btn edit-btn"
        icon={<PencilIcon />}
        onClick={handleEdit}
      >
        Edit
      </Button>
    )
  }
}

export default EditSwitch
