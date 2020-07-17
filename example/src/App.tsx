import React from 'react'

import { ChildGuard } from 'adult.js'
import 'adult.js/dist/index.css'

const App = () => {
  return (
    <ChildGuard
      weights_path="/weights"
      show={true}
      callback_function={(adult, age)=>{
        if (adult) {
          console.log(`You are adult, your age is ${age}`)
        } else {
          console.log(`You are not adult, your age is ${age}`)
        }
      }}
    />
  )
}

export default App
