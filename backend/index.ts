/**
 * Vercel Services entrypoint — export API router only (routePrefix `/api` is stripped).
 * Local dev uses src/index.ts which mounts apiApp at /api.
 */
export { apiApp as default } from './src/apiApp.js';
