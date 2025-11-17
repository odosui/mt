import { PencilIcon } from '@primer/octicons-react'
import React from 'react'
import Button from './Button'

const EditSwitch: React.FC<{
  value: 'edit' | 'view'
  onChange: (m: 'edit' | 'view') => void
  saving: boolean
}> = ({ value, onChange, saving }) => {
  const handleEdit: React.MouseEventHandler = (e) => {
    e.preventDefault()
    onChange('edit')
  }

  const handleSave: React.MouseEventHandler = (e) => {
    e.preventDefault()
    onChange('view')
  }

  if (saving) {
    return <Button className="lite-btn edit-btn">Saving...</Button>
  }

  if (value === 'edit') {
    return (
      <Button
        className="lite-btn edit-btn pending"
        icon={<PencilIcon />}
        onClick={handleSave}
      >
        Save
      </Button>
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
