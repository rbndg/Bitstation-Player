'use strict'
const client = require('bitstation-client')

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

  start (config) {
    this.started = false
    const Dazzar = client.dazaar
    this.config = config
    const dazaar = new Dazzar(config)
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
    this.dazaar = dazaar
  }

  buy (amt) {
    const sats = this.dazaar.getMenuAmount(+amt)
    this.dazaar.buy(sats)
    return sats
  }

  startHLS () {
    const HLS = client.hlsGen
    const hls = new HLS(this.config)
    hls.init((err) => {
      if (err) throw err
    })
    hls.startHLS()
    this.hls = hls
  }
}
module.exports = DzManager
