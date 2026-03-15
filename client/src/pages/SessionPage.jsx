import { useEffect, useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { getSubjects } from '../api';
import toast from 'react-hot-toast';

const CIRCUMFERENCE = 2 * Math.PI * 54;

export default function SessionPage() {
  const { mode, timeLeft, isRunning, round, activeSubject, setActiveSubject,
          switchMode, start, pause, reset, formatTime, progress, MODES } = useTimer();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    getSubjects().then(({ data }) => setSubjects(data)).catch(() => toast.error('Failed to load subjects'));
  }, []);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const modeColors = { focus: '#7c6fff', short_break: '#4ecb8d', long_break: '#f0a040' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Study Session</h1>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>Round {round}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Timer */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '36px' }}>
            {Object.entries(MODES).map(([key, val]) => (
              <button key={key} onClick={() => switchMode(key)} style={{
                padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-main)', fontSize: '12px', fontWeight: 600, letterSpacing: '.03em',
                background: mode === key ? modeColors[key] : 'var(--bg-hover)',
                color: mode === key ? '#fff' : 'var(--text-muted)',
                transition: 'all .15s',
              }}>{val.label}</button>
            ))}
          </div>

          {/* SVG ring */}
          <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '24px' }}>
            <svg width="180" height="180" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle cx="60" cy="60" r="54" fill="none"
                stroke={modeColors[mode]} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset .5s' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: 500 }}>{formatTime(timeLeft)}</span>
              <span style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '2px' }}>{MODES[mode].label}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
            <button className="btn btn-primary" onClick={isRunning ? pause : start} style={{ minWidth: '90px', justifyContent: 'center' }}>
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button className="btn btn-secondary" onClick={() => switchMode(mode === 'focus' ? 'short_break' : 'focus')}>Skip</button>
          </div>

          {activeSubject && (
            <div style={{ marginTop: '20px', padding: '8px 16px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeSubject.color }} />
              <span style={{ fontSize: '12px' }}>{activeSubject.name}</span>
            </div>
          )}
        </div>

        {/* Subject selector */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Select subject</h3>
            {subjects.length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Add subjects first</p>}
            {subjects.map((s) => (
              <div key={s._id} onClick={() => setActiveSubject(s)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '6px',
                background: activeSubject?._id === s._id ? 'var(--accent-soft)' : 'var(--bg-primary)',
                border: `1px solid ${activeSubject?._id === s._id ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all .15s',
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.completedHours.toFixed(1)}h completed</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="card" style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Pomodoro guide</h3>
            {[
              ['Focus', '25 min deep work'],
              ['Short break', '5 min rest'],
              ['Long break', '15 min after 4 rounds'],
            ].map(([a, b]) => (
              <div key={a} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a}</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}