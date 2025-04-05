import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let email, password;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    email = body.email;
    password = body.password;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // TODO: Replace with real user creation logic
    console.log('Registering user:', email);
    return res.status(201).json({ success: true, message: 'User registered' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}