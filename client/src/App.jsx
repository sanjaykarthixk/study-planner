import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubjectsPage from './pages/SubjectsPage';
import SessionPage from './pages/SessionPage';
import NotesPage from './pages/NotesPage';
import TasksPage from './pages/TasksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <div className="app">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login"     element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register"  element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/"          element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/subjects"  element={<PrivateRoute><SubjectsPage /></PrivateRoute>} />
          <Route path="/session"   element={<PrivateRoute><SessionPage /></PrivateRoute>} />
          <Route path="/notes"     element={<PrivateRoute><NotesPage /></PrivateRoute>} />
          <Route path="/tasks"     element={<PrivateRoute><TasksPage /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <TimerProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a22',
                color: '#e8e6e0',
                border: '1px solid #2e2e3a',
              },
            }}
          />
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}