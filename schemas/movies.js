import zod from 'zod'

const movieSchema = zod.object({
  title: zod.string({
    invalid_type_error: 'Title must be a string',
    required_error: 'Movie title is required'
  }).min(1),
  year: zod.number().int().min(1900).max(2025),
  director: zod.string(),
  duration: zod.number().int().min(1),
  poster: zod.string().url(),
  rate: zod.number().min(0).max(10).default(0),
  genre: zod.array(zod.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Sci-Fi', 'Thriller', 'Western'])).min(1)
})

export function validateMovie (movie) {
  return movieSchema.safeParse(movie) // Devuelve un objeto result que dice si es válido o no
}

export function validatePartialMovie (movie) {
  return movieSchema.partial().safeParse(movie) // Todas las propiedades del schema son opcionales
}

// module.exports = { validateMovie, validatePartialMovie }
