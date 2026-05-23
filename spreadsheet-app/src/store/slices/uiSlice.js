import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  saveStatus: 'saved',
  showExportMenu: false,
  showCreateModal: false,
  notification: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSaveStatus(state, action) {
      state.saveStatus = action.payload;
    },
    setShowExportMenu(state, action) {
      state.showExportMenu = action.payload;
    },
    setShowCreateModal(state, action) {
      state.showCreateModal = action.payload;
    },
    showNotification(state, action) {
      state.notification = action.payload;
    },
    hideNotification(state) {
      state.notification = null;
    }
  }
});

export const {
  setSaveStatus,
  setShowExportMenu,
  setShowCreateModal,
  showNotification,
  hideNotification
} = uiSlice.actions;

export default uiSlice.reducer;