import dotenv from 'dotenv';
import app from './app.js';
import { clearSession } from './models/occupancyModel.js';

dotenv.config();
const port = process.env.PORT || 4000;

async function start() {
	await clearSession();
	app.listen(port, () => console.log(`Smart Classroom API listening on port ${port}`));
}

start().catch(error => {
	console.error('Unable to reset occupancy for the new server session:', error);
	process.exitCode = 1;
});
