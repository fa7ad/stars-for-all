import React from 'react'
import qs from 'qs'
import req from '../../utils/request'
import { Input, Button, Icon } from 'antd'

import './Home.css'

const UserInput = props => {
  let ref = null
  const onEnter = e => props.onEnter(ref.input.value)

  return (
    <label className='p-5 bg-white' title='Enter a username and press Enter'>
      GitHub Username:
      <Input
        type='text'
        placeholder='fa7ad'
        ref={el => (ref = el)}
        onPressEnter={onEnter}
        addonBefore={<Icon type='user-add' />}
        addonAfter={<Icon type='enter' onClick={onEnter} />}
      />
    </label>
  )
}

const GHAuthorize = p => (
  <Button onClick={e => window.location.replace(p.path)}>
    Authorize GitHub
  </Button>
)

class Home extends React.Component {
  state = {
    loggedIn: false
  }

  render () {
    return (
      <div className='Home al-c ju-c'>
        {this.state.loggedIn
          ? <UserInput onEnter={text => console.log(text)} />
          : <GHAuthorize path='/login' />}
      </div>
    )
  }

  componentDidMount () {
    const { location } = this.props
    if (location && location.search) {
      req
        .url('/verify')
        .json(qs.parse(location.search.slice(1)))
        .post()
        .json(res => {
          this.setState({ loggedIn: res.ok })
        })
    }
  }
}

export default Home
