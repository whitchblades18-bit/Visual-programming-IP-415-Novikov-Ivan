import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { mockAuthAPI } from '../services/mockAuthService';
import { showNotification } from '../store/slices/uiSlice';
import './ProfilePage.css';

function ProfilePage() {
  const dispatch = useDispatch();
  const { list: documents } = useSelector((state) => state.documents);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const result = await mockAuthAPI.getCurrentUser();
      if (result && result.user) {
        setUser(result.user);
        setNewName(result.user.name);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setErrors({ name: 'Имя не может быть пустым' });
      return;
    }
    
    try {
      const updated = await mockAuthAPI.updateProfile({ name: newName });
      setUser(updated);
      setEditingName(false);
      setErrors({});
      dispatch(showNotification({ message: 'Имя обновлено', type: 'success' }));
    } catch (error) {
      setErrors({ name: error.message });
    }
  };

  const handleChangePassword = async () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Введите текущий пароль';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Пароль должен быть минимум 8 символов';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await mockAuthAPI.changePassword(passwordData);
      setChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      dispatch(showNotification({ message: 'Пароль изменён', type: 'success' }));
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  const getRegistrationDate = () => {
    if (user && user.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('ru-RU');
    }
    if (documents.length > 0) {
      const oldestDoc = documents.reduce((oldest, doc) => {
        return new Date(doc.createdAt) < new Date(oldest.createdAt) ? doc : oldest;
      }, documents[0]);
      return new Date(oldestDoc.createdAt).toLocaleDateString('ru-RU');
    }
    return '—';
  };

  if (loading) {
    return <div className="loading-profile">Загрузка профиля...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar"></div>
          <h2>Профиль пользователя</h2>
        </div>
        
        <div className="profile-info">
          <div className="info-section">
            <h3>Личная информация</h3>
            
            <div className="info-row">
              <span className="label">Имя:</span>
              <div className="value-with-edit">
                {editingName ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleUpdateName} className="save-btn">✓</button>
                    <button onClick={() => setEditingName(false)} className="cancel-btn">✗</button>
                  </div>
                ) : (
                  <>
                    <span className="value">{user?.name}</span>
                    <button onClick={() => setEditingName(true)} className="edit-btn">
                      Редактировать
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{user?.email}</span>
            </div>
            
            <div className="info-row">
              <span className="label">Дата регистрации:</span>
              <span className="value">{getRegistrationDate()}</span>
            </div>
          </div>
          
          <div className="info-section">
            <h3>Статистика</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{documents.length}</div>
                <div className="stat-label">Документов</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {documents.reduce((total, doc) => total + Object.keys(doc.data || {}).length, 0)}
                </div>
                <div className="stat-label">Заполненных ячеек</div>
              </div>
            </div>
          </div>
          
          <div className="info-section">
            <h3>Безопасность</h3>
            {!changingPassword ? (
              <button onClick={() => setChangingPassword(true)} className="change-password-btn">
                Сменить пароль
              </button>
            ) : (
              <div className="password-form">
                <div className="form-group">
                  <label>Текущий пароль</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className={errors.currentPassword ? 'error' : ''}
                  />
                  {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
                </div>
                
                <div className="form-group">
                  <label>Новый пароль (мин. 8 символов)</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={errors.newPassword ? 'error' : ''}
                  />
                  {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                </div>
                
                <div className="form-group">
                  <label>Подтверждение пароля</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
                
                {errors.general && <div className="error-general">{errors.general}</div>}
                
                <div className="password-actions">
                  <button onClick={handleChangePassword} className="save-btn">Сохранить</button>
                  <button onClick={() => {
                    setChangingPassword(false);
                    setErrors({});
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }} className="cancel-btn">Отмена</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;