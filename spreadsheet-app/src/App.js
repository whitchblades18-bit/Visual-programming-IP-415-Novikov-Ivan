import React, { useState, useEffect } from 'react';
import Spreadsheet from './components/Spreadsheet';
import DocumentDashboard from './components/DocumentDashboard';
import './App.css';

const STORAGE_KEY = 'spreadsheet_docs';

function App() {
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setDocuments(JSON.parse(saved));
    setLoading(false);
  }, []);

  const saveDocuments = (newDocs) => {
    setDocuments(newDocs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDocs));
  };

  const createDocument = (name, rows, cols) => {
    const newDoc = {
      id: Date.now().toString(),
      name: name,
      rows: rows || 100,
      cols: cols || 26,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {}
    };
    saveDocuments([...documents, newDoc]);
    setCurrentDoc(newDoc);
  };

  const renameDocument = (id, updates) => {
    const updated = documents.map(doc => doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc);
    saveDocuments(updated);
    if (currentDoc?.id === id) setCurrentDoc({ ...currentDoc, ...updates });
  };

  const deleteDocument = (id) => {
    const filtered = documents.filter(doc => doc.id !== id);
    saveDocuments(filtered);
    if (currentDoc?.id === id) setCurrentDoc(null);
  };

  const duplicateDocument = (id) => {
    const original = documents.find(doc => doc.id === id);
    if (original) {
      const newDoc = {
        ...original,
        id: Date.now().toString(),
        name: `${original.name} (копия)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: JSON.parse(JSON.stringify(original.data))
      };
      saveDocuments([...documents, newDoc]);
    }
  };

  const saveDocumentData = (id, data) => {
    const updated = documents.map(doc => doc.id === id ? { ...doc, data, updatedAt: new Date().toISOString() } : doc);
    saveDocuments(updated);
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (currentDoc) return <Spreadsheet document={currentDoc} onSave={saveDocumentData} onBack={() => setCurrentDoc(null)} />;
  return <DocumentDashboard documents={documents} onCreate={createDocument} onDelete={deleteDocument} onRename={renameDocument} onDuplicate={duplicateDocument} onOpen={setCurrentDoc} />;
}

export default App;