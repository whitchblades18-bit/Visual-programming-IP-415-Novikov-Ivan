import documentsReducer, {
  setCurrentDoc,
  clearCurrentDoc,
  updateCurrentDocData
} from './documentsSlice';

describe('documentsSlice', () => {
  const initialState = {
    list: [],
    currentDoc: null,
    loading: false,
    error: null
  };

  const mockDoc = {
    id: '123',
    name: 'Test Doc',
    rows: 100,
    cols: 26,
    data: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  describe('начальное состояние', () => {
    it('должен возвращать начальное состояние', () => {
      const result = documentsReducer(undefined, { type: 'unknown' });
      expect(result).toEqual(initialState);
    });
  });

  describe('setCurrentDoc', () => {
    it('должен устанавливать текущий документ', () => {
      const action = setCurrentDoc(mockDoc);
      const newState = documentsReducer(initialState, action);
      
      expect(newState.currentDoc).toBeDefined();
      expect(newState.currentDoc.id).toBe('123');
      expect(newState.currentDoc.name).toBe('Test Doc');
    });
  });

  describe('clearCurrentDoc', () => {
    it('должен очищать текущий документ', () => {
      const state = { ...initialState, currentDoc: mockDoc };
      const action = clearCurrentDoc();
      const newState = documentsReducer(state, action);
      
      expect(newState.currentDoc).toBeNull();
    });
  });

  describe('updateCurrentDocData', () => {
    it('должен обновлять данные текущего документа', () => {
      const state = { ...initialState, currentDoc: mockDoc, list: [mockDoc] };
      const newData = { '0,0': { raw: 'test', computed: 'test' } };
      const action = updateCurrentDocData(newData);
      const newState = documentsReducer(state, action);
      
      expect(newState.currentDoc.data).toEqual(newData);
      expect(newState.currentDoc.updatedAt).toBeDefined();
    });
  });

  describe('loadDocuments', () => {
    it('должен обрабатывать loadDocuments.pending', () => {
      const action = { type: 'documents/loadDocuments/pending' };
      const newState = documentsReducer(initialState, action);
      
      expect(newState.loading).toBe(true);
    });

    it('должен обрабатывать loadDocuments.fulfilled', () => {
      const action = { type: 'documents/loadDocuments/fulfilled', payload: [mockDoc] };
      const newState = documentsReducer(initialState, action);
      
      expect(newState.list).toEqual([mockDoc]);
      expect(newState.loading).toBe(false);
    });

    it('должен обрабатывать loadDocuments.rejected', () => {
      const action = { type: 'documents/loadDocuments/rejected', error: { message: 'Error' } };
      const newState = documentsReducer(initialState, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Error');
    });
  });

  describe('createDocument', () => {
    it('должен обрабатывать createDocument.fulfilled', () => {
      const action = { type: 'documents/createDocument/fulfilled', payload: { documents: [mockDoc] } };
      const newState = documentsReducer(initialState, action);
      
      expect(newState.list).toEqual([mockDoc]);
    });
  });

  describe('renameDocument', () => {
    it('должен обрабатывать renameDocument.fulfilled', () => {
      const state = { ...initialState, list: [mockDoc], currentDoc: mockDoc };
      const action = { 
        type: 'documents/renameDocument/fulfilled', 
        payload: { id: '123', name: 'Renamed', documents: [{ ...mockDoc, name: 'Renamed' }] } 
      };
      const newState = documentsReducer(state, action);
      
      expect(newState.list[0].name).toBe('Renamed');
      expect(newState.currentDoc.name).toBe('Renamed');
    });
  });

  describe('deleteDocument', () => {
    it('должен обрабатывать deleteDocument.fulfilled', () => {
      const state = { ...initialState, list: [mockDoc], currentDoc: mockDoc };
      const action = { type: 'documents/deleteDocument/fulfilled', payload: { id: '123', documents: [] } };
      const newState = documentsReducer(state, action);
      
      expect(newState.list).toEqual([]);
      expect(newState.currentDoc).toBeNull();
    });
  });

  describe('duplicateDocument', () => {
    it('должен обрабатывать duplicateDocument.fulfilled', () => {
      const action = { 
        type: 'documents/duplicateDocument/fulfilled', 
        payload: { documents: [mockDoc, { ...mockDoc, id: '456', name: 'Test Doc (копия)' }] } 
      };
      const newState = documentsReducer(initialState, action);
      
      expect(newState.list.length).toBe(2);
      expect(newState.list[1].name).toBe('Test Doc (копия)');
    });
  });
});