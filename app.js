const url = require('url')
const Express = require('express')
const github = require('octonode')
const env = Object.assign({}, process.env, require('yenv')())

const app = new Express()
const PORT = env.PORT || 3000
const HOST = env.HOST || 'localhost'

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

app.listen(PORT, HOST, function () {
  console.log(`Listening on http://${HOST}:${PORT}/`)
})
