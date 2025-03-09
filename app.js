const express = require('express')
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
    return res.status(404).json({ message: 'Movie not found' })
  }
  res.json(movie)
})

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})