import * as React from 'react'

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ReactElement
    variant?: 'primary' | 'danger'
  }
> = (props) => {
  const { icon, className, variant, ...rest } = props

  let cl = ['btn']

  if (className) cl.push(className)
  if (variant) cl.push(`${variant}`)

  return (
    <button className={cl.join(' ')} {...rest}>
      {icon && icon}
      {props.children}
    </button>
  )
}

export default Button
