const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const produkRoutes = require('./routes/produkRoutes');
app.use('/api/produk', produkRoutes);
const produkFotoRoutes = require('./routes/produkFotoRoutes');
app.use('/api/produk-foto', produkFotoRoutes);
const pengaturanRoutes = require('./routes/pengaturanRoutes');
app.use('/api/pengaturan', pengaturanRoutes);
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));
app.use(express.static(require('path').join(__dirname, '../public')));
app.get('/', (req, res) => {
    res.json({ message: 'API UMKM Kasih Ibu berjalan' });
});

module.exports = app;