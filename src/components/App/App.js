import React from 'react'
import {Route, Switch} from 'react-router-dom'

import Home from '../Home/'
import Repos from '../Repos/'

import './App.css'

export const routes = [
  {
    path: '/',
    exact: true,
    component: Home
  },
  {
    path: '/u/:user',
    component: Repos
  }
]

const App = () => (
  <Switch>
    {routes.map((route, idx) => <Route {...route} key={idx} />)}
  </Switch>
)

export default App
