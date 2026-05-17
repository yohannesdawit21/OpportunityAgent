/**
 * Vercel Services entrypoint — exports the Express app (no listen()).
 * Local dev: npm run dev (uses src/index.ts with http.listen).
 */
import 'dotenv/config';
export { app as default } from './src/app.js';
