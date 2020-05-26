const Hls = window.Hls

if (Hls.isSupported()) {
  var video = document.getElementById('video')
  var hls = new Hls()
  var playlist = window.location.search.split('?playlist=').pop()
  if (!playlist) {
    playlist = 'http://localhost:8021/playlist.m3u8'
  }
  hls.attachMedia(video)
  document.getElementById('error').innerText = 'Video will take a few second to start playing..'

  hls.on(Hls.Events.MEDIA_ATTACHED, function () {
    hls.loadSource(playlist)
  })
  hls.on(Hls.Events.FRAG_LOADED, function () {
    document.getElementById('error').innerText = '---'
  })

  hls.on(Hls.Events.FRAG_LOADING, function () {
    document.getElementById('error').innerText = 'Loading....'
  })
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.addEventListener('canplay', function () {
    video.play()
  })
}

function start () {
  var timer = setInterval(() => {
    fetch('/stream-status')
      .then(result => result.json())
      .then(result => {
        if (result.valid) {
          document.getElementById('isValid').setAttribute('valid', result.valid)
          document.getElementById('timeLeft').innerText = Math.floor(result.status.remaining / 1000) + ' Seconds left'
        }
      })
  }, 2000)
}

start()
