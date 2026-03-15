import { useState, useEffect } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api';
import toast from 'react-hot-toast';

const COLORS = ['#7c6fff','#4ecb8d','#f0a040','#e25454','#4eb5e2','#e24ecb','#cbcc4e'];

export default function SubjectsPage() {
  const [subjects, setSubjects]   = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState({ name: '', color: COLORS[0], targetHours: 10, description: '' });
  const [loading, setLoading]     = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await getSubjects(); setSubjects(data); }
    catch (e) { toast.error('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  const openEdit = (s) => {
    setEditItem(s);
    setForm({ name: s.name, color: s.color, targetHours: s.targetHours, description: s.description });
    setShowForm(true);
  };

  const resetForm = () => { setShowForm(false); setEditItem(null); setForm({ name: '', color: COLORS[0], targetHours: 10, description: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        const { data } = await updateSubject(editItem._id, form);
        setSubjects(subjects.map(s => s._id === editItem._id ? data : s));
        toast.success('Subject updated');
      } else {
        const { data } = await createSubject(form);
        setSubjects([data, ...subjects]);
        toast.success('Subject created');
      }
      resetForm();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await deleteSubject(id);
      setSubjects(subjects.filter(s => s._id !== id));
      toast.success('Subject deleted');
    } catch (e) { toast.error('Failed to delete'); }
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subjects</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancel' : '+ Add Subject'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>{editItem ? 'Edit Subject' : 'New Subject'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Subject name</label>
                <input className="input" placeholder="e.g. Data Structures" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="label">Target hours</label>
                <input className="input" type="number" min="1" max="1000" value={form.targetHours}
                  onChange={e => setForm({...form, targetHours: Number(e.target.value)})} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <input className="input" placeholder="Optional description" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="label">Color</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({...form, color: c})} style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: c, border: 'none',
                    cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px',
                  }} />
                ))}
              </div>
            </div>
            <button className="btn btn-primary" type="submit">{editItem ? 'Save Changes' : 'Create Subject'}</button>
          </form>
        </div>
      )}

      <div className="grid-3">
        {subjects.map((s) => {
          const pct = s.targetHours > 0 ? Math.min(100, Math.round((s.completedHours / s.targetHours) * 100)) : 0;
          return (
            <div key={s._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>Del</button>
                </div>
              </div>
              {s.description && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{s.description}</p>}
              <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.completedHours.toFixed(1)}h / {s.targetHours}h</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: s.color }}>{pct}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: '2px' }} />
              </div>
            </div>
          );
        })}
      </div>
      {subjects.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No subjects yet. Add your first subject to get started!
        </div>
      )}
    </div>
  );
}