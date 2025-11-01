import React from 'react'

type Mode = 'edit' | 'view'

const EditSwitch: React.FC<{
  value: Mode
  onChange: (m: Mode) => void
}> = ({ value, onChange }) => {
  return (
    <label className="switch" title="Edit mode">
      <input
        type="checkbox"
        value={value === 'edit' ? 'checked' : ''}
        onChange={(e) => {
          onChange(e.target.checked ? 'edit' : 'view')
        }}
      />
      <span className="slider"></span>
    </label>
  )
}

export default EditSwitch
