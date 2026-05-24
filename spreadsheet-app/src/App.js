import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadDocuments } from './store/slices/documentsSlice';
import { mockAuthAPI, isAuthenticated } from './services/mockAuthService';
import AppLayout from './components/AppLayout';
import DocumentDashboard from './components/DocumentDashboard';
import Spreadsheet from './components/Spreadsheet';
import ProfilePage from './components/ProfilePage';
import NotFoundPage from './components/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);
  const { loading } = useSelector((state) => state.documents);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await mockAuthAPI.getCurrentUser();
        if (result && isAuthenticated()) {
          dispatch(loadDocuments());
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [dispatch]);

  if (!authChecked) {
    return <div className="loading">Проверка авторизации...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
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