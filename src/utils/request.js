import wretch from 'wretch'

export default wretch()
  .url(`http://${process.env.HOST}:${process.env.PORT}`)
  .options({ credentials: 'include', mode: 'cors' })
