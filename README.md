# Currere
An easy way to publish an api to communicate with iFrames.

## Example
### parent
```js
const api = {
  foo: function (message) {
    console.log("foo called with: ", message);
  },
  version: '0.0.1',
};

frameApi(api).then((api) => {
  api.bar('nachos').then((val) => { console.log('and returned: ', val); });
});
```

### iFrame
```js
const api = {
  bar: function (message) {
    console.log("bar called with: ", message);
    return 46;
  }
};

frameApi(api).then((api) => {
  api.foo('cheese').then((val) => { console.log('and returned: ', val); });
  console.log('version', api.version)
});

```

this would produce the following in your console
```text
version 0.0.1                   
bar called with:  nachos
foo called with:  cheese
and returned:  46
and returned:  undefined
```

## Why "Currere"?
"Currere" is a latin word meaning "to run". It is also the word that "courier" (meaning messenger) is derived from. Both "run" (as in run a function) and "messenger" (as in postMessage api) seemed relevant to this project.
