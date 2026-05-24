import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: {},
  styles: {},
  selectedCell: null,
  selectionRange: null,
  columnWidths: {},
  rowHeights: {},
  clipboard: null,
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
    setStyles(state, action) {
      state.styles = action.payload;
    },
    updateCell(state, action) {
      const { row, col, value, computedValue } = action.payload;
      const key = `${row},${col}`;
      
      state.history.past.push(JSON.parse(JSON.stringify({
        data: state.data,
        styles: state.styles
      })));
      state.history.future = [];
      
      state.data[key] = { raw: value, computed: computedValue };
    },
    updateCellStyle(state, action) {
      const { row, col, styleKey, styleValue } = action.payload;
      const key = `${row},${col}`;
      
      state.history.past.push(JSON.parse(JSON.stringify({
        data: state.data,
        styles: state.styles
      })));
      state.history.future = [];
      
      if (!state.styles[key]) {
        state.styles[key] = {};
      }
      state.styles[key][styleKey] = styleValue;
    },
    updateRangeStyles(state, action) {
      const { range, styles: newStyles } = action.payload;
      const startRow = Math.min(range.start.row, range.end.row);
      const endRow = Math.max(range.start.row, range.end.row);
      const startCol = Math.min(range.start.col, range.end.col);
      const endCol = Math.max(range.start.col, range.end.col);
      
      state.history.past.push(JSON.parse(JSON.stringify({
        data: state.data,
        styles: state.styles
      })));
      state.history.future = [];
      
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const key = `${row},${col}`;
          if (!state.styles[key]) {
            state.styles[key] = {};
          }
          Object.assign(state.styles[key], newStyles);
        }
      }
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
    copySelection(state, action) {
      const { startRow, endRow, startCol, endCol } = action.payload;
      const clipboardData = {};
      
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const key = `${row},${col}`;
          clipboardData[`${row - startRow},${col - startCol}`] = {
            data: state.data[key] || { raw: '', computed: '' },
            style: state.styles[key] || {}
          };
        }
      }
      state.clipboard = { data: clipboardData, cut: false };
    },
    cutSelection(state, action) {
      const { startRow, endRow, startCol, endCol } = action.payload;
      const clipboardData = {};
      
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const key = `${row},${col}`;
          clipboardData[`${row - startRow},${col - startCol}`] = {
            data: state.data[key] || { raw: '', computed: '' },
            style: state.styles[key] || {}
          };
          delete state.data[key];
          delete state.styles[key];
        }
      }
      state.clipboard = { data: clipboardData, cut: true };
    },
    pasteSelection(state, action) {
      const { targetRow, targetCol } = action.payload;
      if (!state.clipboard) return;
      
      state.history.past.push(JSON.parse(JSON.stringify({
        data: state.data,
        styles: state.styles
      })));
      state.history.future = [];
      
      const clipboardData = state.clipboard.data;
      Object.keys(clipboardData).forEach(key => {
        const [relRow, relCol] = key.split(',').map(Number);
        const targetKey = `${targetRow + relRow},${targetCol + relCol}`;
        
        state.data[targetKey] = { ...clipboardData[key].data };
        if (Object.keys(clipboardData[key].style).length > 0) {
          state.styles[targetKey] = { ...clipboardData[key].style };
        }
      });
      
      if (state.clipboard.cut) {
        state.clipboard = null;
      }
    },
    clearClipboard(state) {
      state.clipboard = null;
    },
    undo(state) {
      if (state.history.past.length === 0) return;
      const previous = state.history.past.pop();
      state.history.future.push(JSON.parse(JSON.stringify({
        data: state.data,
        styles: state.styles
      })));
      state.data = previous.data;
      state.styles = previous.styles;
    },
    redo(state) {
      if (state.history.future.length === 0) return;
      const next = state.history.future.pop();
      state.history.past.push(JSON.parse(JSON.stringify({
        data: state.data,
        styles: state.styles
      })));
      state.data = next.data;
      state.styles = next.styles;
    },
    clearHistory(state) {
      state.history.past = [];
      state.history.future = [];
    },
    resetSpreadsheet(state) {
      state.data = {};
      state.styles = {};
      state.selectedCell = null;
      state.selectionRange = null;
      state.columnWidths = {};
      state.rowHeights = {};
      state.clipboard = null;
      state.history.past = [];
      state.history.future = [];
    }
  }
});

export const {
  setData,
  setStyles,
  updateCell,
  updateCellStyle,
  updateRangeStyles,
  setSelectedCell,
  setSelectionRange,
  setColumnWidth,
  setRowHeight,
  copySelection,
  cutSelection,
  pasteSelection,
  clearClipboard,
  undo,
  redo,
  clearHistory,
  resetSpreadsheet
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;