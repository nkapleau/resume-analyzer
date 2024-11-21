import { handler } from './signup_endpoint'

describe('register function', () => {
  // Mock data
  const users: { email: string; username: string; hashedPassword: string }[] = []

  // Mock helper functions for event and context
  const createEvent = (body: object | null = null, method = 'POST') => ({
    httpMethod: method,
    body: body ? JSON.stringify(body) : null,
  })

  const mockContext = {}

  beforeEach(() => {
    // Clear mock user database before each test
    users.splice(0, users.length)
  })

  it('returns 400 if required fields are missing', async () => {
    const event = createEvent({ email: 'user@example.com', password: 'securePassword' }) // Missing username

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toEqual({ error: 'All fields are required' })
  })

  it('returns 400 if email is already in use', async () => {
    // Add a mock user
    users.push({ email: 'user@example.com', username: 'user123', hashedPassword: 'hashedPwd' })

    const event = createEvent({
      email: 'user@example.com',
      password: 'securePassword',
      username: 'newUser123',
    })

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toEqual({ error: 'Email is already in use' })
  })

  it('returns 201 if registration is successful', async () => {
    const event = createEvent({
      email: 'newuser@example.com',
      password: 'securePassword',
      username: 'user123',
    })

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(201)
    expect(JSON.parse(response.body)).toEqual({ message: 'User registered' })
  })

  it('returns 405 if HTTP method is not POST', async () => {
    const event = createEvent({ email: 'user@example.com', password: 'securePassword', username: 'user123' }, 'GET')

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(405)
    expect(JSON.parse(response.body)).toEqual({ error: 'Method Not Allowed' })
  })

  it('returns 500 if an unexpected error occurs', async () => {
    const event = createEvent(null) // Malformed body

    const response = await handler(event as any, mockContext as any)

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ error: 'Internal Server Error' })
  })
})