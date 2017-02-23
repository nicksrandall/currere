class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

// TODO: lock down origin
export default function frameApi(api) {
  const context = {};
  context.registered = false;
  context.promiseQueue = {};

  const trigger = (key, source) => {
    return (...args) => {
      var deferred = new Deferred();
      const message = {
        cmd: "_trigger_",
        name: key,
        key: Math.random().toString(32),
        args: args
      };
      context.promiseQueue[message.key] = deferred;
      source.postMessage(JSON.stringify(message), "*");
      return deferred.promise;
    };
  };

  const makeApi = (cmd, api) => {
    const keys = [];
    const values = {};
    for (let key in api) {
      if (!api.hasOwnProperty(key)) continue;
      if (typeof api[key] === "function") {
        keys.push(key);
      } else {
        values[key] = api[key];
      }
    }
    return {
      cmd: cmd,
      api: keys,
      values: values
    };
  };

  const makeTriggers = (message, e) => {
    const triggers = {};
    message.api.forEach(key => {
      triggers[key] = trigger(key, e.source);
    });
    Object.assign(triggers, message.values);
    return triggers;
  };

  let processMessage;
  const promise = new Promise((resolve, reject) => {
    processMessage = e => {
      const data = e.data;
      let message;
      try {
        message = JSON.parse(data);
      } catch (e) {
        return;
      }
      switch (message.cmd) {
        case "_handshake_": {
          const triggers = makeTriggers(message, e);
          e.source.postMessage(
            JSON.stringify(makeApi("_hresponse_", api)),
            "*"
          );
          resolve(triggers);
          break;
        }
        case "_hresponse_": {
          const triggers = makeTriggers(message, e);
          context.registered = true;
          resolve(triggers);
          break;
        }
        case "_trigger_": {
          const value = api[message.name].apply(null, message.args);
          e.source.postMessage(
            JSON.stringify({
              cmd: "_tresponse_",
              key: message.key,
              value: value
            }),
            "*"
          );
          break;
        }
        case "_tresponse_": {
          context.promiseQueue.hasOwnProperty(message.key) &&
            context.promiseQueue[message.key].resolve(message.value);
          delete context.promiseQueue[message.key];
          break;
        }
        default: {
          if (context.registered) {
            reject(`${message.cmd} is not a valid command.`);
          }
        }
      }
    };

    window.addEventListener("message", processMessage, false);

    if (window.parent !== window && !window.iFrameApiParent) {
      window.parent.postMessage(
        JSON.stringify(makeApi("_handshake_", api)),
        "*"
      );
    }
  });

  promise.destroy = () => {
    window.removeEventListener("message", processMessage, false);
  };

  return promise;
}
