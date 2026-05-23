import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const STORAGE_KEY = 'spreadsheet_docs';

export const loadDocuments = createAsyncThunk(
  'documents/loadDocuments',
  async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }
);

export const createDocument = createAsyncThunk(
  'documents/createDocument',
  async ({ name, rows, cols, documents }) => {
    const newDoc = {
      id: Date.now().toString(),
      name: name,
      rows: rows || 100,
      cols: cols || 26,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {}
    };
    const updated = [...documents, newDoc];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { document: newDoc, documents: updated };
  }
);

export const renameDocument = createAsyncThunk(
  'documents/renameDocument',
  async ({ id, name, documents }) => {
    const updated = documents.map(doc =>
      doc.id === id ? { ...doc, name, updatedAt: new Date().toISOString() } : doc
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { id, name, documents: updated };
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async ({ id, documents }) => {
    const filtered = documents.filter(doc => doc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return { id, documents: filtered };
  }
);

export const duplicateDocument = createAsyncThunk(
  'documents/duplicateDocument',
  async ({ id, documents }) => {
    const original = documents.find(doc => doc.id === id);
    const newDoc = {
      ...original,
      id: Date.now().toString(),
      name: `${original.name} (копия)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(original.data))
    };
    const updated = [...documents, newDoc];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { document: newDoc, documents: updated };
  }
);

export const saveDocumentData = createAsyncThunk(
  'documents/saveDocumentData',
  async ({ id, data, documents }) => {
    const updated = documents.map(doc =>
      doc.id === id ? { ...doc, data, updatedAt: new Date().toISOString() } : doc
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { id, data, documents: updated };
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    list: [],
    currentDoc: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentDoc(state, action) {
      state.currentDoc = action.payload;
    },
    clearCurrentDoc(state) {
      state.currentDoc = null;
    },
    updateCurrentDocData(state, action) {
      if (state.currentDoc) {
        state.currentDoc.data = action.payload;
        state.currentDoc.updatedAt = new Date().toISOString();
        const docIndex = state.list.findIndex(d => d.id === state.currentDoc.id);
        if (docIndex !== -1) {
          state.list[docIndex].data = action.payload;
          state.list[docIndex].updatedAt = new Date().toISOString();
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDocuments.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(loadDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.list = action.payload.documents;
      })
      .addCase(renameDocument.fulfilled, (state, action) => {
        state.list = action.payload.documents;
        if (state.currentDoc?.id === action.payload.id) {
          state.currentDoc.name = action.payload.name;
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.list = action.payload.documents;
        if (state.currentDoc?.id === action.payload.id) {
          state.currentDoc = null;
        }
      })
      .addCase(duplicateDocument.fulfilled, (state, action) => {
        state.list = action.payload.documents;
      });
  }
});

export const { setCurrentDoc, clearCurrentDoc, updateCurrentDocData } = documentsSlice.actions;
export default documentsSlice.reducer;