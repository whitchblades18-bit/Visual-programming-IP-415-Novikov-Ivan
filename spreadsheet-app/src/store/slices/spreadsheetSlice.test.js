import spreadsheetReducer, {
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
} from './spreadsheetSlice';

describe('spreadsheetSlice', () => {
  const initialState = {
    data: {},
    selectedCell: null,
    selectionRange: null,
    columnWidths: {},
    rowHeights: {},
    history: { past: [], future: [] }
  };

  describe('начальное состояние', () => {
    it('должен возвращать начальное состояние', () => {
      const result = spreadsheetReducer(undefined, { type: 'unknown' });
      expect(result).toEqual(initialState);
    });
  });

  describe('setData', () => {
    it('должен устанавливать данные таблицы', () => {
      const newData = { '0,0': { raw: 'test', computed: 'test' } };
      const action = setData(newData);
      const newState = spreadsheetReducer(initialState, action);
      expect(newState.data).toEqual(newData);
    });
  });

  describe('updateCell', () => {
    it('должен обновлять ячейку и сохранять историю', () => {
      const action = updateCell({ row: 0, col: 0, value: 'Hello', computedValue: 'Hello' });
      const newState = spreadsheetReducer(initialState, action);
      
      expect(newState.data['0,0']).toBeDefined();
      expect(newState.data['0,0'].raw).toBe('Hello');
      expect(newState.data['0,0'].computed).toBe('Hello');
      expect(newState.history.past.length).toBe(1);
    });
  });

  describe('setSelectedCell', () => {
    it('должен устанавливать выбранную ячейку', () => {
      const action = setSelectedCell({ row: 2, col: 3 });
      const newState = spreadsheetReducer(initialState, action);
      
      expect(newState.selectedCell).toBeDefined();
      expect(newState.selectedCell.row).toBe(2);
      expect(newState.selectedCell.col).toBe(3);
    });
  });

  describe('setSelectionRange', () => {
    it('должен устанавливать диапазон выделения', () => {
      const range = { start: { row: 0, col: 0 }, end: { row: 2, col: 2 } };
      const action = setSelectionRange(range);
      const newState = spreadsheetReducer(initialState, action);
      
      expect(newState.selectionRange).toEqual(range);
    });
  });

  describe('setColumnWidth', () => {
    it('должен устанавливать ширину столбца', () => {
      const action = setColumnWidth({ col: 1, width: 150 });
      const newState = spreadsheetReducer(initialState, action);
      
      expect(newState.columnWidths[1]).toBe(150);
    });
  });

  describe('setRowHeight', () => {
    it('должен устанавливать высоту строки', () => {
      const action = setRowHeight({ row: 1, height: 45 });
      const newState = spreadsheetReducer(initialState, action);
      
      expect(newState.rowHeights[1]).toBe(45);
    });
  });

  describe('undo', () => {
    it('должен отменять последнее изменение', () => {
      let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: 'First', computedValue: 'First' }));
      state = spreadsheetReducer(state, updateCell({ row: 0, col: 0, value: 'Second', computedValue: 'Second' }));
      state = spreadsheetReducer(state, undo());
      
      expect(state.data['0,0']?.raw).toBe('First');
      expect(state.history.future.length).toBe(1);
    });

    it('не должен ничего делать, если история пуста', () => {
      const newState = spreadsheetReducer(initialState, undo());
      expect(newState).toEqual(initialState);
    });
  });

  describe('redo', () => {
    it('должен повторять отменённое изменение', () => {
      let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: 'First', computedValue: 'First' }));
      state = spreadsheetReducer(state, updateCell({ row: 0, col: 0, value: 'Second', computedValue: 'Second' }));
      state = spreadsheetReducer(state, undo());
      state = spreadsheetReducer(state, redo());
      
      expect(state.data['0,0']?.raw).toBe('Second');
    });

    it('не должен ничего делать, если будущее пусто', () => {
      const newState = spreadsheetReducer(initialState, redo());
      expect(newState).toEqual(initialState);
    });
  });

  describe('clearHistory', () => {
    it('должен очищать историю', () => {
      let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: 'Test', computedValue: 'Test' }));
      state = spreadsheetReducer(state, clearHistory());
      
      expect(state.history.past).toEqual([]);
      expect(state.history.future).toEqual([]);
    });
  });

  describe('resetSpreadsheet', () => {
    it('должен сбрасывать всё состояние таблицы', () => {
      let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: 'Test', computedValue: 'Test' }));
      state = spreadsheetReducer(state, setSelectedCell({ row: 1, col: 1 }));
      state = spreadsheetReducer(state, setColumnWidth({ col: 0, width: 200 }));
      state = spreadsheetReducer(state, resetSpreadsheet());
      
      expect(state).toEqual(initialState);
    });
  });
});