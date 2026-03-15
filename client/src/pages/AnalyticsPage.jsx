import { useState, useEffect } from 'react';
import { getAnalytics } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const fmtHours = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60), m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const dailyChartData = data?.dailyData?.map(d => ({
    date: d._id.slice(5),
    hours: parseFloat((d.minutes / 60).toFixed(2)),
  })) || [];

  const subjectPieData = data?.subjectData?.map(s => ({
    name: s.name,
    value: parseFloat((s.totalMinutes / 60).toFixed(2)),
    color: s.color,
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1a1a22', border: '1px solid #2e2e3a', borderRadius: '8px', padding: '10px 14px' }}>
        <p style={{ fontSize: '12px', color: '#6a6a7a', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{payload[0].value}h</p>
      </div>
    );
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading analytics...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
      </div>

      {/* Summary stats */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Today',     value: fmtHours(data?.todayMinutes) },
          { label: 'This week', value: fmtHours(data?.weekMinutes)  },
          { label: 'Streak',    value: `${data?.streak || 0} days`  },
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Daily bar chart */}
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>Hours per day (last 7 days)</h3>
          {dailyChartData.length === 0
            ? <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No sessions this week yet</p>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyChartData} barSize={20}>
                  <XAxis dataKey="date" tick={{ fill: '#6a6a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6a6a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,111,255,0.05)' }} />
                  <Bar dataKey="hours" fill="#7c6fff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Subject pie chart */}
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>Time by subject</h3>
          {subjectPieData.length === 0
            ? <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No sessions recorded yet</p>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={subjectPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {subjectPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}h`, 'Hours']}
                    contentStyle={{ background: '#1a1a22', border: '1px solid #2e2e3a', borderRadius: '8px' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* Task completion */}
      {data?.taskStats && (
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>Task completion</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px', background: 'var(--green)',
                width: data.taskStats.total > 0 ? `${Math.round((data.taskStats.completed / data.taskStats.total) * 100)}%` : '0%',
                transition: 'width .5s',
              }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', minWidth: '60px', textAlign: 'right' }}>
              {data.taskStats.completed}/{data.taskStats.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}