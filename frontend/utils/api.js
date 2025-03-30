import axios from 'axios';
import { checkTokenValidity } from './authMiddleware';

const authApi = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
});

const taskApi = axios.create({
  baseURL: 'http://localhost:5000/api/task',
});

// Register user
export const registerUser = async (data) => {
  try {
    // Ensure that the content type is application/json and send the correct data structure
    const response = await authApi.post('/register', data, {
      headers: {
        'Content-Type': 'application/json', // Make sure this is set to 'application/json'
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Login user
export const loginUser = async (data) => {
  try {
    const response = await authApi.post('/login', data, {
      headers: {
        'Content-Type': 'application/json', // Make sure this is set to 'application/json'
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete user by ID
export const deleteUser = async (id, token) => {
  if (!checkTokenValidity()) {
    window.location.href = '/auth/login'; // Redirect to login if token is invalid
    return;
  }
  try {
    const response = await authApi.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Bulk delete users
export const deleteMultipleUsers = async (ids, token) => {
  if (!checkTokenValidity()) {
    window.location.href = '/auth/login'; // Redirect to login if token is invalid
    return;
  }
  try {
    const response = await authApi.delete('/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: ids, // Sending data in the request body
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  return { Authorization: `Bearer ${token}` };
};

export const fetchTasks = async () => {
  if (!checkTokenValidity()) {
    window.location.href = '/auth/login'; // Redirect to login if token is invalid
    return;
  }
  try {
    return await taskApi.get('/getTasks', {
      headers: getAuthHeader(),
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Unauthorized: Please log in again.');
      localStorage.removeItem('token');
      window.location.href = '/auth/login'; // Redirect to login
    }
    throw error;
  }
};

// export const createTask = (taskData) => {
//   return taskApi.post('/create', taskData, {
//     headers: {
//       ...getAuthHeader(),
//       'Content-Type': 'multipart/form-data',
//     },
//   });
// };

export const createTask = async (taskData) => {
  if (!checkTokenValidity()) {
    window.location.href = '/auth/login'; // Redirect to login if token is invalid
    return;
  }
  try {
    return await taskApi.post('/create', taskData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Unauthorized: Please log in again.');
      localStorage.removeItem('token'); // Clear the expired token
      window.location.href = '/auth/login'; // Redirect to login page
    }
    throw error; // Re-throw the error for further handling
  }
};

export const updateTask = async (taskId, taskData) => {
  if (!checkTokenValidity()) {
    window.location.href = '/auth/login'; // Redirect to login if token is invalid
    return;
  }
  try {
    return await taskApi.put(`/updateTask/${taskId}`, taskData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json', // Changed to JSON for consistency
      },
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Unauthorized: Please log in again.');
      localStorage.removeItem('token'); // Clear the expired token
      window.location.href = '/auth/login'; // Redirect to login page
    }
    throw error; // Re-throw the error for further handling
  }
};

export const deleteTask = async (taskId) => {
  if (!checkTokenValidity()) {
    window.location.href = '/auth/login'; // Redirect to login if token is invalid
    return;
  }
  try {
    return await taskApi.delete(`/deleteTask/${taskId}`, {
      headers: getAuthHeader(),
    });
  }
  catch {
    if (error.response?.status === 401) {
      console.error('Unauthorized: Please log in again.');
      localStorage.removeItem('token'); // Clear the expired token
      window.location.href = '/auth/login'; // Redirect to login page
    }
    // throw error; // Re-throw the error for further handling
  }
};

export const updateTaskStatus = async (taskId, statusData) => {
  if (!checkTokenValidity()) {
    window.location.href = '/auth/login'; // Redirect to login if token is invalid
    return;
  }
  try {
    return await taskApi.put(`/updateTaskStatus/${taskId}`, statusData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Unauthorized: Please log in again.');
      localStorage.removeItem('token'); // Clear the expired token
      window.location.href = '/auth/login'; // Redirect to login page
    }
    throw error; // Re-throw the error for further handling
  }
};