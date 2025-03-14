import express, { json } from 'express'
// import moviesJson from './movies.json' with { type: 'json' } // Importamos el archivo JSON que no sirve al a fecha
import { validateMovie, validatePartialMovie } from './schemas/movies.js'
import cors from 'cors'

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const moviesJson = require('./movies.json')

// REST es una arquitectura de software se basa en:
// - Simplicidad
// - Escalabilidad
// - Portabilidad
// - Fiabilidad
// - Visibilidad
// - Fácil de modificar
// Recursos: Cada recurso se identifica con una URL
// Verbos HTTP: GET, POST, PUT, DELETE para definir las operaciones que se pueden realizar sobre los recursos
// Representaciones: XML, JSON, HTML, etc.
// Stateless: El cliente debería poder decidir la representación de un recurso. El servidor no debería guardar información sobre el estado del cliente
// Interfaz uniforme
// Separación de conceptos cliente/servidor

const app = express()
app.disable('x-powered-by')

app.use(json())
/* app.use(cors({
  origin: 'http://localhost:8080'
})) */ // Middleware de CORS. Para evitar agregar cabeceras a cada endpoint, se puede usar un middleware
app.use(cors())

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' })
})

app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const moviesByGenre = moviesJson.filter(movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase()))
    return res.json(moviesByGenre)
  }
  res.json(moviesJson)
})

// Segmento dinámico
app.get('/movies/:id', (req, res) => {
  const { id } = req.params // Recuperamos el id de la URL
  const movie = moviesJson.find(movie => movie.id === id)
  if (!movie) {
    return res.status(400).json({ message: 'Movie not found' })
  }
  res.json(movie)
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (!result.success) {
    return res.status(400).json({ errors: result.error })
  }

  const { title, year, director, duration, poster, rate, genre } = req.body

  const newMovie = {
    id: crypto.randomUUID(),
    title,
    year,
    director,
    duration,
    poster,
    rate: rate || 0,
    genre
  }

  moviesJson.push(newMovie)
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const result = validatePartialMovie(req.body)
  if (!result.success) {
    return res.status(400).json({ errors: result.error })
  }

  const movieIndex = moviesJson.findIndex(movie => movie.id === id)
  if (movieIndex < 0) return res.status(404).json({ message: 'Movie not found' })

  const updateMovie = {
    ...moviesJson[movieIndex],
    ...req.body
  }
  moviesJson[movieIndex] = updateMovie

  res.status(200).json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  // res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  const { id } = req.params
  const movieIndex = moviesJson.findIndex(movie => movie.id === id)
  if (movieIndex < 0) return res.status(404).json({ message: 'Movie not found' })

  moviesJson.splice(movieIndex, 1)
  res.status(204).end()
})

// Para los métodos complejos, como PUT, PATCH o DELETE, antes se manda una petición OPTIONS que también debe
// responder con los headers de CORS
app.options('/movies/:id', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.status(200).end()
})

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
