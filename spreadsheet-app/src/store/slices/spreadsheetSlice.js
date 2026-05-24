import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: {},
  selectedCell: null,
  selectionRange: null,
  columnWidths: {},
  rowHeights: {},
  history: {
    past: [],
    future: []
  }
};

const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    setData(state, action) {
      state.data = action.payload;
    },
    updateCell(state, action) {
      const { row, col, value, computedValue } = action.payload;
      const key = `${row},${col}`;
      
      state.history.past.push(JSON.parse(JSON.stringify(state.data)));
      state.history.future = [];
      
      state.data[key] = { raw: value, computed: computedValue };
    },
    setSelectedCell(state, action) {
      state.selectedCell = action.payload;
    },
    setSelectionRange(state, action) {
      state.selectionRange = action.payload;
    },
    setColumnWidth(state, action) {
      const { col, width } = action.payload;
      state.columnWidths[col] = width;
    },
    setRowHeight(state, action) {
      const { row, height } = action.payload;
      state.rowHeights[row] = height;
    },
    undo(state) {
      if (state.history.past.length === 0) return;
      const previous = state.history.past.pop();
      state.history.future.push(JSON.parse(JSON.stringify(state.data)));
      state.data = previous;
    },
    redo(state) {
      if (state.history.future.length === 0) return;
      const next = state.history.future.pop();
      state.history.past.push(JSON.parse(JSON.stringify(state.data)));
      state.data = next;
    },
    clearHistory(state) {
      state.history.past = [];
      state.history.future = [];
    },
    resetSpreadsheet(state) {
      state.data = {};
      state.selectedCell = null;
      state.selectionRange = null;
      state.columnWidths = {};
      state.rowHeights = {};
      state.history.past = [];
      state.history.future = [];
    }
  }
});

export const {
  setData,
  updateCell,
  setSelectedCell,
  setSelectionRange,
  setColumnWidth,
  setRowHeight,
  undo,
  redo,
  clearHistory,
  resetSpreadsheet
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;