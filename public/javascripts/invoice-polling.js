
function start () {
  const timer = setInterval(() => {
    fetch('/valid-stream')
      .then(result => result.json())
      .then(result => {
        if (result.valid) {
          window.location = '/player'
          clearInterval(timer)
        }
      })
  }, 2000)
}

start()
