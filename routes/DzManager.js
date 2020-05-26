'use strict'
const client = require('bitstation-client')
const { Dazaar, HLSGen } = client

class DzManager {
  constructor () {
    this.started = false
    this.config = {}
    this.currentData = {}
  }

  destroy () {
    this.dazaar._marketFile.destroy()
    this.dazaar.buyer.destroy()
  }

  setDz (config) {
    this.started = false
    this.config = config
    this.dazaar = new Dazaar(config)
    const dazaar = this.dazaar
    this.startHLS()
    dazaar.on('stream-validate', () => {
      this.streamIsValid = true
    })

    dazaar.on('stream-feed', () => {
      dazaar.buyer.feed.update(() => {
        dazaar.startStream({})
      })
    })

    dazaar.on('stream-data', (data) => {
      this.hls.appendData(data)
    })

    dazaar.on('stream-valid', (data) => {
      this.currentData = data
    })

    dazaar.on('stream-invalid', () => {
      this.streamIsValid = false
    })
  }

  start () {
    this.dazaar.start()
  }

  buy (amt) {
    const sats = this.dazaar.getMenuAmount(+amt)
    this.dazaar.buy(sats)
    return sats
  }

  startHLS () {
    const hls = new HLSGen(this.config)
    hls.init((err) => {
      if (err) throw err
    })
    hls.startHLS()
    this.hls = hls
  }
}
module.exports = DzManager
