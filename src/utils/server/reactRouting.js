import React from 'react'
import { StaticRouter } from 'react-router-dom'
import { renderToString } from 'react-dom/server'

import { routeMatcher } from 'route-matcher'

export default function (routes, Component, assets) {
  // Returns routes that match the passed in url
  const matchedRoutes = url =>
    routes.map(r => routeMatcher(r.path).parse(url)).filter(r => r)

  return function (req, res, next) {
    const pathMatches = matchedRoutes(req.url)
    if (!pathMatches || pathMatches.length < 1) return next()

    const context = {}
    const markup = renderToString(
      <StaticRouter context={context} location={req.url}>
        <Component />
      </StaticRouter>
    )

    if (context.url) {
      res.redirect(context.url)
    } else {
      res.render('home', { assets, env: process.env, markup })
    }
  }
}
