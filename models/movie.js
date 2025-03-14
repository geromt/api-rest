import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const moviesJson = require('../movies.json')

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      return moviesJson.filter(movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase()))
    }
    return moviesJson
  }

  static async getById ({ id }) {
    return moviesJson.find(movie => movie.id === id)
  }

  static async create ({ input }) {
    const newMovie = {
      id: crypto.randomUUID(),
      ...input
    }

    moviesJson.push(newMovie)
    return newMovie
  }

  static async delete ({ id }) {
    const movieIndex = moviesJson.findIndex(movie => movie.id === id)
    if (movieIndex < 0) return false

    moviesJson.splice(movieIndex, 1)
    return true
  }

  static async update ({ id, input }) {
    const movieIndex = moviesJson.findIndex(movie => movie.id === id)
    if (movieIndex < 0) return false

    const updatedMovie = {
      ...moviesJson[movieIndex],
      ...input
    }
    moviesJson[movieIndex] = updatedMovie
    return updatedMovie
  }
}
