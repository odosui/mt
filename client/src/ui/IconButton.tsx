import React from 'react'

type Props = {
  icon: React.ReactElement
  onClick: () => void
  variant?: 'primary' | 'danger'
}

const IconButton = ({ icon, onClick, variant = 'primary' }: Props) => {
  return (
    <button className={`icon-button ${variant} `} onClick={onClick}>
      {icon}
    </button>
  )
}

export default IconButton
