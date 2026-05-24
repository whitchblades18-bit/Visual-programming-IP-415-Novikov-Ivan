import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  updateCell,
  setSelectedCell,
  setSelectionRange,
  setColumnWidth,
  setRowHeight,
  undo,
  redo,
  setData,
  clearHistory
} from '../store/slices/spreadsheetSlice';
import { updateCurrentDocData, setCurrentDoc } from '../store/slices/documentsSlice';
import { setSaveStatus, setShowExportMenu, showNotification } from '../store/slices/uiSlice';
import Breadcrumbs from './Breadcrumbs';

const ROW_HEIGHT = 30;
const VISIBLE_ROWS = 30;

function Spreadsheet() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { data, selectedCell, selectionRange, columnWidths, rowHeights } = useSelector((state) => state.spreadsheet);
  const { currentDoc: doc, list: documents, loading } = useSelector((state) => state.documents);
  const { saveStatus, showExportMenu } = useSelector((state) => state.ui);
  
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [formulaValue, setFormulaValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  const containerRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const autoSaveEnabledRef = useRef(true);

  const ROWS = doc?.rows || 100;
  const COLS = doc?.cols || 26;

  useEffect(() => {
    if (documentId && documents.length > 0 && !loading) {
      const document = documents.find(d => d.id === documentId);
      if (document) {
        if (!doc || doc.id !== documentId) {
          dispatch(setCurrentDoc(document));
          setIsInitialized(false);
        }
      } else {
        dispatch(showNotification({ message: 'Документ не найден', type: 'error' }));
        navigate('/404', { replace: true });
      }
    }
  }, [documentId, documents, loading, dispatch, navigate, doc]);

  useEffect(() => {
    if (doc && doc.data && !isInitialized) {
      const docData = doc.data || {};
      dispatch(setData(docData));
      dispatch(clearHistory());
      setIsInitialized(true);
    }
  }, [doc, dispatch, isInitialized]);

  const saveDocument = useCallback((dataToSave) => {
    if (!autoSaveEnabledRef.current) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    dispatch(setSaveStatus('saving'));
    
    saveTimeoutRef.current = setTimeout(() => {
      if (doc && dataToSave) {
        dispatch(updateCurrentDocData(dataToSave));
        dispatch(setSaveStatus('saved'));
      }
    }, 500);
  }, [doc, dispatch]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (doc && isInitialized) {
        const currentData = window.store?.getState()?.spreadsheet?.data || data;
        dispatch(updateCurrentDocData(currentData));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [doc, data, dispatch, isInitialized]);

  const safeNavigate = useCallback((path) => {
    if (doc && isInitialized) {
      const currentData = window.store?.getState()?.spreadsheet?.data || data;
      dispatch(updateCurrentDocData(currentData));
    }
    navigate(path);
  }, [navigate, doc, data, dispatch, isInitialized]);

  const getCellValue = (row, col) => {
    const cell = data[`${row},${col}`];
    if (!cell) return '';
    return cell.computed !== undefined ? cell.computed : cell.raw;
  };

  const getCellRaw = (row, col) => {
    const cell = data[`${row},${col}`];
    return cell ? cell.raw : '';
  };

  const evaluateFormula = useCallback((formula, currentData) => {
    const expression = formula.substring(1);
    
    const sumMatch = expression.match(/SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/i);
    if (sumMatch) {
      const startCol = sumMatch[1].charCodeAt(0) - 65;
      const startRow = parseInt(sumMatch[2]) - 1;
      const endCol = sumMatch[3].charCodeAt(0) - 65;
      const endRow = parseInt(sumMatch[4]) - 1;
      let sum = 0;
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const val = getCellValue(row, col);
          const num = parseFloat(val);
          if (!isNaN(num)) sum += num;
        }
      }
      return sum;
    }
    
    const avgMatch = expression.match(/AVERAGE\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/i);
    if (avgMatch) {
      const startCol = avgMatch[1].charCodeAt(0) - 65;
      const startRow = parseInt(avgMatch[2]) - 1;
      const endCol = avgMatch[3].charCodeAt(0) - 65;
      const endRow = parseInt(avgMatch[4]) - 1;
      let sum = 0, count = 0;
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const val = getCellValue(row, col);
          const num = parseFloat(val);
          if (!isNaN(num)) { sum += num; count++; }
        }
      }
      return count > 0 ? sum / count : 0;
    }
    
    let evalExpr = expression;
    const cellRefs = expression.match(/[A-Z]+\d+/g);
    if (cellRefs) {
      cellRefs.forEach(ref => {
        const col = ref.charCodeAt(0) - 65;
        const row = parseInt(ref.substring(1)) - 1;
        const value = getCellValue(row, col);
        evalExpr = evalExpr.replace(ref, value);
      });
    }
    
    try {
      const result = Function('"use strict";return (' + evalExpr + ')')();
      return Math.round(result * 100) / 100;
    } catch (e) {
      return '#ОШИБКА!';
    }
  }, [getCellValue]);

  const handleUpdateCell = useCallback((row, col, rawValue) => {
    let computedValue = rawValue;
    if (typeof rawValue === 'string' && rawValue.startsWith('=')) {
      try {
        computedValue = evaluateFormula(rawValue, data);
      } catch (e) {
        computedValue = '#ОШИБКА!';
      }
    }
    
    dispatch(updateCell({ row, col, value: rawValue, computedValue }));
    
    setTimeout(() => {
      const state = window.store?.getState();
      const currentData = state?.spreadsheet?.data;
      if (currentData) {
        Object.keys(currentData).forEach(key => {
          const cell = currentData[key];
          if (cell.raw && typeof cell.raw === 'string' && cell.raw.startsWith('=')) {
            try {
              const newComputed = evaluateFormula(cell.raw, currentData);
              if (newComputed !== cell.computed) {
                const [r, c] = key.split(',').map(Number);
                dispatch(updateCell({ row: r, col: c, value: cell.raw, computedValue: newComputed }));
              }
            } catch (e) {}
          }
        });
      }
    }, 0);
    
    const newData = { ...data, [`${row},${col}`]: { raw: rawValue, computed: computedValue } };
    saveDocument(newData);
  }, [dispatch, data, evaluateFormula, saveDocument]);

  const startEdit = (row, col) => {
    setEditingCell({ row, col });
    setEditValue(getCellRaw(row, col));
    setFormulaValue(getCellRaw(row, col));
  };

  const finishEdit = () => {
    if (editingCell) {
      handleUpdateCell(editingCell.row, editingCell.col, editValue);
      setEditingCell(null);
    }
  };

  const addRowAbove = (currentRow) => {
    const newData = {};
    Object.keys(data).forEach(key => {
      const [row, col] = key.split(',').map(Number);
      if (row < currentRow) newData[key] = data[key];
      else newData[`${row + 1},${col}`] = data[key];
    });
    dispatch(setData(newData));
    saveDocument(newData);
    dispatch(showNotification({ message: 'Строка добавлена', type: 'success' }));
  };

  const deleteRow = (row) => {
    const newData = {};
    Object.keys(data).forEach(key => {
      const [r, col] = key.split(',').map(Number);
      if (r < row) newData[key] = data[key];
      else if (r > row) newData[`${r - 1},${col}`] = data[key];
    });
    dispatch(setData(newData));
    saveDocument(newData);
    if (selectedCell?.row === row) dispatch(setSelectedCell(null));
    else if (selectedCell?.row > row) dispatch(setSelectedCell({ row: selectedCell.row - 1, col: selectedCell.col }));
    dispatch(showNotification({ message: 'Строка удалена', type: 'success' }));
  };

  const addColumnLeft = (currentCol) => {
    const newData = {};
    Object.keys(data).forEach(key => {
      const [row, col] = key.split(',').map(Number);
      if (col < currentCol) newData[key] = data[key];
      else newData[`${row},${col + 1}`] = data[key];
    });
    dispatch(setData(newData));
    saveDocument(newData);
    if (selectedCell && selectedCell.col >= currentCol) {
      dispatch(setSelectedCell({ row: selectedCell.row, col: selectedCell.col + 1 }));
    }
    dispatch(showNotification({ message: 'Столбец добавлен', type: 'success' }));
  };

  const deleteColumn = (col) => {
    const newData = {};
    Object.keys(data).forEach(key => {
      const [row, c] = key.split(',').map(Number);
      if (c < col) newData[key] = data[key];
      else if (c > col) newData[`${row},${c - 1}`] = data[key];
    });
    dispatch(setData(newData));
    saveDocument(newData);
    if (selectedCell?.col === col) dispatch(setSelectedCell(null));
    else if (selectedCell?.col > col) dispatch(setSelectedCell({ row: selectedCell.row, col: selectedCell.col - 1 }));
    dispatch(showNotification({ message: 'Столбец удалён', type: 'success' }));
  };

  const exportToCSV = () => {
    const rows = [];
    for (let row = 0; row < ROWS; row++) {
      const rowData = [];
      for (let col = 0; col < COLS; col++) {
        let val = getCellValue(row, col);
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        rowData.push(val);
      }
      rows.push(rowData.join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${doc?.name || 'table'}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    dispatch(showNotification({ message: 'Экспорт CSV выполнен', type: 'success' }));
  };

  const exportToJSON = () => {
    const exportData = { name: doc?.name, rows: ROWS, cols: COLS, data: data };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${doc?.name || 'table'}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    dispatch(showNotification({ message: 'Экспорт JSON выполнен', type: 'success' }));
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n');
      const newData = {};
      for (let i = 0; i < Math.min(rows.length, ROWS); i++) {
        const cells = rows[i].split(',');
        for (let j = 0; j < Math.min(cells.length, COLS); j++) {
          let val = cells[j].trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
          if (!isNaN(val) && val !== '') val = parseFloat(val);
          newData[`${i},${j}`] = { raw: val, computed: val };
        }
      }
      dispatch(setData(newData));
      saveDocument(newData);
      dispatch(showNotification({ message: 'Импорт CSV выполнен', type: 'success' }));
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  const handleContextMenu = (e, row, col) => {
    e.preventDefault();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <div class="menu-item" data-action="add-row">Добавить строку выше</div>
      <div class="menu-item" data-action="delete-row">Удалить строку</div>
      <hr/>
      <div class="menu-item" data-action="add-col">Добавить столбец левее</div>
      <div class="menu-item" data-action="delete-col">Удалить столбец</div>
    `;
    menu.style.position = 'fixed';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    
    const handleClick = (clickEvent) => {
      const action = clickEvent.target.dataset.action;
      if (action === 'add-row') addRowAbove(row);
      if (action === 'delete-row') deleteRow(row);
      if (action === 'add-col') addColumnLeft(col);
      if (action === 'delete-col') deleteColumn(col);
      document.body.removeChild(menu);
    };
    menu.addEventListener('click', handleClick);
    document.body.appendChild(menu);
    
    const removeMenu = () => {
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
      document.removeEventListener('click', removeMenu);
    };
    setTimeout(() => document.addEventListener('click', removeMenu), 0);
  };

  const startResize = (colIndex, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[colIndex] || 100;
    const handleMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      dispatch(setColumnWidth({ col: colIndex, width: Math.max(50, newWidth) }));
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startRowResize = (rowIndex, e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = rowHeights[rowIndex] || ROW_HEIGHT;
    const handleMouseMove = (moveEvent) => {
      const newHeight = startHeight + (moveEvent.clientY - startY);
      dispatch(setRowHeight({ row: rowIndex, height: Math.max(25, newHeight) }));
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleScroll = (e) => setScrollTop(e.target.scrollTop);
  const getColumnLabel = (index) => String.fromCharCode(65 + index);
  
  const isCellInRange = (row, col) => {
    if (!selectionRange) return false;
    const minRow = Math.min(selectionRange.start.row, selectionRange.end.row);
    const maxRow = Math.max(selectionRange.start.row, selectionRange.end.row);
    const minCol = Math.min(selectionRange.start.col, selectionRange.end.col);
    const maxCol = Math.max(selectionRange.start.col, selectionRange.end.col);
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  const handleCellClick = (row, col, e) => {
    if (e.shiftKey && selectedCell) {
      dispatch(setSelectionRange({ start: selectedCell, end: { row, col } }));
    } else {
      dispatch(setSelectedCell({ row, col }));
      dispatch(setSelectionRange(null));
      setFormulaValue(getCellRaw(row, col));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        dispatch(undo());
        setTimeout(() => {
          const state = window.store?.getState();
          if (state && doc) {
            saveDocument(state.spreadsheet.data);
          }
        }, 100);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        dispatch(redo());
        setTimeout(() => {
          const state = window.store?.getState();
          if (state && doc) {
            saveDocument(state.spreadsheet.data);
          }
        }, 100);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const state = window.store?.getState();
        if (state && doc) {
          dispatch(updateCurrentDocData(state.spreadsheet.data));
          dispatch(setSaveStatus('saved'));
          dispatch(showNotification({ message: 'Документ сохранён', type: 'success' }));
        }
      } else if (editingCell) {
        if (e.key === 'Enter') finishEdit();
        else if (e.key === 'Escape') setEditingCell(null);
      } else if (selectedCell) {
        const { row, col } = selectedCell;
        if (e.key === 'Enter') startEdit(row, col);
        else if (e.key === 'Delete') handleUpdateCell(row, col, '');
        else if (e.key === 'ArrowUp' && row > 0) dispatch(setSelectedCell({ row: row - 1, col }));
        else if (e.key === 'ArrowDown' && row < ROWS - 1) dispatch(setSelectedCell({ row: row + 1, col }));
        else if (e.key === 'ArrowLeft' && col > 0) dispatch(setSelectedCell({ row, col: col - 1 }));
        else if (e.key === 'ArrowRight' && col < COLS - 1) dispatch(setSelectedCell({ row, col: col + 1 }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingCell, selectedCell, data, doc, dispatch, ROWS, COLS, handleUpdateCell, saveDocument]);

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT));
  const endIndex = Math.min(startIndex + VISIBLE_ROWS, ROWS);
  const visibleRows = [];
  for (let i = startIndex; i < endIndex; i++) visibleRows.push(i);

  if (!doc || !isInitialized) {
    return <div className="loading">Загрузка документа...</div>;
  }

  return (
    <div className="spreadsheet">
      <Breadcrumbs />
      <div className="formula-bar">
        <div className="formula-label"><span className="fx">fx</span></div>
        <input 
          type="text" 
          className="formula-input" 
          value={formulaValue} 
          onChange={(e) => {
            setFormulaValue(e.target.value);
            if (selectedCell && !editingCell) setEditValue(e.target.value);
          }} 
          onKeyDown={(e) => { 
            if (e.key === 'Enter' && selectedCell) {
              handleUpdateCell(selectedCell.row, selectedCell.col, formulaValue);
            }
          }} 
          onBlur={() => { 
            if (selectedCell && !editingCell && formulaValue !== getCellRaw(selectedCell.row, selectedCell.col)) {
              handleUpdateCell(selectedCell.row, selectedCell.col, formulaValue);
            }
          }}
          placeholder="Введите значение или формулу..." 
        />
        
        <div className="toolbar-buttons">
          <span className={`save-indicator ${saveStatus}`}>
            {saveStatus === 'saved' && '✓ Сохранено'}
            {saveStatus === 'saving' && '⟳ Сохранение...'}
          </span>
          <button className="toolbar-btn" onClick={() => dispatch(setShowExportMenu(!showExportMenu))}>Экспорт</button>
          <button className="back-btn" onClick={() => safeNavigate('/dashboard')}>← Назад</button>
        </div>
        
        {showExportMenu && (
          <div className="export-menu">
            <button onClick={exportToCSV}>Экспорт CSV</button>
            <button onClick={exportToJSON}>Экспорт JSON</button>
            <label className="import-label">
              Импорт CSV
              <input type="file" accept=".csv" onChange={importCSV} style={{ display: 'none' }} />
            </label>
          </div>
        )}
      </div>
      
      <div ref={containerRef} className="grid-container" onScroll={handleScroll}>
        <div className="grid">
          <div className="corner"></div>
          <div className="headers-row">
            {Array.from({ length: COLS }).map((_, i) => (
              <div key={i} className="col-header" style={{ width: columnWidths[i] || 100 }}>
                {getColumnLabel(i)}
                <div className="col-resize" onMouseDown={(e) => startResize(i, e)} />
              </div>
            ))}
          </div>
          
          <div style={{ height: `${ROWS * ROW_HEIGHT}px`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: startIndex * ROW_HEIGHT, width: '100%' }}>
              {visibleRows.map(row => {
                const currentRowHeight = rowHeights[row] || ROW_HEIGHT;
                return (
                  <div key={row} className="row" style={{ height: currentRowHeight }}>
                    <div className="row-header" style={{ height: currentRowHeight }}>
                      {row + 1}
                      <div className="row-resize" onMouseDown={(e) => startRowResize(row, e)} />
                    </div>
                    {Array.from({ length: COLS }).map((_, col) => (
                      <div 
                        key={col} 
                        className={`cell ${selectedCell?.row === row && selectedCell?.col === col ? 'selected' : ''} ${isCellInRange(row, col) && !(selectedCell?.row === row && selectedCell?.col === col) ? 'in-range' : ''}`}
                        style={{ width: columnWidths[col] || 100, height: currentRowHeight }}
                        onClick={(e) => handleCellClick(row, col, e)}
                        onDoubleClick={() => startEdit(row, col)}
                        onContextMenu={(e) => handleContextMenu(e, row, col)}>
                        {editingCell?.row === row && editingCell?.col === col ? (
                          <input 
                            type="text" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)} 
                            onBlur={finishEdit}
                            onKeyDown={(e) => e.key === 'Enter' && finishEdit()}
                            autoFocus 
                          />
                        ) : (
                          <div className="cell-content">{getCellValue(row, col)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Spreadsheet;