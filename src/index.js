const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const pegawaiRoutes = require('./routes/pegawai.routes');
const authRoutes = require('./routes/authRoutes');

// ... existing code ...

app.use(express.json());
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/auth', authRoutes);

// ... existing code ...

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
