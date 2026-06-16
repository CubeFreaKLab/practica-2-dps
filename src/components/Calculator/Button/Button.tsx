import styles from './Button.module.css'

type ButtonVariant = 'number' | 'operator' | 'equals' | 'special'

interface ButtonProps {
  label: string
  onClick: () => void
  variant?: ButtonVariant
}

export function Button({ label, onClick, variant = 'number' }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}
