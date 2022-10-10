import { useReducer } from "react";
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";
import "./styles.css"

//list all the actions a user could take
export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate'
}

function reducer(state, { type, payload }) {
  switch(type) {
    case ACTIONS.ADD_DIGIT:
      //after pressing "=" button, clear current operand then display new digit for current operand
      if(state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false
        }
      }

      //edge case: don't let user type multiple zeroes by itself
      if(payload.digit == '0' && state.currentOperand == '0') return state

      //edge case: don't let user enter "." before any numbers
      if(payload.digit === '.' && state.currentOperand == null) return state

      //edge case: dont't let user type more than one decimal
      if(payload.digit === '.' && state.currentOperand.includes(".")) return state

      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${payload.digit}`
      }
    case ACTIONS.CHOOSE_OPERATION:
      //edge case: don't let user type operation as first input
      if(state.currentOperand == null && state.previousOperand == null) {
        return state
      }

      //when clicking two operators in a row after a number, change current operator to another operator
      if(state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation
        }
      }

      //after clicking a number then operation, move this to previous operand position
      if(state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null
        }
      }

      //when clicking a second operator, evaluate the current math
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null
      }
    case ACTIONS.CLEAR:
      return {}
    case ACTIONS.DELETE_DIGIT:
      //if just clicked "=" button after evaluation, clear current operand to null
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null
        }
      }

      //do nothing if nothing
      if (state.currentOperand == null) return state

      // if just one digit, turn to null instead of empty string
      if (state.currentOperand.length == 1) {
        return { ...state, currentOperand: null }
      }

      //remove last digit from current operand
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }
    case ACTIONS.EVALUATE:
      //if don't have all info needed, do nothing
      if( state.operation === null || state.currentOperand === null || state.previousOperand === null ) {
        return state
      }

      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state)
      }
  }
}

function evaluate({ currentOperand, previousOperand, operation}) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)

  if(isNaN(prev) || isNaN(current)) return ""

  let computation = ""
  switch (operation) {
    case "+":
      computation = prev + current
      break
    case "-":
    computation = prev - current
      break
    case "*":
    computation = prev * current
      break
    case "÷":
    computation = prev / current
      break
  }

  return computation.toString()
}

//format numbers before decimal to have commas
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0
})
function formatOperand(operand) {
  if (operand == null) return

  const [integer, decimal] = operand.split(".")
  if (decimal == null) return INTEGER_FORMATTER.format(integer)

  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {
  const [{ currentOperand, previousOperand, operation}, dispatch] = useReducer(reducer, {})

  return (
    <div className='calculator-grid'>
      <div className="output">
        <div className="previous-operand">{formatOperand(previousOperand)} {operation}</div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.CLEAR })}>AC</button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>
      <OperationButton operation='÷' dispatch={dispatch} />
      <DigitButton digit='1' dispatch={dispatch} />
      <DigitButton digit='2' dispatch={dispatch} />
      <DigitButton digit='3' dispatch={dispatch} />
      <OperationButton operation='*' dispatch={dispatch} />
      <DigitButton digit='4' dispatch={dispatch} />
      <DigitButton digit='5' dispatch={dispatch} />
      <DigitButton digit='6' dispatch={dispatch} />
      <OperationButton operation='+' dispatch={dispatch} />
      <DigitButton digit='7' dispatch={dispatch} />
      <DigitButton digit='8' dispatch={dispatch} />
      <DigitButton digit='9' dispatch={dispatch} />
      <OperationButton operation='-' dispatch={dispatch} />
      <DigitButton digit='.' dispatch={dispatch} />
      <DigitButton digit='0' dispatch={dispatch} />
      <button 
        className="span-two" 
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
  )
}

export default App;
