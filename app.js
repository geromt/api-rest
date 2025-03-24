import express, { json } from 'express'
import { createMovieRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'

export const createApp = ({ movieModel }) => {
  const app = express()
  app.disable('x-powered-by')

  app.use(json())
  app.use(corsMiddleware())

  app.get('/', (req, res) => {
    res.json({ message: 'Hello World' })
  })

  app.use('/movies', createMovieRouter({ movieModel }))

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' })
  })

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}
