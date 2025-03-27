// components/Navbar.js

import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();

  // Check if the user is logged in by checking localStorage for the token
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');  // Redirect to homepage after logout
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
            {!isLoggedIn ? (
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
    </nav>
  );
};

export default Navbar;
