import url from 'url'
import React from 'react'
import UrlPattern from 'url-pattern'
import { StaticRouter } from 'react-router-dom'
import { renderToString } from 'react-dom/server'

const routeMatcher = (uri, route, exact = false) => {
  const link = url.parse(uri)
  const justUrl = link.path.replace(link.search || '', '')
  const pattern = new UrlPattern(route)
  return exact ? route === justUrl : pattern.match(justUrl) !== null
}

export default function (rawRoutes, Component, assets) {
  return function (req, res, next) {
    if (!req.session.token && !routeMatcher(req.url, '/', true)) {
      const routes = rawRoutes
        .map(r => r.path)
        .filter(r => routeMatcher(req.url, r))
      res.status(routes.length > 0 ? 403 : 404).render('redirect', {
        url: '/',
        title: routes.length > 0
          ? 'Unautorized request, redirecting...'
          : '404 Not Found',
        placeholder: 'Go Home!',
        assets
      })
      return
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
