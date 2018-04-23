import React from 'react'
import {Route, Switch} from 'react-router-dom'

import Home from './pages/Home'

import './App.css'

export const routes = [
  {
    path: '/',
    exact: true,
    component: Home
  }
]

const App = () => (
  <Switch>
    {routes.map((route, idx) => <Route {...route} key={idx} />)}
  </Switch>
)

export default App
