<script lang="ts" setup>
enum Operators {
  NULL,
  PLUS,
  MINUS,
  MULTIPLY,
  DIVIDE,
}

const displayText = ref('')
let storedNumber: number = 0
const chosenOperator = ref(Operators.NULL)
let clearOnNextInput: boolean = false

defineShortcuts({
  '1': () => {
    inputCharacter('1')
  },
  '2': () => {
    inputCharacter('2')
  },
  '3': () => {
    inputCharacter('3')
  },
  '4': () => {
    inputCharacter('4')
  },
  '5': () => {
    inputCharacter('5')
  },
  '6': () => {
    inputCharacter('6')
  },
  '7': () => {
    inputCharacter('7')
  },
  '8': () => {
    inputCharacter('8')
  },
  '9': () => {
    inputCharacter('9')
  },
  '0': () => {
    inputCharacter('0')
  },
  '.': () => {
    inputCharacter('.')
  },
  '+': () => {
    selectOperator(Operators.PLUS)
  },
  '-': () => {
    selectOperator(Operators.MINUS)
  },
  '/': () => {
    selectOperator(Operators.DIVIDE)
  },
  '*': () => {
    selectOperator(Operators.MULTIPLY)
  },
  '=': () => {
    calculate()
  },
  'enter': () => {
    calculate()
  },
  'c': () => {
    clear()
  },
})

function inputCharacter(n: string) {
  if (clearOnNextInput) {
    displayText.value = ''
    clearOnNextInput = false
  }
  // check for if there's already a .
  displayText.value += n
}

function clear() {
  displayText.value = ''
  storedNumber = 0
  chosenOperator.value = Operators.NULL
}

function selectOperator(operator: Operators) {
  // if (chosenOperator !== Operators.NULL) {

  // }
  chosenOperator.value = operator
  storedNumber = Number(displayText.value)
  clearOnNextInput = true
}

function calculate() {
  const a = Number(displayText.value)
  const b = storedNumber
  let answer: number = 0
  switch (chosenOperator.value) {
    case Operators.NULL:
      console.warn('oopsie woopsie')
      break
    case Operators.PLUS:
    {
      answer = a + b
      break
    }
    case Operators.MINUS:
    {
      answer = a - b
      break
    }
    case Operators.MULTIPLY:
    {
      answer = a * b
      break
    }
    case Operators.DIVIDE: {
      answer = b / a
      console.warn(a, b)
      // todo check for 0
      break
    }
  }

  displayText.value = answer.toString()
}
</script>

<template>
  <div>
    <div
      class="grid grid-cols-5 grid-rows-5 gap-4"
    >
      <div class="col-span-5 text-4xl flex justify-end items-center bg-accented rounded-lg p-2 overflow-hidden">
        {{ displayText }}
      </div>
      <CalculatorButton text="7" @click="inputCharacter('7')" />
      <CalculatorButton text="8" @click="inputCharacter('8')" />
      <CalculatorButton text="9" @click="inputCharacter('9')" />
      <CalculatorButton text="+-" color="neutral" />
      <CalculatorButton text=">" color="neutral" />
      <CalculatorButton text="4" @click="inputCharacter('4')" />
      <CalculatorButton text="5" @click="inputCharacter('5')" />
      <CalculatorButton text="6" @click="inputCharacter('6')" />
      <CalculatorButton text="x" :color="chosenOperator === Operators.MULTIPLY ? 'warning' : 'neutral'" @click="selectOperator(Operators.MULTIPLY)" />
      <CalculatorButton text="/" :color="chosenOperator === Operators.DIVIDE ? 'warning' : 'neutral'" @click="selectOperator(Operators.DIVIDE)" />
      <CalculatorButton text="1" @click="inputCharacter('1')" />
      <CalculatorButton text="2" @click="inputCharacter('2')" />
      <CalculatorButton text="3" @click="inputCharacter('3')" />
      <CalculatorButton text="-" :color="chosenOperator === Operators.MINUS ? 'warning' : 'neutral'" @click="selectOperator(Operators.MINUS)" />
      <CalculatorButton text="=" color="info" class="row-span-2" @click="calculate()" />
      <CalculatorButton text="C" color="error" @click="clear()" />
      <CalculatorButton text="0" @click="inputCharacter('0')" />
      <CalculatorButton text="." @click="inputCharacter('.')" />
      <CalculatorButton text="+" :color="chosenOperator === Operators.PLUS ? 'warning' : 'neutral'" @click="selectOperator(Operators.PLUS)" />
    </div>
  </div>
</template>

<style>

</style>
