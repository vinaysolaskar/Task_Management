import React from 'react';

export default function TaskCard({ task, formatDateTime, handleEditTask, handleDeleteTask, handleUpdateTaskStatus }) {
  return (
    <div className={`card my-2 shadow-sm task-filter-${task.status}`} style={{ marginBottom: 0 }}>
      <div className="card-body">
        <h5 className="card-title">{task.title}</h5>
        <p className="card-text">{task.description}</p>
        <p><strong>Start:</strong> {formatDateTime(task.startDate)}</p>
        <p><strong>End:</strong> {formatDateTime(task.endDate)}</p>
        <p><strong>File Link:</strong> {task.fileUrl ? (() => {
          const match = task.fileUrl.match(/id=([^&]+)/);
          const fileId = match ? match[1] : null;
          const viewUrl = fileId ? `https://drive.google.com/file/d/${fileId}/view` : task.fileUrl;
          const downloadUrl = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : task.fileUrl;
          return (<>
            <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mx-1">View</a>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-success btn-sm mx-1">Download</a>
          </>);
        })() : ('No file attached')}</p>
        <p>
          <strong>Status: </strong>
          <select className="form-control d-inline w-auto ml-2" value={task.status} onChange={e => handleUpdateTaskStatus(task.id, e.target.value)}>
            <option value="pending">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </p>
        <button className="btn btn-info" onClick={() => handleEditTask(task)}>Edit</button>
        <span style={{ display: 'inline-block', width: 12 }}></span>
        <button className="btn btn-danger ml-5" onClick={() => handleDeleteTask(task.id)}>Delete</button>
      </div>
    </div>
  );
}
