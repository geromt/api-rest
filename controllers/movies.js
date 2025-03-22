import { MovieModel } from '../models/mysql/movie.js'
import { validateMovie, validatePartialMovie } from '../schemas/movies.js'

export class MovieController {
  static async getAll (req, res) {
    const { genre } = req.query
    const movies = await MovieModel.getAll({ genre })
    res.json(movies)
  }

  static async getById (req, res) {
    const { id } = req.params
    const movie = await MovieModel.getById({ id })
    if (!movie) return res.status(404).json({ message: 'Movie not found' })
    res.json(movie)
  }

  static async create (req, res) {
    const result = validateMovie(req.body)
    if (!result.success) return res.status(400).json({ errors: JSON.parse(result.error) })

    const newMovie = await MovieModel.create({ input: result.data })
    res.status(201).json(newMovie)
  }

  static async update (req, res) {
    const result = validatePartialMovie(req.body)
    if (!result.success) return res.status(400).json({ errors: JSON.parse(result.error) })

    const { id } = req.params
    const updatedMovie = await MovieModel.update({ id, input: result.data })
    if (!updatedMovie) return res.status(404).json({ message: 'Movie not found' })
    res.json(updatedMovie)
  }

  static async delete (req, res) {
    const { id } = req.params
    const result = await MovieModel.delete({ id })
    if (!result) return res.status(404).json({ message: 'Movie not found' })
    res.status(204).end()
  }
}
