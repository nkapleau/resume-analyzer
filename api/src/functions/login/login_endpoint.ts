import type { APIGatewayEvent, Context } from 'aws-lambda'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { users } from '../signup/signup_endpoint'

const JWT_SECRET = 'your-secret-key' // Replace with a strong secret key
const JWT_EXPIRATION = '1h' // Token expiration time (1 hour)

export const handler = async (event: APIGatewayEvent, _context: Context) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      }
    }

    const body = JSON.parse(event.body || '{}')
    const { email, password } = body

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' }),
      }
    }

    // Find the user by email
    const user = users.find((user) => user.email === email)
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid email or password' }),
      }
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid email or password' }),
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, username: user.username }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: JWT_EXPIRATION } // Token expiration
    )

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    }
  } catch (error) {
    //console.error('Login error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    }
  }
}