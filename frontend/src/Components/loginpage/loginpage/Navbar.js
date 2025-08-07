import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ userRole = 'employee' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navLinks = userRole === 'admin'
    ? [
        { label: 'Dashboard', path: '/admin-dashboard' },
        // Add more admin links here
      ]
    : [
        { label: 'Dashboard', path: '/employee-dashboard' },
        { label: 'Leave Management', path: '/employee-dashboard/leave' },
        { label: 'Attendance History', path: '/employee-dashboard/attendance' },
        { label: 'Profile', path: '/employee-dashboard/profile' },
      ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">ISAR EMS - {userRole === 'admin' ? 'Admin' : 'Employee'}</div>
      <ul className="navbar-links">
        {navLinks.map(link => (
          <li key={link.label}>
            <Link to={link.path} className="nav-link">{link.label}</Link>
          </li>
        ))}
        <li>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
