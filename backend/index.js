const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/batches',    require('./routes/batchRoutes'));
app.use('/api/schedules',  require('./routes/scheduleRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/tests',      require('./routes/testRoutes'));
app.use('/api/marks',      require('./routes/markRoutes'));
app.use('/api/materials',  require('./routes/materialRoutes'));
app.use('/api/stats',      require('./routes/statsRoutes'));

app.get('/', (req, res) => res.send('EduCoach API is running.'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
