import React from 'react'
import Route from 'react-router-dom/Route'
import Switch from 'react-router-dom/Switch'
import Home from './Home'
import './App.css'

export const routes = [
  {
    key: 0,
    path: '/',
    exact: true,
    component: Home
  }
]

const App = () => (
  <Switch>
    {routes.map(route => <Route {...route} />)}
  </Switch>
)

export default App
