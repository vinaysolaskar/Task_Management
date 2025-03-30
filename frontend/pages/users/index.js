import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { fetchTasks, createTask, deleteTask, updateTask, updateTaskStatus } from '../../utils/api'; // Task-related functions
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { withAuth } from '../../utils/authMiddleware'; // Import the middleware
import { redirect } from 'next/dist/server/api-utils';
import Modal from 'react-bootstrap/Modal'; // Import Bootstrap Modal
import Button from 'react-bootstrap/Button'; // Import Bootstrap Button
import Toast from 'react-bootstrap/Toast'; // Import Bootstrap Toast

const Tasks = () => {
    const [tasks, setTasks] = useState([]);  // Store the tasks
    const [newTask, setNewTask] = useState({ title: '', description: '', file: null, startDate: '', startTime: '', endDate: '', endTime: '', status: 'active' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTask, setEditTask] = useState({
        id: '',
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        status: '',
    });
    const [editingStatusId, setEditingStatusId] = useState(null); // Track which task's status is being edited
    const [toast, setToast] = useState({ show: false, message: '', variant: '' }); // Toast state
    const router = useRouter();

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
        setTimeout(() => setToast({ show: false, message: '', variant: '' }), 3000); // Auto-hide after 3 seconds
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
        if (!isoString) {
            return 'Invalid Date'; // Handle missing or invalid date
        }
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date'; // Handle invalid date format
        }
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    useEffect(() => {
        // Check if token is in localStorage; if not, redirect to homepage
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
        } else {
            getTasks();
        }
    }, [router]);

    // Function to fetch tasks from the backend
    const getTasks = async () => {
        try {
            const { data } = await fetchTasks();
            // Ensure startTask and endTask are mapped correctly
            const formattedTasks = Array.isArray(data.message)
                ? data.message.map(task => ({
                    ...task,
                    startDate: task.startTask, // Map startTask to startDate
                    endDate: task.endTask,     // Map endTask to endDate
                }))
                : [];
            setTasks(formattedTasks);
        } catch (err) {
            handleError(err);
        }
    };

    // Function to handle creating a new task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newTask.title);
        formData.append('description', newTask.description);

        // Handle null or empty startDate and startTime
        const startDateTime = newTask.startDate && newTask.startTime
            ? new Date(`${newTask.startDate}T${newTask.startTime}`).toISOString()
            : new Date().toISOString(); // Default to current date and time

        const endTask = new Date(`${newTask.endDate}T${newTask.endTime}`).toISOString()

        formData.append('startTask', startDateTime); // Use startTask as per backend
        if (endTask) formData.append('endTask', endTask); // Append endTask only if valid
        formData.append('status', newTask.status);
        if (newTask.file) formData.append('file', newTask.file);

        try {
            await createTask(formData); // Call the API to create the task
            setNewTask({ title: '', description: '', file: null, startDate: '', startTime: '', endDate: '', endTime: '', status: 'active' }); // Reset the form
            getTasks(); // Re-fetch the tasks
            showToast('Task created successfully');
        } catch (err) {
            handleError(err);
        }
    };

    // Function to delete a task
    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId); // Call API to delete task by ID
            getTasks(); // Re-fetch tasks after deletion
            showToast('Task deleted successfully');
        } catch (err) {
            handleError(err);
        }
    };

    // Function to navigate to the task edit page
    const handleEditTask = (task) => {
        // Convert UTC to local time for startTask and endTask
        const startDate = new Date(task.startDate).toISOString().split('T')[0]; // Extract date
        const startTime = new Date(task.startDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // Extract time in local format
        const endDate = new Date(task.endDate).toISOString().split('T')[0]; // Extract date
        const endTime = new Date(task.endDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // Extract time in local format

        setEditTask({
            ...task,
            startDate, // Set local date
            startTime, // Set local time
            endDate,   // Set local date
            endTime,   // Set local time
        });
        setShowEditModal(true); // Show the modal
    };

    const handleUpdateTask = async () => {
        const { id, startDate, startTime, endDate, endTime, ...taskData } = editTask; // Extract fields

        // Combine date and time into ISO format
        const startTask = new Date(`${startDate}T${startTime}`).toISOString();
        const endTask = new Date(`${endDate}T${endTime}`).toISOString();

        // Add ISO-formatted fields to taskData
        const updatedTaskData = {
            ...taskData,
            startTask,
            endTask,
        };

        try {
            await updateTask(id, updatedTaskData); // Pass updated task data to the API
            setShowEditModal(false); // Close the modal
            getTasks(); // Refresh the task list
            showToast('Task updated successfully');
        } catch (err) {
            handleError(err);
        }
    };

    const handleUpdateTaskStatus = async (taskId, status) => {
        try {
            await updateTaskStatus(taskId, { status }); // Call the API to update task status
            getTasks(); // Refresh the task list
            showToast('Task status updated successfully');
        } catch (err) {
            handleError(err);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container my-5">
                <h1 className="text-center mb-4">Your Tasks</h1>

                {/* Toast Notification */}
                <Toast
                    onClose={() => setToast({ show: false, message: '', variant: '' })}
                    show={toast.show}
                    delay={3000}
                    autohide
                    className={`bg-${toast.variant} text-white position-fixed top-0 end-0 m-3`}
                >
                    <Toast.Body>{toast.message}</Toast.Body>
                </Toast>

                {/* Task Creation Form */}
                <div className="mb-5">
                    <h3>Create New Task</h3>
                    <form onSubmit={handleCreateTask}>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                placeholder="Task Title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <textarea
                                className="form-control"
                                id="description"
                                placeholder="Task Description"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <input
                                type="file"
                                className="form-control"
                                id="file"
                                onChange={(e) => setNewTask({ ...newTask, file: e.target.files[0] })}
                            />
                        </div>
                        <div className="mb-3">
                            <label>Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={newTask.startDate}
                                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                            />
                            <label>Start Time</label>
                            <input
                                type="time"
                                className="form-control"
                                value={newTask.startTime}
                                onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label>End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={newTask.endDate}
                                onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                            />
                            <label>End Time</label>
                            <input
                                type="time"
                                className="form-control"
                                value={newTask.endTime}
                                onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label>Status</label>
                            <select
                                className="form-control"
                                value="active" // Default to "Active" for task creation
                                disabled // Disable the dropdown for task creation
                            >
                                <option value="active">Active</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Create Task</button>
                    </form>
                </div>

                {/* Task List */}
                <div>
                    {tasks.length === 0 ? (
                        <p>No tasks found.</p> // If no tasks are found, show a message
                    ) : (
                        tasks.map((task) => (
                            <div className="card my-2 shadow-sm" key={task.id}>
                                <div className="card-body">
                                    <h5 className="card-title">{task.title}</h5>
                                    <p className="card-text">{task.description}</p>
                                    <p><strong>Start:</strong> {formatDateTime(task.startDate)}</p>
                                    <p><strong>End:</strong> {formatDateTime(task.endDate)}</p>
                                    <p>
                                        <strong>Status: </strong>
                                        <select
                                            className="form-control d-inline w-auto ml-2"
                                            value={task.status}
                                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                        >
                                            <option value="pending">Active</option>
                                            <option value="completed">Completed</option>
                                            <option value="on-hold">On Hold</option>
                                        </select>
                                    </p>
                                    <button className="btn btn-info" onClick={() => handleEditTask(task)}>Edit</button>
                                    <button className="btn btn-danger ml-2" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Edit Task Modal */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Task</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <div className="mb-3">
                                <label>Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editTask.title}
                                    onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    value={editTask.description}
                                    onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={editTask.startDate}
                                    onChange={(e) => setEditTask({ ...editTask, startDate: e.target.value })}
                                />
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={editTask.startTime}
                                    onChange={(e) => setEditTask({ ...editTask, startTime: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={editTask.endDate}
                                    onChange={(e) => setEditTask({ ...editTask, endDate: e.target.value })}
                                />
                                <label>End Time</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={editTask.endTime}
                                    onChange={(e) => setEditTask({ ...editTask, endTime: e.target.value })}
                                />
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
            </div>
        </div>
    );
};

export default withAuth(Tasks); // Wrap the component with the middleware
