import url from 'url'
import path from 'path'
import helmet from 'helmet'
import Express from 'express'
import github from 'octonode'
import bodyParser from 'body-parser'
import compression from 'compression'
import session from 'express-session'
import makeMemoryStore from 'memorystore'

import App, { routes } from './App'
import makeRoutingMiddleware from './utils/server/reactRouting'

// Handle GitHub auth using octonode
const authUrl = github.auth
  .config({
    id: process.env.RAZZLE_GITHUB_ID,
    secret: process.env.RAZZLE_GITHUB_SECRET
  })
  .login(['user', 'repo'])
const { query: { state } } = url.parse(authUrl, true)

const MemoryStore = makeMemoryStore(session)
const sessionConf = {
  store: new MemoryStore({
    checkPeriod: 3.6e6
  }),
  resave: true,
  saveUninitialized: false,
  secret: process.env.RAZZLE_SESSION_SECRET
}

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)
const reactRouting = makeRoutingMiddleware(routes, App, assets)

const server = new Express()
server
  .use(helmet())
  .use(compression())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

if (server.get('env') === 'production') {
  server.set('trust proxy', 1)
  Object.assign(sessionConf, { cookie: { secure: true } })
}

server
  .use(session(sessionConf))
  .use(Express.static(process.env.RAZZLE_PUBLIC_DIR))
  .set('views', path.resolve(process.env.RAZZLE_PUBLIC_DIR, 'views'))
  .set('view engine', 'pug')
  .all('/login', function (req, res) {
    res.redirect(302, authUrl)
  })
  .get('/auth', function (req, res) {
    if (!state || state !== req.query.state) {
      res.status(403).send('Failed to authenticate')
    } else {
      github.auth.login(req.query.code, function (err, token, headers) {
        if (err) console.error(err)
        Object.assign(req.session, { token })
        res.redirect(`/?id=${req.session.id}`)
      })
    }
  })
  .use(reactRouting)

export default server
