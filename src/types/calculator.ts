export type Operator = '+' | '-' | '*' | '/'

export interface Operation {
  id: number
  expression: string
  result: string
  timestamp: string
}

export interface CalculatorState {
  display: string
  previousValue: string | null
  currentOperator: Operator | null
  isNewNumber: boolean
  history: Operation[]
}
