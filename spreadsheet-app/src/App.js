import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Spreadsheet from './components/Spreadsheet';
import DocumentDashboard from './components/DocumentDashboard';
import { loadDocuments, setCurrentDoc } from './store/slices/documentsSlice';
import './App.css';

const STORAGE_KEY = 'spreadsheet_docs';

function App() {
  const dispatch = useDispatch();
  const { list: documents, currentDoc, loading } = useSelector((state) => state.documents);

  useEffect(() => {
    dispatch(loadDocuments());
  }, [dispatch]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (currentDoc) return <Spreadsheet onBack={() => dispatch(setCurrentDoc(null))} />;
  return <DocumentDashboard onOpen={(doc) => dispatch(setCurrentDoc(doc))} />;
}

export default App;