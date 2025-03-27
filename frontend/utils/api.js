import axios from 'axios';

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
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  export const fetchTasks = () => {
    return taskApi.get('/getTasks', {
      headers: getAuthHeader(),
    });
  };
  
  export const createTask = (taskData) => {
    return taskApi.post('/create', taskData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
  };
  
  export const updateTask = (taskId, taskData) => {
    return taskApi.put(`/updateTask/${taskId}`, taskData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
  };
  
  export const deleteTask = (taskId) => {
    return taskApi.delete(`/deleteTask/${taskId}`, {
      headers: getAuthHeader(),
    });
  };