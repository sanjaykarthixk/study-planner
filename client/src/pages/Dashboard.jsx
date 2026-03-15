import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalytics, getTasks, updateTask } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, tRes] = await Promise.all([getAnalytics(), getTasks()]);
        setAnalytics(aRes.data);
        setTasks(tRes.data.filter(t => !t.isCompleted).slice(0, 5));
      } catch (e) { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const toggleTask = async (task) => {
    try {
      await updateTask(task._id, { isCompleted: !task.isCompleted });
      setTasks(tasks.filter(t => t._id !== task._id));
    } catch (e) { toast.error('Failed to update task'); }
  };

  const fmtHours = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60), m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Good day, {user?.name?.split(' ')[0]} 👋</h1>
        <Link to="/session" className="btn btn-primary">Start Session</Link>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '20px' }}>
        {[
          { label: 'Today', value: fmtHours(analytics?.todayMinutes), sub: 'study time' },
          { label: 'This week', value: fmtHours(analytics?.weekMinutes), sub: 'total focus' },
          { label: 'Streak', value: `${analytics?.streak || 0} days`, sub: 'keep it up 🔥' },
        ].map((s) => (
          <div key={s.label} className="card">
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Subjects progress */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Subjects</span>
            <Link to="/subjects" style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none' }}>Manage</Link>
          </div>
          {analytics?.subjects?.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No subjects yet. <Link to="/subjects" style={{ color: 'var(--accent)' }}>Add one</Link></p>
          )}
          {analytics?.subjects?.map((s) => {
            const pct = s.targetHours > 0 ? Math.min(100, Math.round((s.completedHours / s.targetHours) * 100)) : 0;
            return (
              <div key={s._id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: '12px' }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{pct}%</span>
                </div>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: '2px', transition: 'width .4s' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending tasks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Pending tasks</span>
            <Link to="/tasks" style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none' }}>View all</Link>
          </div>
          {tasks.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>All caught up!</p>}
          {tasks.map((task) => (
            <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', padding: '8px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
              <button onClick={() => toggleTask(task)} style={{
                width: '16px', height: '16px', borderRadius: '4px', border: '1px solid var(--border-hover)',
                background: 'transparent', cursor: 'pointer', flexShrink: 0,
              }} />
              <span style={{ fontSize: '12px', flex: 1 }}>{task.title}</span>
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}