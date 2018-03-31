import App from './App'
import path from 'path'
import React from 'react'
import Express from 'express'
import { StaticRouter } from 'react-router-dom'
import { renderToString } from 'react-dom/server'

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

const server = new Express()
server
  .disable('x-powered-by')
  .use(Express.static(process.env.RAZZLE_PUBLIC_DIR))
  .set('views', path.resolve(process.env.RAZZLE_PUBLIC_DIR, 'views'))
  .set('view engine', 'pug')
  .get('/*', (req, res) => {
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
  })

/*
// Build the authorization config and url
const authUrl = github.auth
  .config({
    id: env.git_client_id,
    secret: env.git_client_secret
  })
  .login(['user', 'repo'])

  // Store info to verify against CSRF
const auth = url.parse(authUrl, true)
var { state } = auth.query

app.get('/login', function (req, res) {
  res.redirect(302, authUrl)
})

app.get('/auth', function (req, res) {
  if (!state || state !== req.query.state) {
    res.status(403).send('Failed to authenticate')
  } else {
    github.auth.login(req.query.code, function (err, token, headers) {
      if (err) console.error(err)
      res.send(token)
    })
  }
})

*/

// TODO: refactor for razzle

export default server
