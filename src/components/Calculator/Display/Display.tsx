import styles from './Display.module.css'

interface DisplayProps {
  value: string
}

export function Display({ value }: DisplayProps) {
  return (
    <div className={styles.display} aria-live="polite">
      {value}
    </div>
  )
}
