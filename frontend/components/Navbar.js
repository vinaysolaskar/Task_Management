// components/Navbar.js

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap'; // Import Bootstrap Modal for the popup
import { deleteUser, deleteMultipleUsers } from '../utils/api'; // Import the API functions

const Navbar = () => {
  const router = useRouter();
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure client-only logic runs after hydration
  }, []);

  const token = isClient ? localStorage.getItem('token') : null;
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const isAdmin = user && user.role === 'admin'; // Check if the user is an admin

  const [showModal, setShowModal] = useState(false);
  const [userIds, setUserIds] = useState(""); // Store the user IDs to be deleted
  const [singleUserId, setSingleUserId] = useState(""); // Store the single user ID to be deleted

  const handleLogout = () => {
    if (isClient) {
      localStorage.removeItem('token');
      router.push('/');  // Redirect to homepage after logout
    }
  };

  // Function to handle deleting a single user
  const handleDeleteSingleUser = async () => {
    try {
      if (!singleUserId) {
        alert('Please enter a valid user ID');
        return;
      }
      
      const data = await deleteUser(singleUserId, token);
      alert(data.message); // Display success message
    } catch (error) {
      console.error('Error deleting single user:', error);
      alert(error.message);
    }
  };

  // Function to handle deleting multiple users
  const handleDeleteMultipleUsers = async () => {
    const ids = userIds.split(',').map(id => id.trim()); // Convert comma-separated IDs to an array of strings
    try {
      const data = await deleteMultipleUsers(ids, token);
      alert(data.message); // Display success message
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error('Error deleting multiple users:', error);
      alert('Error deleting users');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
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
                <li className="nav-item">
                  <Link href="/users" className="nav-link">Users</Link>
                </li>
                {isAdmin && (
                  <>
                    <li className="nav-item">
                      <button onClick={() => setShowModal(true)} className="nav-link btn btn-link text-light">
                        Delete Users
                      </button>
                    </li>
                    {/* Add option to delete a single user */}
                    <li className="nav-item">
                      <input
                        type="text"
                        placeholder="User ID"
                        value={singleUserId}
                        onChange={(e) => setSingleUserId(e.target.value)}
                        className="form-control"
                      />
                      <button onClick={handleDeleteSingleUser} className="btn btn-danger mt-2">
                        Delete Single User
                      </button>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link btn btn-link text-light">
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Modal for deleting multiple users */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Users</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>Enter User IDs to Delete (comma separated):</label>
            <input
              type="text"
              className="form-control"
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder="e.g. 1,2,3"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDeleteMultipleUsers}>Delete</button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
};

export default Navbar;
// components/Navbar.js