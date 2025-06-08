import React from 'react';

export default function TaskForm({ formOpen, setFormOpen, newTask, setNewTask, handleCreateTask }) {
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s', border: formOpen ? '2px solid #007bff' : '1px solid #ccc' }} onClick={() => setFormOpen(true)}>
      {!formOpen && (
        <div style={{ textAlign: 'center', opacity: 0.7 }}>
          <h3 style={{ marginBottom: 8 }}>Create New Task</h3>
          <p style={{ fontSize: 16 }}>Click to add a new task</p>
        </div>
      )}
      {formOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.2)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setFormOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              minWidth: 400,
              maxWidth: 500,
              width: '90%',
              minHeight: 300,
              boxShadow: '0 4px 24px #0002',
              padding: 32,
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: 2,
                right: 5,
                background: 'none',
                border: 'none',
                fontSize: 22,
                cursor: 'pointer',
              }}
              onClick={() => setFormOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <form onSubmit={handleCreateTask}>
              <div className="mb-3">
                <input type="text" className="form-control" id="title" placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
              </div>
              <div className="mb-3">
                <textarea className="form-control" id="description" placeholder="Task Description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} required></textarea>
              </div>
              <div className="mb-3">
                <input type="file" className="form-control" id="file" onChange={e => setNewTask({ ...newTask, file: e.target.files[0] })} />
              </div>
              <div className="mb-3">
                <label>Start Date</label>
                <input type="date" className="form-control" value={newTask.startDate} onChange={e => setNewTask({ ...newTask, startDate: e.target.value })} />
                <label>Start Time</label>
                <input type="time" className="form-control" value={newTask.startTime} onChange={e => setNewTask({ ...newTask, startTime: e.target.value })} />
              </div>
              <div className="mb-3">
                <label>End Date</label>
                <input type="date" className="form-control" value={newTask.endDate} onChange={e => setNewTask({ ...newTask, endDate: e.target.value })} />
                <label>End Time</label>
                <input type="time" className="form-control" value={newTask.endTime} onChange={e => setNewTask({ ...newTask, endTime: e.target.value })} />
              </div>
              <div className="mb-3">
                <label>Status</label>
                <select className="form-control" value="active" disabled>
                  <option value="active">Active</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100">Create Task</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
