import app from './server'
import http from 'http'

const server = http.createServer(app)

let currentApp = app

server.listen(process.env.PORT || 3000, error => {
  if (error) console.error(error)

  console.log('🚀 Razzle server started')
})

if (module.hot) {
  console.log('✅ Server-side HMR Enabled!')

  module.hot.accept('./server', () => {
    console.log('🔁 HMR Reloading `./server`...')
    server.removeListener('request', currentApp)
    const { default: newApp } = require('./server')
    server.on('request', newApp)
    currentApp = newApp
  })
}
