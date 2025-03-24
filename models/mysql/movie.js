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
  getAll = async ({ genre }) => {
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

  getByI = async ({ id }) => {
    const [movie] = await connection.query(
      'SELECT title, year, director, duration, rate, HEX(id) id FROM movies WHERE HEX(id) = ?;',
      [id]
    )

    return movie
  }

  create = async ({ input }) => {
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

  delete = async ({ id }) => {
    await connection.query('DELETE FROM movie_genres WHERE HEX(movie_id) = ?;', [id])
    const [deletedElem] = await connection.query('DELETE FROM movies WHERE HEX(id) = ?;', [id])
    console.log(deletedElem)
    return deletedElem
  }

  update = async ({ id, input }) => {
    const statementString = ['UPDATE movies SET']
    Object.keys(input).forEach(key => {
      statementString.push(`${key} = ?`)
      statementString.push(',')
    })
    statementString.pop()
    statementString.push('WHERE HEX(id) = ?;')
    await connection.query(statementString.join(' '), Object.values(input).concat(id))
    return await MovieModel.getById({ id })
  }
}
