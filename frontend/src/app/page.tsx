// src/app/page.tsx

import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  return (
    <div className="container py-5">
      {/* Header Section */}
      <header className="text-center my-5">
        <h1 className="display-3 fw-bold text-primary">Welcome to Task Management</h1>
        <p className="lead text-muted">
          A modern, intuitive platform to manage your tasks, collaborate with your team, and achieve more.
        </p>
      </header>

      {/* Features Section - Grid Layout */}
      <section className="row text-center mb-5">
        <div className="col-md-4">
          <div className="card bg-secondary text-light shadow-lg">
            <div className="card-body">
              <h5 className="card-title">Task Creation</h5>
              <p className="card-text">
                Easily create tasks with descriptions, deadlines, and priorities for better organization.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-secondary text-light shadow-lg">
            <div className="card-body">
              <h5 className="card-title">Task Tracking</h5>
              <p className="card-text">
                Track progress, deadlines, and changes with an intuitive interface.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-secondary text-light shadow-lg">
            <div className="card-body">
              <h5 className="card-title">Collaboration</h5>
              <p className="card-text">
                Assign tasks to your team members and collaborate in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center mb-5">
        <h2 className="fw-bold text-primary mb-3">Get Started Now</h2>
        <p className="lead text-muted mb-4">
          Sign up or log in to start managing your tasks effectively.
        </p>
        <Link href="/auth/register" className="btn btn-primary mx-2 py-3 px-5">
          Register
        </Link>
        <Link href="/auth/login" className="btn btn-secondary mx-2 py-3 px-5">
          Login
        </Link>
      </section>

      {/* Footer Section */}
      <footer className="text-center text-muted mt-5">
        <p>© 2025 Task Management. All rights reserved.</p>
      </footer>
    </div>
  );
}
