import { useEffect, useState } from 'react'
import type {
  CalculatorState,
  Operation,
  Operator,
} from '../../types/calculator'
import { ButtonPad } from './ButtonPad/ButtonPad'
import { Display } from './Display/Display'
import { History } from './History/History'
import styles from './Calculator.module.css'

const MAX_DIGITS = 12
const MAX_HISTORY = 5
const HISTORY_STORAGE_KEY = 'calculator-history'

const initialCalculatorState: CalculatorState = {
  display: '0',
  previousValue: null,
  currentOperator: null,
  isNewNumber: true,
  history: [],
}

function getDigitCount(value: string) {
  return value.replace(/\D/g, '').length
}

function trimTrailingZeros(value: string) {
  return value
    .replace(/(\.\d*?[1-9])0+(e[+-]?\d+)$/, '$1$2')
    .replace(/\.0+(e[+-]?\d+)$/, '$1')
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
}

function formatResult(value: number) {
  if (!Number.isFinite(value)) {
    return 'Error'
  }

  const roundedValue = Number(value.toPrecision(MAX_DIGITS))
  let result = roundedValue.toString()

  if (result.includes('e')) {
    return trimTrailingZeros(roundedValue.toExponential(6))
  }

  if (getDigitCount(result) <= MAX_DIGITS && result.length <= MAX_DIGITS + 2) {
    return result
  }

  const integerDigits = Math.trunc(Math.abs(roundedValue)).toString().length
  const decimalPlaces = Math.max(MAX_DIGITS - integerDigits, 0)
  result = trimTrailingZeros(roundedValue.toFixed(decimalPlaces))

  if (getDigitCount(result) > MAX_DIGITS || result.length > MAX_DIGITS + 2) {
    result = trimTrailingZeros(roundedValue.toExponential(6))
  }

  return result
}

function calculate(firstValue: string, operator: Operator, secondValue: string) {
  const firstNumber = Number(firstValue)
  const secondNumber = Number(secondValue)

  if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) {
    return 'Error'
  }

  if (operator === '/' && secondNumber === 0) {
    return 'Error'
  }

  const operations: Record<Operator, number> = {
    '+': firstNumber + secondNumber,
    '-': firstNumber - secondNumber,
    '*': firstNumber * secondNumber,
    '/': firstNumber / secondNumber,
  }

  return formatResult(operations[operator])
}

function getDisplayOperator(operator: Operator) {
  const symbols: Record<Operator, string> = {
    '+': '+',
    '-': '-',
    '*': '×',
    '/': '÷',
  }

  return symbols[operator]
}

function isStoredOperation(value: unknown): value is Operation {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const operation = value as Partial<Operation>

  return (
    typeof operation.id === 'number' &&
    typeof operation.expression === 'string' &&
    typeof operation.result === 'string' &&
    typeof operation.timestamp === 'string'
  )
}

function readStoredHistory() {
  const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)

  if (!storedHistory) {
    return []
  }

  try {
    const parsedHistory: unknown = JSON.parse(storedHistory)

    if (!Array.isArray(parsedHistory)) {
      return []
    }

    return parsedHistory.filter(isStoredOperation).slice(0, MAX_HISTORY)
  } catch {
    return []
  }
}

