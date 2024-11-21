import { APIGatewayEvent, Context } from '@redwoodjs/api'
import bcrypt from 'bcryptjs'

interface User {
  email: string
  passwordHash: string
  username: string
}

let users: User[] = []

export const handler = async (event: APIGatewayEvent, context: Context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { email, password, username } = JSON.parse(event.body || '{}')

    // Input validation
    if (!email || !password || !username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      }
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email format' }),
      }
    }

    // Check email uniqueness
    if (users.some((user) => user.email === email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email already in use' }),
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Store the user
    users.push({ email, passwordHash, username })

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