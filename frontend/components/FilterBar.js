import React from 'react';

export default function FilterBar({ taskFilter, setTaskFilter }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <button className="btn btn-outline-primary btn-sm" onClick={() => setTaskFilter('all')}>Show All</button>
      <button className="btn btn-outline-primary btn-sm" onClick={() => setTaskFilter('pending')}>Show Active</button>
      <button className="btn btn-outline-success btn-sm" onClick={() => setTaskFilter('completed')}>Show Completed</button>
      <button className="btn btn-outline-warning btn-sm" onClick={() => setTaskFilter('on-hold')}>Show On Hold</button>
    </div>
  );
}
