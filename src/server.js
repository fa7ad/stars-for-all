import path from 'path'

import Express from 'express'
import github from 'octonode'

import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import compression from 'compression'

import session from 'express-session'
import MemoryStore from 'memorystore'

import passport from 'passport'
import { Strategy } from 'passport-github2'
import { ensureLoggedIn } from 'connect-ensure-login'

import level from 'levelup'
import memdown from 'memdown'
import encode from 'encoding-down'

import App, { routes } from './components/App/'
import makeRoutingMiddleware from './utils/reactRouting'

const {
  RAZZLE_GITHUB_ID,
  RAZZLE_GITHUB_SECRET,
  RAZZLE_SESSION_SECRET
} = process.env

const db = level(encode(memdown()))

passport.use(
  new Strategy(
    {
      clientID: RAZZLE_GITHUB_ID,
      clientSecret: RAZZLE_GITHUB_SECRET,
      callbackURL: `http://localhost:3000/auth`
    },
    function (accessToken, refreshToken, profile, cb) {
      const { id, profileUrl } = profile
      db.put(id, JSON.stringify({ accessToken, profileUrl })).then(r => {
        cb(null, profile)
      })
    }
  )
)

passport.serializeUser((user, cb) => cb(null, user))
passport.deserializeUser((obj, cb) => cb(null, obj))

const sessionConf = {
  store: new (MemoryStore(session))({
    checkPeriod: 3.6e6
  }),
  resave: true,
  saveUninitialized: false,
  secret: RAZZLE_SESSION_SECRET
}

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)
const reactRouting = makeRoutingMiddleware(routes, App, assets)

const server = new Express()

server
  .use(helmet())
  .use(compression())
  .use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true
    })
  )
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

if (server.get('env') === 'production') {
  server.set('trust proxy', 1)
  Object.assign(sessionConf, { cookie: { secure: true } })
}

server
  .use(session(sessionConf))
  .use(passport.initialize())
  .use(passport.session())
  .use(Express.static(process.env.RAZZLE_PUBLIC_DIR))
  .set('views', path.resolve(process.env.RAZZLE_PUBLIC_DIR, 'views'))
  .set('view engine', 'pug')
  .all('/login', passport.authenticate('github', { scope: ['user', 'repo'] }))
  .get(
    '/auth',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/')
    }
  )
  .get('/ok', ensureLoggedIn('/'), (req, res) => {
    res.json({ ok: true })
  })
  .get('/info/:user', ensureLoggedIn('/'), (req, res) => {
    db.get(req.user.id).then(JSON.parse).then(data => {
      if (!data.hasOwnProperty('accessToken')) return res.redirect('/')
      const client = github.client(data.accessToken)
      client
        .user(req.params.user)
        .infoAsync()
        .then(data => {
          res.json(data)
        })
        .catch(e => {
          res.status(404).json({})
        })
    })
  })
  .get('/repos/:user', ensureLoggedIn('/'), (req, res) => {
    db.get(req.user.id).then(JSON.parse).then(data => {
      if (!data.hasOwnProperty('accessToken')) return res.redirect('/')
      const client = github.client(data.accessToken)
      client
        .user(req.params.user)
        .reposAsync()
        .then(data => {
          res.json(data)
        })
        .catch(e => {
          res.status(404).json({})
        })
    })
  })
  .use(reactRouting)

export default server
