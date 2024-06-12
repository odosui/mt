import PencilIcon from '@mui/icons-material/Edit'
import { Switch } from '@mui/material'
import React from 'react'

type Mode = 'edit' | 'view'

const EditSwitch: React.FC<{
  value: Mode
  onChange: (m: Mode) => void
}> = ({ value, onChange }) => {
  const handleChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    onChange(checked ? 'edit' : 'view')
  }

  return (
    <Switch
      value={value === 'edit'}
      onChange={handleChange}
      icon={<PencilIcon />}
      className="edit-switch"
      checkedIcon={<PencilIcon />}
    />
  )
}

export default EditSwitch
