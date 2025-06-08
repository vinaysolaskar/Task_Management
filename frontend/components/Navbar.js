// components/Navbar.js

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap'; // Import Bootstrap Modal for the popup
import Toast from 'react-bootstrap/Toast'; // Import Bootstrap Toast
import { deleteUser, deleteMultipleUsers } from '../utils/api'; // Import the API functions
import { FaPowerOff, FaUserCog, FaUsers, FaTrashAlt, FaUserMinus, FaUserFriends } from 'react-icons/fa';
import Dropdown from 'react-bootstrap/Dropdown';

const Navbar = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: '' }); // Toast state
  const [showModal, setShowModal] = useState(false);
  const [userIds, setUserIds] = useState(""); // Store the user IDs to be deleted
  const [singleUserId, setSingleUserId] = useState(""); // Store the single user ID to be deleted
  const [deleteMode, setDeleteMode] = useState(null); // 'single' | 'multiple' | null

  useEffect(() => {
    setIsClient(true); // Ensure client-only logic runs after hydration
  }, []);

  const token = isClient ? localStorage.getItem('token') : null;
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const isAdmin = user && user.role === 'admin'; // Check if the user is an admin

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: '', variant: '' }), 3000); // Auto-hide after 3 seconds
  };

  const handleLogout = () => {
    if (isClient) {
      localStorage.removeItem('token');
      router.push('/'); // Redirect to homepage after logout
    }
  };

  // Function to handle deleting a single user
  const handleDeleteSingleUser = async () => {
    try {
      if (!singleUserId) {
        showToast('Please enter a valid user ID', 'warning');
        return;
      }

      const data = await deleteUser(singleUserId, token);
      showToast(data.message, 'success'); // Display success message
    } catch (error) {
      console.error('Error deleting single user:', error);
      const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
      showToast(message, 'danger');
    }
  };

  // Function to handle deleting multiple users
  const handleDeleteMultipleUsers = async () => {
    const ids = userIds.split(',').map(id => id.trim()); // Convert comma-separated IDs to an array of strings
    try {
      const data = await deleteMultipleUsers(ids, token);
      showToast(data.message, 'success'); // Display success message
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error('Error deleting multiple users:', error);
      const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
      showToast(message, 'danger');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand">Task Management</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!token ? (
              <>
                <li className="nav-item">
                  <Link href="/auth/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link href="/auth/register" className="nav-link">Register</Link>
                </li>
              </>
            ) : (
              <>
                {/* Users Dropdown using React-Bootstrap */}
                <Dropdown align="end" as="li" className="nav-item">
                  <Dropdown.Toggle as="a" className="nav-link text-light d-flex align-items-center p-0 mt-2" id="usersDropdown" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                    <FaUsers className="me-1" /> Users
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} href="/users">
                      <FaUsers className="me-2" />View Users
                    </Dropdown.Item>
                    {isAdmin && (
                      <>
                        <Dropdown.Item onClick={() => { setShowModal(true); setDeleteMode('single'); }}>
                          <FaUserMinus className="me-2" />Delete Single User
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => { setShowModal(true); setDeleteMode('multiple'); }}>
                          <FaUserFriends className="me-2" />Delete Multiple Users
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link btn btn-link text-light d-flex align-items-center">
                    <FaPowerOff className="me-1" style={{ fontSize: 18 }} /> Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        onClose={() => setToast({ show: false, message: '', variant: '' })}
        show={toast.show}
        delay={3000}
        autohide
        className={`bg-${toast.variant} text-white position-fixed top-0 end-0 m-3`}
        style={{ zIndex: 2000 }} // Use a reasonable z-index
      >
        {toast.show && console.log('Toast visible:', toast.message)}
        <Toast.Body>{toast.message}</Toast.Body>
      </Toast>

      {/* Modal for deleting users (single or multiple) */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setDeleteMode(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>{deleteMode === 'single' ? 'Delete Single User' : 'Delete Multiple Users'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteMode === 'single' ? (
            <div>
              <label>Enter User ID to Delete:</label>
              <input
                type="text"
                className="form-control mt-2"
                value={singleUserId}
                onChange={(e) => setSingleUserId(e.target.value)}
                placeholder="e.g. 123"
              />
            </div>
          ) : deleteMode === 'multiple' ? (
            <div>
              <label>Enter User IDs to Delete (comma separated):</label>
              <input
                type="text"
                className="form-control mt-2"
                value={userIds}
                onChange={(e) => setUserIds(e.target.value)}
                placeholder="e.g. 1,2,3"
              />
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => { setShowModal(false); setDeleteMode(null); }}>Cancel</button>
          {deleteMode === 'single' ? (
            <button className="btn btn-danger" onClick={handleDeleteSingleUser}>
              <FaTrashAlt className="me-2" />Delete User
            </button>
          ) : deleteMode === 'multiple' ? (
            <button className="btn btn-danger" onClick={handleDeleteMultipleUsers}>
              <FaTrashAlt className="me-2" />Delete Users
            </button>
          ) : null}
        </Modal.Footer>
      </Modal>
    </nav>
  );
};

export default Navbar;
// components/Navbar.js