import uiReducer, {
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
} from './uiSlice';

describe('uiSlice', () => {
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

  describe('начальное состояние', () => {
    it('должен возвращать начальное состояние', () => {
      const result = uiReducer(undefined, { type: 'unknown' });
      expect(result).toEqual(initialState);
    });
  });

  describe('setSaveStatus', () => {
    it('должен устанавливать статус сохранения', () => {
      const action = setSaveStatus('saving');
      const newState = uiReducer(initialState, action);
      expect(newState.saveStatus).toBe('saving');
    });
  });

  describe('setLoading', () => {
    it('должен устанавливать статус загрузки', () => {
      const action = setLoading(true);
      const newState = uiReducer(initialState, action);
      expect(newState.loading).toBe(true);
    });
  });

  describe('setShowExportMenu', () => {
    it('должен показывать/скрывать меню экспорта', () => {
      const action = setShowExportMenu(true);
      const newState = uiReducer(initialState, action);
      expect(newState.showExportMenu).toBe(true);
    });
  });

  describe('setShowCreateModal', () => {
    it('должен показывать/скрывать модальное окно создания', () => {
      const action = setShowCreateModal(true);
      const newState = uiReducer(initialState, action);
      expect(newState.showCreateModal).toBe(true);
    });
  });

  describe('setEditingCell', () => {
    it('должен устанавливать редактируемую ячейку', () => {
      const editingCell = { row: 1, col: 2 };
      const action = setEditingCell(editingCell);
      const newState = uiReducer(initialState, action);
      expect(newState.editingCell).toEqual(editingCell);
    });
  });

  describe('setEditValue', () => {
    it('должен устанавливать значение редактирования', () => {
      const action = setEditValue('Hello');
      const newState = uiReducer(initialState, action);
      expect(newState.editValue).toBe('Hello');
    });
  });

  describe('setFormulaValue', () => {
    it('должен устанавливать значение формулы', () => {
      const action = setFormulaValue('=SUM(A1:A2)');
      const newState = uiReducer(initialState, action);
      expect(newState.formulaValue).toBe('=SUM(A1:A2)');
    });
  });

  describe('clearEditing', () => {
    it('должен очищать состояние редактирования', () => {
      const state = { ...initialState, editingCell: { row: 0, col: 0 }, editValue: 'test', formulaValue: 'test' };
      const action = clearEditing();
      const newState = uiReducer(state, action);
      
      expect(newState.editingCell).toBeNull();
      expect(newState.editValue).toBe('');
      expect(newState.formulaValue).toBe('');
    });
  });

  describe('setRenamingDoc', () => {
    it('должен устанавливать документ для переименования', () => {
      const action = setRenamingDoc({ id: '123', name: 'Doc Name' });
      const newState = uiReducer(initialState, action);
      
      expect(newState.renamingDocId).toBe('123');
      expect(newState.renameValue).toBe('Doc Name');
    });
  });

  describe('setRenameValue', () => {
    it('должен устанавливать новое имя при переименовании', () => {
      const action = setRenameValue('New Name');
      const newState = uiReducer(initialState, action);
      expect(newState.renameValue).toBe('New Name');
    });
  });

  describe('clearRenaming', () => {
    it('должен очищать состояние переименования', () => {
      const state = { ...initialState, renamingDocId: '123', renameValue: 'Name' };
      const action = clearRenaming();
      const newState = uiReducer(state, action);
      
      expect(newState.renamingDocId).toBeNull();
      expect(newState.renameValue).toBe('');
    });
  });

  describe('setNewDocName', () => {
    it('должен устанавливать имя нового документа', () => {
      const action = setNewDocName('My New Doc');
      const newState = uiReducer(initialState, action);
      expect(newState.newDocName).toBe('My New Doc');
    });
  });

  describe('resetNewDoc', () => {
    it('должен сбрасывать имя нового документа к значению по умолчанию', () => {
      const state = { ...initialState, newDocName: 'Changed Name' };
      const action = resetNewDoc();
      const newState = uiReducer(state, action);
      expect(newState.newDocName).toBe('Новая таблица');
    });
  });

  describe('showNotification', () => {
    it('должен показывать уведомление', () => {
      const notification = { message: 'Saved', type: 'success' };
      const action = showNotification(notification);
      const newState = uiReducer(initialState, action);
      expect(newState.notification).toEqual(notification);
    });
  });

  describe('hideNotification', () => {
    it('должен скрывать уведомление', () => {
      const state = { ...initialState, notification: { message: 'Test' } };
      const action = hideNotification();
      const newState = uiReducer(state, action);
      expect(newState.notification).toBeNull();
    });
  });

  describe('setScrollTop', () => {
    it('должен устанавливать позицию прокрутки', () => {
      const action = setScrollTop(150);
      const newState = uiReducer(initialState, action);
      expect(newState.scrollTop).toBe(150);
    });
  });

  describe('resetUI', () => {
    it('должен сбрасывать всё UI состояние', () => {
      const state = { ...initialState, saveStatus: 'saving', loading: true, showExportMenu: true };
      const action = resetUI();
      const newState = uiReducer(state, action);
      expect(newState).toEqual(initialState);
    });
  });
});