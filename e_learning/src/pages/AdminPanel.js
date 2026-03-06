import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { FaBars, FaUser, FaHome, FaCog, FaSignOutAlt, FaComment } from 'react-icons/fa';
import '../assets/AdminPanel.css';

const AdminPanel = () => {
  const [isExpanded, setIsExpanded] = useState(true); // Sidebar starts expanded
  const navigate = useNavigate();

  const toggleSidebar = () => setIsExpanded((prevState) => !prevState);

  const handleLogout = () => {
    // Clear session or authentication data (example: localStorage/sessionStorage)
    localStorage.removeItem('authToken');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`admin-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
          {isExpanded && <span className="sidebar-brand">Admin Panel</span>}
        </div>
        <nav className="sidebar-menu">
          <ul>
            <li onClick={() => navigate('/admin')}>
              <FaHome className="sidebar-icon" />
              {isExpanded && <span className="menu-label">Home</span>}
            </li>
            <li onClick={() => navigate('/Admin/UserManagement')}>
              <FaUser className="sidebar-icon" />
              {isExpanded && <span className="menu-label">User Management</span>}
            </li>
            <li onClick={() => navigate('/Admin/CommentMgnPage')}>
              <FaComment className="sidebar-icon" />
              {isExpanded && <span className="menu-label">Comment Management</span>}
            </li>
            <li>
              <FaCog className="sidebar-icon" />
              {isExpanded && <span className="menu-label">Settings</span>}
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" />
          {isExpanded && <span className="menu-label">Logout</span>}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <Outlet /> {/* Loads the selected component */}
      </div>
    </div>
  );
};

export default AdminPanel;
