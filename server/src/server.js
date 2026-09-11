import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Smart Classroom API listening on port ${port}`));
