import type { Operation } from '../../../types/calculator'
import styles from './History.module.css'

interface HistoryProps {
  operations: Operation[]
}

export function History({ operations }: HistoryProps) {
  return (
    <aside className={styles.history} aria-label="Historial de operaciones">
      <div className={styles.titleBar}>
        <h2 className={styles.title}>Historial</h2>
        <span className={styles.windowControls} aria-hidden="true">
          <span className={styles.windowButton}>—</span>
          <span className={styles.windowButton}>□</span>
          <span className={`${styles.windowButton} ${styles.closeButton}`}>
            ×
          </span>
        </span>
      </div>

      <div className={styles.paper}>
        {operations.length === 0 ? (
          <p className={styles.empty}>Sin operaciones todavía.</p>
        ) : (
          <ul className={styles.list}>
            {operations.map((operation) => (
              <li className={styles.item} key={operation.id}>
                <span className={styles.expression}>
                  {operation.expression}
                </span>
                <span className={styles.equals}>=</span>
                <strong className={styles.result}>{operation.result}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
