import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import pegawaiRoutes from './routes/pegawai.routes.js';
import absenRoutes from './routes/absenRoutes.js';
// Ensure this path is correct and the file exists
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url';

// ... existing code ...

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Baca file JSON secara manual
const swaggerDocument = JSON.parse(fs.readFileSync(new URL('../swagger.json', import.meta.url), 'utf-8'));

dotenv.config();

// ... existing code ...

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Middleware untuk mem-parsing JSON dan URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/absen', absenRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));