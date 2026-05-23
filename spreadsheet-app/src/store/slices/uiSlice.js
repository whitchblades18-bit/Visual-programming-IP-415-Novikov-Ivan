import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  saveStatus: 'saved',
  loading: false,
  
  showExportMenu: false,
  showCreateModal: false,
  
  editingCell: null,
  editValue: '',
  formulaValue: '',
  
  renamingDocId: null,
  renameValue: '',
  
  newDocName: 'Новая таблица',
  
  notification: null,
  
  scrollTop: 0
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSaveStatus(state, action) {
      state.saveStatus = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    
    setShowExportMenu(state, action) {
      state.showExportMenu = action.payload;
    },
    setShowCreateModal(state, action) {
      state.showCreateModal = action.payload;
    },
    
    setEditingCell(state, action) {
      state.editingCell = action.payload;
    },
    setEditValue(state, action) {
      state.editValue = action.payload;
    },
    setFormulaValue(state, action) {
      state.formulaValue = action.payload;
    },
    clearEditing(state) {
      state.editingCell = null;
      state.editValue = '';
      state.formulaValue = '';
    },
    
    setRenamingDoc(state, action) {
      state.renamingDocId = action.payload?.id || null;
      state.renameValue = action.payload?.name || '';
    },
    setRenameValue(state, action) {
      state.renameValue = action.payload;
    },
    clearRenaming(state) {
      state.renamingDocId = null;
      state.renameValue = '';
    },
    
    setNewDocName(state, action) {
      state.newDocName = action.payload;
    },
    resetNewDoc(state) {
      state.newDocName = 'Новая таблица';
    },
    
    showNotification(state, action) {
      state.notification = action.payload;
    },
    hideNotification(state) {
      state.notification = null;
    },
    
    setScrollTop(state, action) {
      state.scrollTop = action.payload;
    },
    
    resetUI(state) {
      return { ...initialState };
    }
  }
});

export const {
  setSaveStatus,
  setLoading,
  setShowExportMenu,
  setShowCreateModal,
  setEditingCell,
  setEditValue,
  setFormulaValue,
  clearEditing,
  setRenamingDoc,
  setRenameValue,
  clearRenaming,
  setNewDocName,
  resetNewDoc,
  showNotification,
  hideNotification,
  setScrollTop,
  resetUI
} = uiSlice.actions;

export default uiSlice.reducer;