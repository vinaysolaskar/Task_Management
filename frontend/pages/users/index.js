import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { fetchTasks, createTask, deleteTask, updateTask } from '../../utils/api';
import { useRouter } from 'next/router';

const Users = () => {
  const [tasks, setTasks] = useState([]);  // Ensure tasks is always an array
  const [newTask, setNewTask] = useState({ title: '', description: '', file: null, startDate: '', endDate: '', status: 'active' });
  const [selectedTasks, setSelectedTasks] = useState([]); // Track selected tasks for deletion
  const router = useRouter();

  const getTasks = async () => {
    try {
      const { data } = await fetchTasks();
      setTasks(Array.isArray(data.message) ? data.message : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

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
      await createTask(formData);
      setNewTask({ title: '', description: '', file: null, startDate: '', endDate: '', status: 'active' });
      getTasks();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      getTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const taskId of selectedTasks) {
        await deleteTask(taskId);
      }
      setSelectedTasks([]);
      getTasks();
    } catch (err) {
      console.error('Error deleting tasks:', err);
    }
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks((prevSelected) =>
      prevSelected.includes(taskId)
        ? prevSelected.filter((id) => id !== taskId)
        : [...prevSelected, taskId]
    );
  };

  const handleEditTask = (taskId) => {
    router.push(`/tasks/edit/${taskId}`);  // Navigate to task edit page
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
            <p>No tasks found.</p>
          ) : (
            tasks.map((task) => (
              <div className="card my-2 shadow-sm" key={task.id}>
                <div className="card-body">
                  <h5 className="card-title">{task.title}</h5>
                  <p className="card-text">{task.description}</p>
                  <p><strong>Start Date:</strong> {task.startDate}</p>
                  <p><strong>End Date:</strong> {task.endDate}</p>
                  <p><strong>Status:</strong> {task.status}</p>
                  <button className="btn btn-info" onClick={() => handleEditTask(task.id)}>Edit</button>
                  <button className="btn btn-danger ml-2" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
