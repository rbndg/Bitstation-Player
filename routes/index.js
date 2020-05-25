'use strict'
const express = require('express')
const router = express.Router()
const QRCode = require('qrcode')
const config = require('../config.json')
const DzManager = require('./DzManager')

const dz = new DzManager(config)

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Bit'
  })
})

router.get('/player', function (req, res, next) {
  if (!dz) return res.send('/')

  if (dz.streamIsValid) {
    return res.render('player', {
      videoSrc: 'asdasdasds'
    })
  }
  res.redirect('/')
})

router.post('/connect', function (req, res, next) {
  config.STATION_KEY = req.body.stationKey

  if (config.STATION_KEY !== dz.config.STATION_KEY) {
    dz.start(config)

    const handler = (path) => {
      res.redirect(path)
      dz.dazaar.removeListener('stream-validate', validFn)
      dz.dazaar.removeListener('stream-invalid', invalidFn)
    }
    const invalidFn = handler.bind(this, '/menu')
    const validFn = handler.bind(this, '/player')
    dz.dazaar.once('stream-validate', validFn)
    dz.dazaar.once('stream-invalid', invalidFn)
    return
  }

  if (dz.streamIsValid) {
    return res.redirect('/player')
  } else {
    return res.redirect('/menu')
  }
})

router.get('/menu', function (req, res, next) {
  res.render('menu', {
    cost: config.STREAM_COST,
    stationKey: config.STATION_KEY,
    amounts: config.MENU
  })
})

router.get('/buy', function (req, res, next) {
  const { minutes } = req.query
  if (!minutes || !dz.dazaar) {
    return res.redirect('/')
  }
  dz.dazaar.buyerLn.once('stream-invoice', (invoice) => {
    QRCode.toDataURL(invoice.request, { type: 'terminal' }, function (err, url) {
      if (err) return res.send(500)
      res.render('invoice', {
        b64: url,
        invoice: invoice.request,
        minutes,
        sats: sats.toLocaleString()
      })
    })
  })
  const sats = dz.buy(minutes)
})

router.get('/valid-stream', function (req, res, next) {
  res.send({ valid: dz.streamIsValid })
})

router.get('/stream-status', function (req, res, next) {
  res.send({ valid: dz.streamIsValid, status: dz.currentData })
})

module.exports = router
