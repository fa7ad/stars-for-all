import React from 'react'

import './Repos.css'

class Repos extends React.Component {
  render () {
    return (
      <div className='repos'>
        {this.props.match.params.user}
      </div>
    )
  }
}

export default Repos
