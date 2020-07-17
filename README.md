# adult.js
Hey, kids! You are not allowed in here!


### Intro
This is a react.js component to help you detect if your user was an adult, if it is, we let them use our service, if it's not, we say no to them.

### Installation
```
npm i adult.js

or

yarn add adult.js
```

### Usage
```js
import { ChildGuard } from 'adult.js'

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
```

The `/weights` is actully in `public/weights`, you have to download those ML weights from [here](https://github.com/yingshaoxo/adult.js/tree/master/example/public/weights), and copy those files to your local `public/weights` folder.

Check the [Example](https://github.com/yingshaoxo/adult.js/tree/master/example) for more information.
