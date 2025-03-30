// pages/auth/register.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { registerUser } from '../../utils/api'; // Assuming you have this function

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      if(email && password) {
        const response = await registerUser({ email, password, role });

         if (response.token) {
            // Store token and redirect to the users page
            localStorage.setItem('token', response.token);
          router.push('/users');
        }
      } 
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Register</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-3">
            <input
              type="email"
              placeholder="Email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              placeholder="Password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label>
              <input
                type="radio"
                value="user"
                checked={role === 'user'}
                onChange={() => setRole('user')}
              />
              User
            </label>
            <label className="ml-3">
              <input
                type="radio"
                value="admin"
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
              />
              Admin
            </label>
          </div>

          <button onClick={handleRegister} className="btn btn-primary w-100 py-2">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
