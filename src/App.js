import React from 'react'
import Route from 'react-router-dom/Route'
import Switch from 'react-router-dom/Switch'
import Home from './Home'
import './App.css'

const Random = p => (
  <div>{Math.random()}</div>
)

export const routes = [
  {
    key: 0,
    path: '/',
    exact: true,
    component: Home
  },
  {
    key: 1,
    path: '/rand',
    component: Random
  }
]

const App = () => (
  <Switch>
    {routes.map(route => <Route {...route} />)}
  </Switch>
)

export default App
