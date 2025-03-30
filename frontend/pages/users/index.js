import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { fetchTasks, createTask, deleteTask, updateTask } from '../../utils/api'; // Task-related functions
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { withAuth } from '../../utils/authMiddleware'; // Import the middleware
import { redirect } from 'next/dist/server/api-utils';
import Modal from 'react-bootstrap/Modal'; // Import Bootstrap Modal
import Button from 'react-bootstrap/Button'; // Import Bootstrap Button

const Tasks = () => {
    const [tasks, setTasks] = useState([]);  // Store the tasks
    const [newTask, setNewTask] = useState({ title: '', description: '', file: null, startDate: '', endDate: '', status: 'active' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTask, setEditTask] = useState({
        id: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: '',
    });
    const router = useRouter();

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
            setTasks(Array.isArray(data.message) ? data.message : []); // Ensure it's an array
        } catch (err) {
            console.error('Error fetching tasks:', err); // Handle any error
        }
    };

    // Function to handle creating a new task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newTask.title);
        formData.append('description', newTask.description);
        formData.append('startDate', newTask.startDate);
        formData.append('endDate', newTask.endDate);
        formData.append('status', newTask.status);
        if (newTask.file) formData.append('file', newTask.file);

        try {
            await createTask(formData); // Call the API to create the task
            setNewTask({ title: '', description: '', file: null, startDate: '', endDate: '', status: 'active' }); // Reset the form
            getTasks(); // Re-fetch the tasks
        } catch (err) {
            console.error('Error creating task:', err); // Handle error
        }
    };

    // Function to delete a task
    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId); // Call API to delete task by ID
            getTasks(); // Re-fetch tasks after deletion
        } catch (err) {
            router.push('/auth/login'); // Redirect to login if unauthorized
        }
    };

    // Function to navigate to the task edit page
    const handleEditTask = (task) => {
        setEditTask(task); // Populate the modal with task data
        setShowEditModal(true); // Show the modal
    };

    const handleUpdateTask = async () => {
        const { id, ...taskData } = editTask; // Extract task ID and data
        try {
            await updateTask(id, taskData); // Ensure taskId is passed in the API call
            setShowEditModal(false); // Close the modal
            getTasks(); // Refresh the task list
        } catch (err) {
            console.error('Error updating task:', err); // Handle error
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container my-5">
                <h1 className="text-center mb-4">Your Tasks</h1>

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
                                value={newTask.startDate || new Date().toISOString().split('T')[0]} // Default to today
                                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
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
                        </div>
                        <div className="mb-3">
                            <label>Status</label>
                            <select
                                className="form-control"
                                value={newTask.status}
                                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="on-hold">On Hold</option>
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
                                    <p><strong>Start Date:</strong> {task.startDate}</p>
                                    <p><strong>End Date:</strong> {task.endDate}</p>
                                    <p><strong>Status:</strong> {task.status}</p>
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
                            </div>
                            <div className="mb-3">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={editTask.endDate}
                                    onChange={(e) => setEditTask({ ...editTask, endDate: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label>Status</label>
                                <select
                                    className="form-control"
                                    value={editTask.status}
                                    onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="on-hold">On Hold</option>
                                </select>
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
