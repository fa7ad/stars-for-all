import url from 'url'
import path from 'path'
import Express from 'express'
import github from 'octonode'
import { routeMatcher } from 'route-matcher'

import React from 'react'
import { StaticRouter } from 'react-router-dom'
import { renderToString } from 'react-dom/server'

import App, { routes } from './App'
const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

// Returns routes that match the passed in url
const matchedRoutes = url =>
  routes.map(r => routeMatcher(r.path).parse(url)).filter(r => r)

// Handle GitHub auth using octonode
const authUrl = github.auth
  .config({
    id: process.env.RAZZLE_GITHUB_ID,
    secret: process.env.RAZZLE_GITHUB_SECRET
  })
  .login(['user', 'repo'])
const auth = url.parse(authUrl, true)
const { state } = auth.query

// Middleware that serves valid routes using ReactRouter
const reactRouting = function (req, res, next) {
  const pathMatches = matchedRoutes(req.url)
  if (!pathMatches || pathMatches.length < 1) return next()

  const context = {}
  const markup = renderToString(
    <StaticRouter context={context} location={req.url}>
      <App />
    </StaticRouter>
  )

  if (context.url) {
    res.redirect(context.url)
  } else {
    res.render('home', { assets, env: process.env, markup })
  }
}

// Express server
const server = new Express()
server
  .disable('x-powered-by')
  .use(Express.static(process.env.RAZZLE_PUBLIC_DIR))
  .set('views', path.resolve(process.env.RAZZLE_PUBLIC_DIR, 'views'))
  .set('view engine', 'pug')
  .use(reactRouting)
  .get('/login', function (req, res) {
    res.redirect(302, authUrl)
  })
  .get('/auth', function (req, res) {
    if (!state || state !== req.query.state) {
      res.status(403).send('Failed to authenticate')
    } else {
      github.auth.login(req.query.code, function (err, token, headers) {
        if (err) console.error(err)
        res.send(token)
      })
    }
  })

export default server
