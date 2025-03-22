import mysql from 'mysql2/promise'

const config = {
  host: 'localhost',
  user: 'root',
  port: 3307,
  password: '',
  database: 'moviesdb'
}

const connection = await mysql.createConnection(config)

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      const lowerCaseGenre = genre.toLowerCase()

      const [genres] = await connection.query(
        'SELECT id, name FROM genres WHERE LOWER(name) = ?;',
        [lowerCaseGenre]
      )

      if (genres.length === 0) return []

      const [movies] = await connection.query(
        'SELECT title, year, director, duration, rate, HEX(id) id FROM movies INNER JOIN movie_genres ON id = movie_id WHERE movie_genres.genre_id = ?;',
        [genres[0].id])

      await Promise.all(movies.map(async movie => {
        console.log(movie.id)
        const [genres] = await connection.query(
          'SELECT name FROM genres INNER JOIN movie_genres ON genres.id = movie_genres.genre_id WHERE movie_genres.movie_id = UNHEX(?);',
          [movie.id]
        )
        console.log(genres)
        movie.genres = genres.map(genre => genre.name)
      }))

      return movies
    }

    const [movies] = await connection.query(
      'SELECT title, year, director, duration, rate, HEX(id) id FROM movies;'
    )

    return movies
  }

  static async getById ({ id }) {
    const [movie] = await connection.query(
      'SELECT title, year, director, duration, rate, HEX(id) id FROM movies WHERE HEX(id) = ?;',
      [id]
    )

    return movie
  }

  static async create ({ input }) {
    const [rows] = await connection.query("SELECT UNHEX(REPLACE(UUID(), '-','')) as uuid")
    const uuid = rows[0].uuid

    await connection.query(
      'INSERT INTO movies (id, title, year, director, duration, poster, rate) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [uuid, input.title, input.year, input.director, input.duration, input.poster, input.rate]
    )
    input.genre.forEach(async genre => {
      const lowerCaseGenre = genre.toLowerCase()
      const [genres] = await connection.query(
        'SELECT id, name FROM genres WHERE LOWER(name) = ?;',
        [lowerCaseGenre]
      )
      await connection.query(
        'INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?);', [uuid, genres[0].id]
      )
    })
  }

  static async delete ({ id }) {

  }

  static async update ({ id, input }) {

  }
}
