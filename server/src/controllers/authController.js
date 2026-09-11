import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT id, name, email, password_hash FROM admins WHERE email = $1', [email]);
    const admin = result.rows[0];
    if (!admin || !(await bcrypt.compare(password || '', admin.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (error) { next(error); }
}