export function Calculator() {
  const [display, setDisplay] = useState(initialCalculatorState.display)
  const [previousValue, setPreviousValue] = useState(
    initialCalculatorState.previousValue,
  )
  const [currentOperator, setCurrentOperator] = useState(
    initialCalculatorState.currentOperator,
  )
  const [isNewNumber, setIsNewNumber] = useState(
    initialCalculatorState.isNewNumber,
  )
  const [history, setHistory] = useState(initialCalculatorState.history)
  const [nextOperationId, setNextOperationId] = useState(1)
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)

  useEffect(() => {
    const storedHistory = readStoredHistory()
    const lastStoredId = storedHistory.reduce(
      (highestId, operation) => Math.max(highestId, operation.id),
      0,
    )
    const timeoutId = window.setTimeout(() => {
      setHistory(storedHistory)
      setNextOperationId(lastStoredId + 1)
      setIsHistoryLoaded(true)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (!isHistoryLoaded) {
      return
    }

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  }, [history, isHistoryLoaded])

  useEffect(() => {
    if (display === 'Error' || getDigitCount(display) <= MAX_DIGITS) {
      return
    }

    const formattedDisplay = formatResult(Number(display))
    const timeoutId = window.setTimeout(() => {
      setDisplay(formattedDisplay)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [display])

  const resetOperation = () => {
    setPreviousValue(initialCalculatorState.previousValue)
    setCurrentOperator(initialCalculatorState.currentOperator)
    setIsNewNumber(initialCalculatorState.isNewNumber)
  }

  const addOperationToHistory = (expression: string, result: string) => {
    const operation: Operation = {
      id: nextOperationId,
      expression,
      result,
      timestamp: new Date().toISOString(),
    }

    setHistory((currentHistory) =>
      [operation, ...currentHistory].slice(0, MAX_HISTORY),
    )
    setNextOperationId((currentId) => currentId + 1)
  }

  const handleNumber = (value: string) => {
    if (display === 'Error') {
      setDisplay(value === '.' ? '0.' : value)
      setIsNewNumber(false)
      return
    }

    if (value === '.' && !isNewNumber && display.includes('.')) {
      return
    }

    if (isNewNumber) {
      setDisplay(value === '.' ? '0.' : value)
      setIsNewNumber(false)
      return
    }

    if (value !== '.' && getDigitCount(display) >= MAX_DIGITS) {
      return
    }

    if (display === '0' && value !== '.') {
      setDisplay(value)
      return
    }

    setDisplay(`${display}${value}`)
  }

  const handleOperator = (operator: Operator) => {
    if (display === 'Error') {
      return
    }

    if (previousValue !== null && currentOperator !== null && !isNewNumber) {
      const result = calculate(previousValue, currentOperator, display)

      if (result === 'Error') {
        setDisplay(result)
        resetOperation()
        return
      }

      setDisplay(result)
      setPreviousValue(result)
      setCurrentOperator(operator)
      setIsNewNumber(true)
      return
    }

    setPreviousValue(display)
    setCurrentOperator(operator)
    setIsNewNumber(true)
  }

  const handleEquals = () => {
    if (display === 'Error' || previousValue === null || currentOperator === null) {
      return
    }

    const secondValue = isNewNumber ? previousValue : display
    const result = calculate(previousValue, currentOperator, secondValue)

    if (result === 'Error') {
      setDisplay(result)
      resetOperation()
      return
    }

    const expression = `${previousValue} ${getDisplayOperator(
      currentOperator,
    )} ${secondValue}`

    setDisplay(result)
    resetOperation()
    addOperationToHistory(expression, result)
  }

  const handleClear = () => {
    setDisplay(initialCalculatorState.display)
    resetOperation()
  }

  const handleBackspace = () => {
    if (display === 'Error' || isNewNumber) {
      setDisplay(initialCalculatorState.display)
      setIsNewNumber(true)
      return
    }

    if (display.length <= 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay(initialCalculatorState.display)
      return
    }

    setDisplay(display.slice(0, -1))
  }

  const handlePercentage = () => {
    if (display === 'Error') {
      return
    }

    const result = formatResult(Number(display) / 100)

    if (result === 'Error') {
      setDisplay(result)
      resetOperation()
      return
    }

    setDisplay(result)
    setIsNewNumber(false)
  }

  return (
    <section className={styles.wrapper} aria-label="Calculadora">
      <div className={styles.calculatorWindow}>
        <div className={styles.titleBar}>
          <span className={styles.titleText}>▣ Calculadora</span>
          <span className={styles.windowControls} aria-hidden="true">
            <span className={styles.windowButton}>—</span>
            <span className={styles.windowButton}>□</span>
            <span className={`${styles.windowButton} ${styles.closeButton}`}>
              ×
            </span>
          </span>
        </div>

        <div className={styles.calculatorBody}>
          <Display value={display} />
          <ButtonPad
            onNumber={handleNumber}
            onOperator={handleOperator}
            onEquals={handleEquals}
            onClear={handleClear}
            onBackspace={handleBackspace}
            onPercentage={handlePercentage}
          />
        </div>
      </div>

      <History operations={history} />
    </section>
  )
}
