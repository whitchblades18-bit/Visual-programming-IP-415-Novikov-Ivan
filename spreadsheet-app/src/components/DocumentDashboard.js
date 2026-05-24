import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createDocument, deleteDocument, renameDocument, duplicateDocument, setCurrentDoc } from '../store/slices/documentsSlice';
import { setShowCreateModal, showNotification, resetNewDoc } from '../store/slices/uiSlice';
import Breadcrumbs from './Breadcrumbs';

function DocumentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: documents } = useSelector((state) => state.documents);
  const { showCreateModal, newDocName } = useSelector((state) => state.ui);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const handleOpenDocument = (doc) => {
    dispatch(setCurrentDoc(doc));
    navigate(`/documents/${doc.id}`);
  };

  const handleCreate = () => {
    if (newDocName.trim()) {
      dispatch(createDocument({ name: newDocName, rows: 100, cols: 26, documents }));
      dispatch(resetNewDoc());
      dispatch(setShowCreateModal(false));
      dispatch(showNotification({ message: 'Документ создан', type: 'success' }));
    }
  };

  const handleRename = (doc) => {
    setRenamingId(doc.id);
    setRenameValue(doc.name);
  };

  const submitRename = (id) => {
    if (renameValue.trim()) {
      dispatch(renameDocument({ id, name: renameValue, documents }));
      dispatch(showNotification({ message: 'Документ переименован', type: 'success' }));
    }
    setRenamingId(null);
  };

  const handleDelete = (doc) => {
    if (window.confirm(`Удалить "${doc.name}"?`)) {
      dispatch(deleteDocument({ id: doc.id, documents }));
      dispatch(showNotification({ message: 'Документ удалён', type: 'success' }));
    }
  };

  const handleDuplicate = (doc) => {
    dispatch(duplicateDocument({ id: doc.id, documents }));
    dispatch(showNotification({ message: 'Документ скопирован', type: 'success' }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString().slice(0, 5)}`;
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <Breadcrumbs />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Мои таблицы</h1>
        <button onClick={() => dispatch(setShowCreateModal(true))} style={{
          background: '#4a90e2', color: 'white', border: 'none', padding: '10px 20px',
          borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
        }}>Создать таблицу</button>
      </div>

      {documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px' }}>
          <p>У вас пока нет документов</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {documents.map(doc => (
            <div key={doc.id} style={{
              background: 'white', borderRadius: '8px', padding: '15px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
            }}>
              <div style={{ flex: 2 }}>
                {renamingId === doc.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => submitRename(doc.id)}
                    onKeyDown={(e) => e.key === 'Enter' && submitRename(doc.id)}
                    autoFocus
                    style={{ fontSize: '16px', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #4a90e2', borderRadius: '4px' }}
                  />
                ) : (
                  <h3 style={{ margin: '0 0 5px 0', cursor: 'pointer' }} onClick={() => handleOpenDocument(doc)}>{doc.name}</h3>
                )}
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatDate(doc.updatedAt)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => handleOpenDocument(doc)} style={{
                  background: '#4a90e2', color: 'white', border: 'none', padding: '6px 12px',
                  borderRadius: '4px', cursor: 'pointer'
                }}>Открыть</button>
                <button onClick={() => handleRename(doc)} style={{
                  background: '#4a90e2', color: 'white', border: 'none', padding: '6px 12px',
                  borderRadius: '4px', cursor: 'pointer'
                }}>Переименовать</button>
                <button onClick={() => handleDuplicate(doc)} style={{
                  background: '#4a90e2', color: 'white', border: 'none', padding: '6px 12px',
                  borderRadius: '4px', cursor: 'pointer'
                }}>Копировать</button>
                <button onClick={() => handleDelete(doc)} style={{
                  background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px',
                  borderRadius: '4px', cursor: 'pointer'
                }}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => dispatch(setShowCreateModal(false))}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', width: '350px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0' }}>Новая таблица</h3>
            <input
              type="text"
              value={newDocName}
              onChange={(e) => dispatch({ type: 'ui/setNewDocName', payload: e.target.value })}
              placeholder="Название"
              autoFocus
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => {
                dispatch(setShowCreateModal(false));
                dispatch(resetNewDoc());
              }} style={{ padding: '8px 16px', border: '1px solid #ddd', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
              <button onClick={handleCreate} style={{ padding: '8px 16px', background: '#4a90e2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Создать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentDashboard;