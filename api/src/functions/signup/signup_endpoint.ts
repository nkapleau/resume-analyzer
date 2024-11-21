import { APIGatewayEvent, Context } from 'aws-lambda'
import bcrypt from 'bcrypt'

export interface User {
  email: string
  username: string
  hashedPassword: string
}

export const users: User[] = [{ email: 'user@example.com', username: 'user123', hashedPassword: 'hashedPwd' }, ] // Simulating a database

export const handler = async (event: APIGatewayEvent, _context: Context) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      }
    }

    const body = JSON.parse(event.body || '{}')
    const { email, password, username } = body

    if (!email || !password || !username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'All fields are required' }),
      }
    }

    // Check if email is already registered
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is already in use' }),
      }
    }

    // Hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Save the user
    users.push({
      email,
      username,
      hashedPassword,
    })

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User registered' }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    }
  }
}
