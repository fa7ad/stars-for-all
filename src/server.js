import cors from 'cors'
import path from 'path'
import helmet from 'helmet'
import Express from 'express'
import github from 'octonode'
import passport from 'passport'
import bodyParser from 'body-parser'
import compression from 'compression'
import session from 'express-session'
import MemoryStore from 'memorystore'
import { Strategy } from 'passport-github'
import { ensureLoggedIn } from 'connect-ensure-login'

import App, { routes } from './components/App/'
import makeRoutingMiddleware from './utils/reactRouting'

const {
  HOST,
  PORT,
  RAZZLE_GITHUB_ID,
  RAZZLE_GITHUB_SECRET,
  RAZZLE_SESSION_SECRET
} = process.env

passport.use(
  new Strategy(
    {
      clientID: RAZZLE_GITHUB_ID,
      clientSecret: RAZZLE_GITHUB_SECRET,
      callbackURL: `http://${HOST}:${PORT}/auth`
    },
    function (accessToken, refreshToken, profile, cb) {
      // TODO: put to database
      return cb(null, profile)
    }
  )
)

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})

const sessionConf = {
  store: new MemoryStore(session)({
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
      origin (origin, callback) {
        callback(null, true)
      },
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
  .all('/login', passport.authenticate('github'))
  .get(
    '/auth',
    passport.authenticate('github', { failureRedirect: '/' }),
    function (req, res) {
      res.redirect('/')
    }
  )
  .get('/repos/:user', ensureLoggedIn('/'), (req, res) => {
    const client = github.client(req.session.token) // FIXME
    client.user(req.params.user).reposAsync().then(data => {
    //   res.json(data)
    })
  })
  .use(reactRouting)

export default server
