import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendance';
import Performance from './pages/Performance';
import StudentLayout from './components/StudentLayout';
import FacultyLayout from './components/FacultyLayout';
import FacultySchedule from './pages/FacultySchedule';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyAttendanceRecords from './pages/FacultyAttendanceRecords';
import FacultyAttendance from './pages/FacultyAttendance';
import FacultyMaterial from './pages/FacultyMaterial';
import FacultyMarks from './pages/FacultyMarks';
import FacultyPerformance from './pages/FacultyPerformance';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminBatches from './pages/AdminBatches';
import AdminSchedule from './pages/AdminSchedule';
import AdminAttendance from './pages/AdminAttendance';
import AdminRecords from './pages/AdminRecords';
import Home from './pages/Home';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Materials from './pages/Materials';
import './App.css';

// Redirects unauthenticated users to /login.
// Redirects authenticated users to their own dashboard if they hit a wrong-role route.
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRole && role !== allowedRole) {
    if (role === 'admin')   return <Navigate to="/admin/dashboard"   replace />;
    if (role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

// Wraps a page with a layout inside a ProtectedRoute — keeps route definitions concise.
const AdminRoute = ({ path, element }) => (
  <ProtectedRoute allowedRole="admin">
    <AdminLayout>{element}</AdminLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"               element={<Home />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/forgot-password"        element={<ForgotPassword />} />
        <Route path="/reset-password/:token"  element={<ResetPassword />} />

        {/* Student routes */}
        <Route path="/student/dashboard"  element={<ProtectedRoute allowedRole="student"><StudentLayout><StudentDashboard /></StudentLayout></ProtectedRoute>} />
        <Route path="/student/schedule"   element={<ProtectedRoute allowedRole="student"><StudentLayout><Schedule /></StudentLayout></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute allowedRole="student"><StudentLayout><Attendance /></StudentLayout></ProtectedRoute>} />
        <Route path="/student/performance" element={<ProtectedRoute allowedRole="student"><StudentLayout><Performance /></StudentLayout></ProtectedRoute>} />
        <Route path="/student/materials"   element={<ProtectedRoute allowedRole="student"><StudentLayout><Materials /></StudentLayout></ProtectedRoute>} />
        <Route path="/student/change-password" element={<ProtectedRoute allowedRole="student"><StudentLayout><ChangePassword /></StudentLayout></ProtectedRoute>} />

        {/* Faculty routes */}
        <Route path="/faculty/dashboard"       element={<ProtectedRoute allowedRole="faculty"><FacultyLayout><FacultyDashboard /></FacultyLayout></ProtectedRoute>} />
        <Route path="/faculty/schedule"        element={<ProtectedRoute allowedRole="faculty"><FacultyLayout><FacultySchedule /></FacultyLayout></ProtectedRoute>} />
        <Route path="/faculty/attendance"         element={<ProtectedRoute allowedRole="faculty"><FacultyLayout><FacultyAttendance /></FacultyLayout></ProtectedRoute>} />
        <Route path="/faculty/attendance-records" element={<ProtectedRoute allowedRole="faculty"><FacultyLayout><FacultyAttendanceRecords /></FacultyLayout></ProtectedRoute>} />
        <Route path="/faculty/upload-material" element={<ProtectedRoute allowedRole="faculty"><FacultyLayout><FacultyMaterial /></FacultyLayout></ProtectedRoute>} />
        <Route path="/faculty/marks"           element={<ProtectedRoute allowedRole="faculty"><FacultyLayout><FacultyMarks /></FacultyLayout></ProtectedRoute>} />
        <Route path="/faculty/performance"     element={<ProtectedRoute allowedRole="faculty"><FacultyLayout><FacultyPerformance /></FacultyLayout></ProtectedRoute>} />
        <Route path="/faculty/change-password" element={<ProtectedRoute allowedRole="faculty"><FacultyLayout><ChangePassword /></FacultyLayout></ProtectedRoute>} />

        {/* Admin routes — all require role="admin" */}
        <Route path="/admin/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
        <Route path="/admin/users"     element={<AdminRoute element={<AdminUsers />} />} />
        <Route path="/admin/batches"   element={<AdminRoute element={<AdminBatches />} />} />
        <Route path="/admin/schedule"  element={<AdminRoute element={<AdminSchedule />} />} />
        <Route path="/admin/monitor"   element={<AdminRoute element={<AdminAttendance />} />} />
        <Route path="/admin/records"   element={<AdminRoute element={<AdminRecords />} />} />
        <Route path="/admin/change-password" element={<AdminRoute element={<ChangePassword />} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
