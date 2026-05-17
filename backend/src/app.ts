import express from 'express';
import { apiApp } from './apiApp.js';

/** Local dev: mount API routes under /api (matches Vite proxy). */
export const app = express();
app.use('/api', apiApp);
