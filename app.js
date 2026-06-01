const express = require('express');
const app  = express();
const port = 3000;
const path = require('path');
const db = require('./models');

const authRoutes        = require('./routes/auth.routes');
const keluargaRoutes    = require('./routes/keluarga.routes');
const dokumenRoutes     = require('./routes/dokumen.routes');
const jurusanRoutes     = require('./routes/jurusan.routes');
const rayonRoutes       = require('./routes/rayon.routes');
const rombleRoutes      = require('./routes/romble.routes');
const siswaRoutes       = require('./routes/siswa.routes');
const approvedRoutes    = require('./routes/approved.routes');
const dashboardRoutes   = require('./routes/dashboard.routes');
const semesterRoutes    = require('./routes/semester.routes');
const tahunajaranRoutes = require('./routes/tahunajaran.routes');

db.sequelize.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.error('DB Error:', err));

// CORS - izinkan semua origin untuk development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth',        authRoutes);
app.use('/keluarga',    keluargaRoutes);
app.use('/dokumen',     dokumenRoutes);
app.use('/jurusan',     jurusanRoutes);
app.use('/rayon',       rayonRoutes);
app.use('/romble',      rombleRoutes);
app.use('/semester',    semesterRoutes);
app.use('/tahunajaran', tahunajaranRoutes);
app.use('/siswa',       siswaRoutes);
app.use('/dashboard',   dashboardRoutes);
app.use('/approved',    approvedRoutes);

app.get('/', (req, res) => res.send('API SIDATA - v1.0'));
app.listen(port, () => console.log(`Server running on port ${port}`));
