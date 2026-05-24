import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './AppLayout.css';

function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          Spreadsheet App
        </div>
        <div className="user-info">
          <span>Mock User</span>
        </div>
      </header>
      
      <div className="app-body">
        <aside className="sidebar">
          <nav>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Мои документы
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Профиль
            </NavLink>
          </nav>
        </aside>
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;