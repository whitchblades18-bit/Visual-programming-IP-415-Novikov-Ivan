import React, { useState, useCallback, useRef, useEffect } from 'react';

const ROW_HEIGHT = 30;
const VISIBLE_ROWS = 30;

function Spreadsheet({ document: doc, onSave, onBack }) {
  const [data, setData] = useState(doc.data || {});
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectionRange, setSelectionRange] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [columnWidths, setColumnWidths] = useState({});
  const [rowHeights, setRowHeights] = useState({});
  const [formulaValue, setFormulaValue] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const containerRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const ROWS = doc.rows || 100;
  const COLS = doc.cols || 26;

  const getCellValue = (row, col) => {
    const cell = data[`${row},${col}`];
    if (!cell) return '';
    return cell.computed !== undefined ? cell.computed : cell.raw;
  };

  const getCellRaw = (row, col) => {
    const cell = data[`${row},${col}`];
    return cell ? cell.raw : '';
  };

  const evaluateFormula = (formula, currentData) => {
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
  };

  const triggerAutoSave = useCallback((newData) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onSave(doc.id, newData);
      setSaveStatus('saved');
    }, 500);
  }, [doc.id, onSave]);

  const updateCell = (row, col, rawValue) => {
    let computedValue = rawValue;
    if (typeof rawValue === 'string' && rawValue.startsWith('=')) {
      try {
        computedValue = evaluateFormula(rawValue, data);
      } catch (e) {
        computedValue = '#ОШИБКА!';
      }
    }
    
    const newData = { ...data, [`${row},${col}`]: { raw: rawValue, computed: computedValue } };
    
    const updatedData = { ...newData };
    Object.keys(updatedData).forEach(key => {
      const cell = updatedData[key];
      if (cell.raw && cell.raw.startsWith('=')) {
        try {
          cell.computed = evaluateFormula(cell.raw, updatedData);
        } catch (e) {
          cell.computed = '#ОШИБКА!';
        }
      }
    });
    
    setData(updatedData);
    triggerAutoSave(updatedData);
  };

  const startEdit = (row, col) => {
    setEditingCell({ row, col });
    setEditValue(getCellRaw(row, col));
    setFormulaValue(getCellRaw(row, col));
  };

  const finishEdit = () => {
    if (editingCell) {
      updateCell(editingCell.row, editingCell.col, editValue);
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
    setData(newData);
    triggerAutoSave(newData);
    if (selectedCell && selectedCell.row >= currentRow) {
      setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col });
    }
  };

  const deleteRow = (row) => {
    const newData = {};
    Object.keys(data).forEach(key => {
      const [r, col] = key.split(',').map(Number);
      if (r < row) newData[key] = data[key];
      else if (r > row) newData[`${r - 1},${col}`] = data[key];
    });
    setData(newData);
    triggerAutoSave(newData);
    if (selectedCell?.row === row) setSelectedCell(null);
    else if (selectedCell?.row > row) setSelectedCell({ row: selectedCell.row - 1, col: selectedCell.col });
  };

  const addColumnLeft = (currentCol) => {
    const newData = {};
    Object.keys(data).forEach(key => {
      const [row, col] = key.split(',').map(Number);
      if (col < currentCol) newData[key] = data[key];
      else newData[`${row},${col + 1}`] = data[key];
    });
    setData(newData);
    triggerAutoSave(newData);
    if (selectedCell && selectedCell.col >= currentCol) {
      setSelectedCell({ row: selectedCell.row, col: selectedCell.col + 1 });
    }
  };

  const deleteColumn = (col) => {
    const newData = {};
    Object.keys(data).forEach(key => {
      const [row, c] = key.split(',').map(Number);
      if (c < col) newData[key] = data[key];
      else if (c > col) newData[`${row},${c - 1}`] = data[key];
    });
    setData(newData);
    triggerAutoSave(newData);
    if (selectedCell?.col === col) setSelectedCell(null);
    else if (selectedCell?.col > col) setSelectedCell({ row: selectedCell.row, col: selectedCell.col - 1 });
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
    link.download = `${doc.name}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportToJSON = () => {
    const exportData = { name: doc.name, rows: ROWS, cols: COLS, data: data };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${doc.name}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
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
      setData(newData);
      triggerAutoSave(newData);
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  const handleContextMenu = (e, row, col) => {
    e.preventDefault();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <div class="menu-item" data-action="add-row">➕ Добавить строку выше</div>
      <div class="menu-item" data-action="delete-row">❌ Удалить строку</div>
      <hr/>
      <div class="menu-item" data-action="add-col">➕ Добавить столбец левее</div>
      <div class="menu-item" data-action="delete-col">❌ Удалить столбец</div>
    `;
    menu.style.position = 'fixed';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    
    const handleClick = (e) => {
      const action = e.target.dataset.action;
      if (action === 'add-row') addRowAbove(row);
      if (action === 'delete-row') deleteRow(row);
      if (action === 'add-col') addColumnLeft(col);
      if (action === 'delete-col') deleteColumn(col);
      document.body.removeChild(menu);
    };
    menu.addEventListener('click', handleClick);
    document.body.appendChild(menu);
    setTimeout(() => document.addEventListener('click', () => menu.remove()), 0);
  };

  const startResize = (colIndex, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[colIndex] || 100;
    const handleMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      setColumnWidths(prev => ({ ...prev, [colIndex]: Math.max(50, newWidth) }));
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
      setRowHeights(prev => ({ ...prev, [rowIndex]: Math.max(25, newHeight) }));
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
      setSelectionRange({ start: selectedCell, end: { row, col } });
    } else {
      setSelectedCell({ row, col });
      setSelectionRange(null);
      setFormulaValue(getCellRaw(row, col));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        onSave(doc.id, data);
        setSaveStatus('saved');
      } else if (editingCell) {
        if (e.key === 'Enter') finishEdit();
        else if (e.key === 'Escape') setEditingCell(null);
      } else if (selectedCell) {
        const { row, col } = selectedCell;
        if (e.key === 'Enter') startEdit(row, col);
        else if (e.key === 'Delete') updateCell(row, col, '');
        else if (e.key === 'ArrowUp' && row > 0) setSelectedCell({ row: row - 1, col });
        else if (e.key === 'ArrowDown' && row < ROWS - 1) setSelectedCell({ row: row + 1, col });
        else if (e.key === 'ArrowLeft' && col > 0) setSelectedCell({ row, col: col - 1 });
        else if (e.key === 'ArrowRight' && col < COLS - 1) setSelectedCell({ row, col: col + 1 });
      }
    };
    
    const handleBeforeUnload = (e) => {
      if (saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editingCell, selectedCell, saveStatus, doc.id, data, onSave]);

  useEffect(() => {
    if (selectedCell && !editingCell) {
      setFormulaValue(getCellRaw(selectedCell.row, selectedCell.col));
    }
  }, [selectedCell, data]);

  const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  const endIndex = Math.min(startIndex + VISIBLE_ROWS, ROWS);
  const visibleRows = [];
  for (let i = startIndex; i < endIndex; i++) visibleRows.push(i);

  return (
    <div className="spreadsheet">
      <div className="formula-bar">
        <div className="formula-label"><span className="fx">fx</span></div>
        <input type="text" className="formula-input" value={formulaValue} onChange={(e) => {
          setFormulaValue(e.target.value);
          if (selectedCell && !editingCell) setEditValue(e.target.value);
        }} onKeyDown={(e) => { if (e.key === 'Enter' && selectedCell) updateCell(selectedCell.row, selectedCell.col, formulaValue); }} 
        onBlur={() => { if (selectedCell && !editingCell) updateCell(selectedCell.row, selectedCell.col, formulaValue); }}
        placeholder="Введите значение или формулу..." />
        
        <div className="toolbar-buttons">
          <span className={`save-indicator ${saveStatus}`}>
            {saveStatus === 'saved' && '✓ Сохранено'}
            {saveStatus === 'saving' && '⟳ Сохранение...'}
          </span>
          <button className="toolbar-btn" onClick={() => setShowExportMenu(!showExportMenu)}>Экспорт</button>
          <button className="back-btn" onClick={onBack}>← Назад</button>
        </div>
        
        {showExportMenu && (
          <div className="export-menu">
            <button onClick={exportToCSV}>Экспорт CSV</button>
            <button onClick={exportToJSON}>Экспорт JSON</button>
            <label>Импорт CSV<input type="file" accept=".csv" onChange={importCSV} style={{ display: 'none' }} /></label>
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
                      <div key={col} className={`cell ${selectedCell?.row === row && selectedCell?.col === col ? 'selected' : ''} ${isCellInRange(row, col) && !(selectedCell?.row === row && selectedCell?.col === col) ? 'in-range' : ''}`}
                        style={{ width: columnWidths[col] || 100, height: currentRowHeight }}
                        onClick={(e) => handleCellClick(row, col, e)}
                        onDoubleClick={() => startEdit(row, col)}
                        onContextMenu={(e) => handleContextMenu(e, row, col)}>
                        {editingCell?.row === row && editingCell?.col === col ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={finishEdit} autoFocus />
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