import url from 'url'
import React from 'react'
import { StaticRouter } from 'react-router-dom'
import { renderToString } from 'react-dom/server'

const routeMatcher = (uri, route) => {
  const link = url.parse(uri)
  return route === link.path.replace(link.search || '', '')
}

export default function (routes, Component, assets) {
  return function (req, res, next) {
    if (!routeMatcher(req.url, '/') && !req.session.token) {
      res.status(403).render('redirect', {
        url: '/',
        title: 'Unautorized request, redirecting...',
        placeholder: 'Go Home!'
      })
      return next()
    }

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
