import { handler } from './login_endpoint'
import { users } from './signup_endpoint'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

describe('login function', () => {
  const createEvent = (body: object | null = null, method = 'POST') => ({
    httpMethod: method,
    body: body ? JSON.stringify(body) : null,
  })

  const mockContext = {}

  const testUser = {
    email: 'user@example.com',
    username: 'user123',
    password: 'securePassword',
  }

  beforeEach(async () => {
    // Clear the shared `users` array
    users.splice(0, users.length)

    // Add a test user with a hashed password
    const hashedPassword = await bcrypt.hash(testUser.password, 10)
    users.push({
      email: testUser.email,
      username: testUser.username,
      hashedPassword,
    })
  })

  it('returns 400 if required fields are missing', async () => {
    const event = createEvent({ email: testUser.email }) // Missing password

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toEqual({ error: 'Email and password are required' })
  })

  it('returns 401 if the email does not exist', async () => {
    const event = createEvent({ email: 'nonexistent@example.com', password: 'wrongPassword' })

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(401)
    expect(JSON.parse(response.body)).toEqual({ error: 'Invalid email or password' })
  })

  it('returns 401 if the password is incorrect', async () => {
    const event = createEvent({ email: testUser.email, password: 'wrongPassword' })

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(401)
    expect(JSON.parse(response.body)).toEqual({ error: 'Invalid email or password' })
  })

  it('returns 200 and a JWT token if the login is successful', async () => {
    const event = createEvent({ email: testUser.email, password: testUser.password })

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(200)

    const responseBody = JSON.parse(response.body)
    expect(responseBody).toHaveProperty('token')

    // Verify the token
    const decoded = jwt.verify(responseBody.token, 'your-secret-key') // Use the same secret as in the function
    expect(decoded).toMatchObject({
      email: testUser.email,
      username: testUser.username,
    })
  })

  it('returns 405 if HTTP method is not POST', async () => {
    const event = createEvent({ email: testUser.email, password: testUser.password }, 'GET')

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(405)
    expect(JSON.parse(response.body)).toEqual({ error: 'Method Not Allowed' })
  })

  it('returns 500 if an unexpected error occurs', async () => {
    const event = { httpMethod: 'POST', body: '{invalidJson}' } // Malformed JSON

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ error: 'Internal Server Error' })
  })
})
