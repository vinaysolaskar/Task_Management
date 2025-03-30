// pages/auth/login.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { loginUser } from '../../utils/api';
import Toast from 'react-bootstrap/Toast'; // Import Bootstrap Toast

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', variant: '' }); // Toast state
  const router = useRouter();

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: '', variant: '' }), 3000); // Auto-hide after 3 seconds
  };

  const handleLogin = async () => {
    try {
      const response = await loginUser({ email, password });
      localStorage.setItem('token', response.token);
      router.push('/users');
      showToast('Login successful');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'An unexpected error occurred';
      if (err.response?.status === 429) {
        showToast('Too many requests. Please try again later.', 'warning');
      } else {
        showToast(message, 'danger');
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Login</h2>
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
          <button onClick={handleLogin} className="btn btn-primary w-100 py-2">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
