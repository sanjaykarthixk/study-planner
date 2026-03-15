import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/',          label: 'Dashboard' },
  { to: '/subjects',  label: 'Subjects'  },
  { to: '/session',   label: 'Session'   },
  { to: '/tasks',     label: 'Tasks'     },
  { to: '/notes',     label: 'Notes'     },
  { to: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{
      background: '#0d0d0f', borderBottom: '1px solid #1e1e28',
      padding: '0 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: '56px', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#c8c2ff', letterSpacing: '.04em' }}>
          ◈ StudyOS
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              letterSpacing: '.03em', textDecoration: 'none',
              color: location.pathname === link.to ? '#c8c2ff' : '#5a5a66',
              background: location.pathname === link.to ? '#1a1a22' : 'transparent',
              borderLeft: location.pathname === link.to ? '2px solid #7c6fff' : '2px solid transparent',
              transition: 'all .15s',
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '12px', color: '#5a5a66', fontFamily: 'JetBrains Mono, monospace' }}>
          {user?.name}
        </span>
        <button onClick={handleLogout} style={{
          padding: '5px 12px', borderRadius: '6px', background: 'transparent',
          border: '1px solid #2e2e3a', color: '#6a6a7a', fontSize: '12px',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
}