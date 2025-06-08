import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import FilterBar from '../components/FilterBar';
import TaskCard from '../components/TaskCard';
import { fetchTasks, createTask, deleteTask, updateTask, updateTaskStatus } from '../utils/api';
import Toast from 'react-bootstrap/Toast';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function UserV2Page() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', file: null, startDate: '', startTime: '', endDate: '', endTime: '', status: 'active' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTask, setEditTask] = useState({ id: '', title: '', description: '', startDate: '', startTime: '', endDate: '', endTime: '', status: '' });
    const [toast, setToast] = useState({ show: false, message: '', variant: '' });
    const [formOpen, setFormOpen] = useState(false);
    // State for analytics dashboard modal and what to show
    const [analyticsOpen, setAnalyticsOpen] = useState(false);
    const [analyticsView, setAnalyticsView] = useState('chart'); // 'chart', 'recent', 'trends', 'deadlines'
    const [taskFilter, setTaskFilter] = useState('all'); // 'all', 'pending', 'completed', 'on-hold'

    // New state for search, sort, and pagination
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(8); // 8 tasks per page
    const [totalTasks, setTotalTasks] = useState(0);

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
        setTimeout(() => setToast({ show: false, message: '', variant: '' }), 3000);
    };

    const handleError = (error) => {
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        if (error.response?.status === 429) {
            showToast('Too many requests. Please try again later.', 'warning');
        } else {
            showToast(message, 'danger');
        }
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return 'Invalid Date';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/auth/login';
        } else {
            getTasks();
        }
        // eslint-disable-next-line
    }, [search, sortBy, sortOrder, page, taskFilter]);

    const getTasks = async (customPage = page) => {
        try {
            const filters = {
                title: search,
                sortBy,
                sortOrder,
                skip: (customPage - 1) * pageSize,
                take: pageSize,
                status: taskFilter,
            };
            const { data } = await fetchTasks(filters);
            const formattedTasks = Array.isArray(data.message)
                ? data.message.map(task => ({ ...task, startDate: task.startTask, endDate: task.endTask }))
                : [];
            setTasks(formattedTasks);
            setTotalTasks(data.total || 0);
        } catch (err) {
            handleError(err);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newTask.title);
        formData.append('description', newTask.description);
        const startDateTime = newTask.startDate && newTask.startTime ? new Date(`${newTask.startDate}T${newTask.startTime}`).toISOString() : new Date().toISOString();
        const endTask = new Date(`${newTask.endDate}T${newTask.endTime}`).toISOString();
        formData.append('startTask', startDateTime);
        if (endTask) formData.append('endTask', endTask);
        formData.append('status', newTask.status);
        if (newTask.file) formData.append('file', newTask.file);
        try {
            await createTask(formData);
            setNewTask({ title: '', description: '', file: null, startDate: '', startTime: '', endDate: '', endTime: '', status: 'active' });
            showToast('Task created successfully');
            setFormOpen(false);
            getTasks();
        } catch (err) {
            handleError(err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            getTasks();
            showToast('Task deleted successfully');
        } catch (err) {
            handleError(err);
        }
    };

    const handleEditTask = (task) => {
        const startDate = new Date(task.startDate).toISOString().split('T')[0];
        const startTime = new Date(task.startDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const endDate = new Date(task.endDate).toISOString().split('T')[0];
        const endTime = new Date(task.endDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        setEditTask({ ...task, startDate, startTime, endDate, endTime });
        setShowEditModal(true);
    };

    const handleUpdateTask = async () => {
        const { id, startDate, startTime, endDate, endTime, ...taskData } = editTask;
        const startTask = new Date(`${startDate}T${startTime}`).toISOString();
        const endTask = new Date(`${endDate}T${endTime}`).toISOString();
        const updatedTaskData = { ...taskData, startTask, endTask };
        try {
            await updateTask(id, updatedTaskData);
            setShowEditModal(false);
            getTasks();
            showToast('Task updated successfully');
        } catch (err) {
            handleError(err);
        }
    };

    const handleUpdateTaskStatus = async (taskId, status) => {
        try {
            await updateTaskStatus(taskId, { status });
            getTasks();
            showToast('Task status updated successfully');
        } catch (err) {
            handleError(err);
        }
    };

    // Analytics data for chart
    const statusCounts = tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});
    const chartData = {
        labels: ['Active', 'Completed', 'On Hold'],
        datasets: [
            {
                label: 'Tasks',
                data: [statusCounts['pending'] || 0, statusCounts['completed'] || 0, statusCounts['on-hold'] || 0],
                backgroundColor: ['#007bff', '#28a745', '#ffc107'],
            },
        ],
    };

    // Recent activity (last 5 actions, mock for now)
    const recentActivity = tasks.slice(-5).reverse().map(task => ({
        type: task.status === 'completed' ? 'Completed' : 'Updated',
        title: task.title,
        date: formatDateTime(task.endDate || task.updatedAt || task.createdAt),
    }));

    // Add or update the handlePageChange function if not present
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= Math.ceil(totalTasks / pageSize)) setPage(newPage);
    };

    // Render
    return (
        <div style={{ minHeight: '100vh', background: '#f7f7f7', overflow: 'hidden', position: 'relative' }}>
            <Navbar />
            <div style={{ marginTop: 120, paddingLeft: 32, paddingRight: 32, height: 'calc(100vh - 120px)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                {/* Search, Sort, and FilterBar Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search tasks by title..."
                        style={{ maxWidth: 260 }}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                    <select className="form-control" style={{ maxWidth: 160 }} value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
                        <option value="createdAt">Sort by Created</option>
                        <option value="startTask">Sort by Start Date</option>
                        <option value="endTask">Sort by End Date</option>
                        <option value="title">Sort by Title</option>
                    </select>
                    <div style={{ flex: 1 }} />
                    <FilterBar taskFilter={taskFilter} setTaskFilter={setTaskFilter} />
                </div>
                <div style={{ display: 'flex', height: '32%', minHeight: 180, gap: 32, flexShrink: 0 }}>
                    <TaskForm
                        formOpen={formOpen}
                        setFormOpen={setFormOpen}
                        newTask={newTask}
                        setNewTask={setNewTask}
                        handleCreateTask={handleCreateTask}
                    />
                    <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                        <h2 style={{ marginBottom: 16 }}>Analytics & Quick Actions</h2>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            <button className="btn btn-outline-primary btn-sm" onClick={() => { setAnalyticsOpen(true); setAnalyticsView('chart'); }}>See Chart for Task Status</button>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setAnalyticsOpen(true); setAnalyticsView('recent'); }}>Recent Activity</button>
                            <button className="btn btn-outline-warning btn-sm" onClick={() => { setAnalyticsOpen(true); setAnalyticsView('deadlines'); }}>Upcoming Deadlines</button>
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1, marginTop: 22, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, overflowY: 'auto', minHeight: 0, maxHeight: 'calc(68vh - 32px)' }}>
                    <h2>Your Tasks</h2>
                    {tasks.length === 0 ? (
                        <p>No tasks found.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            {tasks.map((task, idx) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    formatDateTime={formatDateTime}
                                    handleEditTask={handleEditTask}
                                    handleDeleteTask={handleDeleteTask}
                                    handleUpdateTaskStatus={handleUpdateTaskStatus}
                                />
                            ))}
                        </div>
                    )}
                    {/* Pagination Controls - always show if more than one page */}
                    {Math.ceil(totalTasks / pageSize) > 0 && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 24, justifyContent: 'center', fontWeight: 500 }}>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                            >
                                &laquo; Prev
                            </button>
                            <span style={{ minWidth: 80, textAlign: 'center' }}>
                                Page {page} of {Math.ceil(totalTasks / pageSize)}
                            </span>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === Math.ceil(totalTasks / pageSize) || totalTasks === 0}
                            >
                                Next &raquo;
                            </button>
                        </div>
                    )}
                </div>
                {/* Toast Notification */}
                <Toast onClose={() => setToast({ show: false, message: '', variant: '' })} show={toast.show} delay={3000} autohide className={`bg-${toast.variant} text-white position-fixed top-0 end-0 m-3`} style={{ zIndex: 2000 }}>
                    <Toast.Body>{toast.message}</Toast.Body>
                </Toast>
                {/* Edit Task Modal */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Task</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <div className="mb-3">
                                <label>Title</label>
                                <input type="text" className="form-control" value={editTask.title} onChange={e => setEditTask({ ...editTask, title: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label>Description</label>
                                <textarea className="form-control" value={editTask.description} onChange={e => setEditTask({ ...editTask, description: e.target.value })}></textarea>
                            </div>
                            <div className="mb-3">
                                <label>Start Date</label>
                                <input type="date" className="form-control" value={editTask.startDate} onChange={e => setEditTask({ ...editTask, startDate: e.target.value })} />
                                <label>Start Time</label>
                                <input type="time" className="form-control" value={editTask.startTime} onChange={e => setEditTask({ ...editTask, startTime: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label>End Date</label>
                                <input type="date" className="form-control" value={editTask.endDate} onChange={e => setEditTask({ ...editTask, endDate: e.target.value })} />
                                <label>End Time</label>
                                <input type="time" className="form-control" value={editTask.endTime} onChange={e => setEditTask({ ...editTask, endTime: e.target.value })} />
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleUpdateTask}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
                {/* Analytics Modal */}
                {analyticsOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.2)',
                        zIndex: 4000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                        onClick={() => setAnalyticsOpen(false)}
                    >
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 16,
                                minWidth: 400,
                                maxWidth: 600,
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
                                    top: 16,
                                    right: 16,
                                    background: 'none',
                                    border: 'none',
                                    fontSize: 22,
                                    cursor: 'pointer',
                                }}
                                onClick={() => setAnalyticsOpen(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                            <h2>Analytics & Insights</h2>
                            <div style={{ margin: '24px 0' }}>
                                {analyticsView === 'chart' && (
                                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, precision: 0 } } }} height={120} />
                                )}
                                {analyticsView === 'recent' && (
                                    <div>
                                        <h5>Recent Activity</h5>
                                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                                            {recentActivity.length === 0 ? <li>No recent activity</li> : recentActivity.map((a, i) => (
                                                <li key={i}>{a.type} <b>{a.title}</b> on {a.date}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {analyticsView === 'deadlines' && (
                                    <div>
                                        <h5>Upcoming Deadlines</h5>
                                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                                            {tasks.filter(t => t.status !== 'completed').slice(0, 3).map((t, i) => (
                                                <li key={i}><b>{t.title}</b> due by {formatDateTime(t.endDate)}</li>
                                            ))}
                                            {tasks.filter(t => t.status !== 'completed').length === 0 && <li>No upcoming deadlines</li>}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                <button className="btn btn-outline-primary btn-sm" onClick={() => setAnalyticsView('chart')}>Chart</button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setAnalyticsView('recent')}>Recent Activity</button>
                                <button className="btn btn-outline-warning btn-sm" onClick={() => setAnalyticsView('deadlines')}>Deadlines</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}