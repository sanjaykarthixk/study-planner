import { useState, useEffect } from 'react';
import { getNotes, createNote, updateNote, deleteNote, getSubjects } from '../api';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const [notes, setNotes]         = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [filterSubject, setFilter]  = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ title: '', subjectId: '', content: '' });
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    Promise.all([getNotes(), getSubjects()])
      .then(([nRes, sRes]) => { setNotes(nRes.data); setSubjects(sRes.data); })
      .catch(() => toast.error('Failed to load'));
  }, []);

  const filtered = filterSubject ? notes.filter(n => n.subject?._id === filterSubject) : notes;

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createNote({ subjectId: form.subjectId, title: form.title, content: form.content });
      setNotes([data, ...notes]);
      setActiveNote(data);
      setShowForm(false);
      setForm({ title: '', subjectId: '', content: '' });
      toast.success('Note created');
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleSave = async () => {
    if (!activeNote) return;
    setSaving(true);
    try {
      const { data } = await updateNote(activeNote._id, { title: activeNote.title, content: activeNote.content });
      setNotes(notes.map(n => n._id === data._id ? data : n));
      toast.success('Saved');
    } catch (e) { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete note?')) return;
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n._id !== id));
      if (activeNote?._id === id) setActiveNote(null);
      toast.success('Deleted');
    } catch (e) { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notes</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Note</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Title</label>
                <input className="input" placeholder="Note title" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="label">Subject</label>
                <select className="input" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} required>
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" type="submit">Create</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', minHeight: '500px' }}>
        {/* Notes list */}
        <div>
          <select className="input" value={filterSubject} onChange={e => setFilter(e.target.value)} style={{ marginBottom: '12px' }}>
            <option value="">All subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          {filtered.map(note => (
            <div key={note._id} onClick={() => setActiveNote({...note})} style={{
              padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '6px',
              background: activeNote?._id === note._id ? 'var(--accent-soft)' : 'var(--bg-card)',
              border: `1px solid ${activeNote?._id === note._id ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all .15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{note.title}</span>
                <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(note._id); }}
                  style={{ padding: '2px 6px', fontSize: '10px' }}>×</button>
              </div>
              {note.subject && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: note.subject.color }} />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{note.subject.name}</span>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '12px' }}>No notes yet</p>}
        </div>

        {/* Editor */}
        {activeNote ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <input value={activeNote.title} onChange={e => setActiveNote({...activeNote, title: e.target.value})}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-main)', flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <textarea value={activeNote.content}
              onChange={e => setActiveNote({...activeNote, content: e.target.value})}
              placeholder="Start writing your notes here..."
              style={{
                flex: 1, minHeight: '400px', background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontFamily: 'var(--font-main)', fontSize: '14px',
                lineHeight: 1.7, resize: 'none',
              }}
            />
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Select a note to edit or create a new one
          </div>
        )}
      </div>
    </div>
  );
}