import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadDocuments } from './store/slices/documentsSlice';
import AppLayout from './components/AppLayout';
import DocumentDashboard from './components/DocumentDashboard';
import Spreadsheet from './components/Spreadsheet';
import ProfilePage from './components/ProfilePage';
import NotFoundPage from './components/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.documents);

  useEffect(() => {
    dispatch(loadDocuments());
  }, [dispatch]);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DocumentDashboard />} />
        </Route>
        
        <Route path="/documents/:documentId" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Spreadsheet />} />
        </Route>
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ProfilePage />} />
        </Route>
        
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;