import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getSubjects } from '../api';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const [tasks, setTasks]         = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [filterSubject, setFilter] = useState('');
  const [form, setForm]           = useState({ title: '', subjectId: '', dueDate: '', priority: 'medium' });

  useEffect(() => {
    Promise.all([getTasks(), getSubjects()])
      .then(([tRes, sRes]) => { setTasks(tRes.data); setSubjects(sRes.data); })
      .catch(() => toast.error('Failed to load tasks'));
  }, []);

  const filtered = filterSubject ? tasks.filter(t => t.subject?._id === filterSubject) : tasks;
  const pending   = filtered.filter(t => !t.isCompleted);
  const completed = filtered.filter(t => t.isCompleted);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createTask(form);
      setTasks([data, ...tasks]);
      setShowForm(false);
      setForm({ title: '', subjectId: '', dueDate: '', priority: 'medium' });
      toast.success('Task created');
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const toggleTask = async (task) => {
    try {
      const { data } = await updateTask(task._id, { isCompleted: !task.isCompleted });
      setTasks(tasks.map(t => t._id === task._id ? data : t));
    } catch (e) { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch (e) { toast.error('Delete failed'); }
  };

  const TaskRow = ({ task }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
      background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '6px',
      opacity: task.isCompleted ? 0.5 : 1,
    }}>
      <button onClick={() => toggleTask(task)} style={{
        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, cursor: 'pointer',
        border: '1px solid var(--border-hover)',
        background: task.isCompleted ? 'var(--accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {task.isCompleted && <span style={{ color: '#fff', fontSize: '11px' }}>✓</span>}
      </button>
      <span style={{ flex: 1, fontSize: '13px', textDecoration: task.isCompleted ? 'line-through' : 'none' }}>{task.title}</span>
      {task.subject && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: task.subject.color }} />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{task.subject.name}</span>
        </div>
      )}
      {task.dueDate && (
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      )}
      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)} style={{ padding: '2px 8px' }}>×</button>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Task</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Task title</label>
                <input className="input" placeholder="What needs to be done?" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="label">Subject</label>
                <select className="input" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} required>
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Due date</label>
                <input className="input" type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="label">Priority</label>
                <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" type="submit">Add Task</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <select className="input" style={{ maxWidth: '220px' }} value={filterSubject} onChange={e => setFilter(e.target.value)}>
          <option value="">All subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
          PENDING ({pending.length})
        </h3>
        {pending.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>All done! Add new tasks above.</p>}
        {pending.map(t => <TaskRow key={t._id} task={t} />)}
      </div>

      {completed.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
            COMPLETED ({completed.length})
          </h3>
          {completed.map(t => <TaskRow key={t._id} task={t} />)}
        </div>
      )}
    </div>
  );
}