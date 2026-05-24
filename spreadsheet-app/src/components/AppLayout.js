import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { mockAuthAPI } from '../services/mockAuthService';
import { showNotification } from '../store/slices/uiSlice';
import { clearCurrentDoc } from '../store/slices/documentsSlice';
import './AppLayout.css';

function AppLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await mockAuthAPI.logout();
    dispatch(clearCurrentDoc());
    dispatch(showNotification({ message: 'Вы вышли из системы', type: 'success' }));
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          Spreadsheet App
        </div>
        <div className="user-info">
          <button onClick={handleLogout} className="logout-btn">
            Выйти
          </button>
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