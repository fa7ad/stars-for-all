import React from 'react'
import qs from 'qs'

import { Input } from 'antd'

import './Home.css'

class Home extends React.Component {
  state = {
    loggedIn: false
  }

  render () {
    return (
      <div className='Home al-c ju-c'>
        <label className='p-5 bg-white'>
          GitHub Username:
          <Input type='text' placeholder='@fa7ad' />
        </label>
      </div>
    )
  }

  componentDidMount () {
    const { location } = this.props
    if (location && location.search) {
      const parsed = qs.parse(location.search.slice(1))
      fetch('/verify', {
        method: 'POST',
        body: JSON.stringify(parsed)
      })
        .then(r => r.json())
        .then(res => {
          if (res.ok && res.id === parsed.id) {
            this.setState({
              loggedIn: true
            })
          }
        })
    }
  }
}

export default Home
