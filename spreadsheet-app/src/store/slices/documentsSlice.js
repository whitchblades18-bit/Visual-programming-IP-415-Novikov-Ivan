import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockAuthAPI } from '../../services/mockAuthService';

export const loadDocuments = createAsyncThunk(
  'documents/loadDocuments',
  async () => {
    const docs = await mockAuthAPI.getUserDocuments();
    return docs;
  }
);

export const createDocument = createAsyncThunk(
  'documents/createDocument',
  async ({ name, rows, cols }) => {
    const newDoc = await mockAuthAPI.createDocument({
      name: name,
      rows: rows || 100,
      cols: cols || 26
    });
    return { document: newDoc };
  }
);

export const renameDocument = createAsyncThunk(
  'documents/renameDocument',
  async ({ id, name }) => {
    const updatedDoc = await mockAuthAPI.updateDocument(id, { name });
    return { id, name, document: updatedDoc };
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async ({ id }) => {
    await mockAuthAPI.deleteDocument(id);
    return { id };
  }
);

export const duplicateDocument = createAsyncThunk(
  'documents/duplicateDocument',
  async ({ id }) => {
    const newDoc = await mockAuthAPI.duplicateDocument(id);
    return { document: newDoc };
  }
);

export const saveDocumentData = createAsyncThunk(
  'documents/saveDocumentData',
  async ({ id, data }) => {
    const updatedDoc = await mockAuthAPI.updateDocument(id, { data });
    return { id, data, document: updatedDoc };
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
        mockAuthAPI.updateDocument(state.currentDoc.id, { data: action.payload });
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
        state.list.push(action.payload.document);
      })
      .addCase(renameDocument.fulfilled, (state, action) => {
        const index = state.list.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.list[index].name = action.payload.name;
        }
        if (state.currentDoc?.id === action.payload.id) {
          state.currentDoc.name = action.payload.name;
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.list = state.list.filter(d => d.id !== action.payload.id);
        if (state.currentDoc?.id === action.payload.id) {
          state.currentDoc = null;
        }
      })
      .addCase(duplicateDocument.fulfilled, (state, action) => {
        state.list.push(action.payload.document);
      })
      .addCase(saveDocumentData.fulfilled, (state, action) => {
        const index = state.list.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.list[index].data = action.payload.data;
        }
        if (state.currentDoc?.id === action.payload.id) {
          state.currentDoc.data = action.payload.data;
        }
      });
  }
});

export const { setCurrentDoc, clearCurrentDoc, updateCurrentDocData } = documentsSlice.actions;
export default documentsSlice.reducer;