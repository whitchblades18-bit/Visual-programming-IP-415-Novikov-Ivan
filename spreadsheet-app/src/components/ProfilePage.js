import React from 'react';
import { useSelector } from 'react-redux';
import './ProfilePage.css';

function ProfilePage() {
  const { list: documents } = useSelector((state) => state.documents);
  
  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar"></div>
          <h2>Профиль пользователя</h2>
          <span className="mock-badge">Mock-Auth Mode</span>
        </div>
        
        <div className="profile-info">
          <div className="info-row">
            <span className="label">Имя пользователя:</span>
            <span className="value">Mock User</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">mock.user@example.com</span>
          </div>
          <div className="info-row">
            <span className="label">Документов создано:</span>
            <span className="value">{documents.length}</span>
          </div>
          <div className="info-row">
            <span className="label">Роль:</span>
            <span className="value">Пользователь</span>
          </div>
        </div>
        
        <div className="profile-note">
          Это страница-заглушка. Полноценная авторизация будет добавлена на следующем этапе.
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;