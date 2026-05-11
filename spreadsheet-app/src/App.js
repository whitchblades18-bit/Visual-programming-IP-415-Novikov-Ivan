import React, { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';

const DEFAULT_ROWS = 1000;
const DEFAULT_COLS = 26;
const ROW_HEIGHT = 30;
const VISIBLE_ROWS = 30;

function App() {
  const [data, setData] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectionRange, setSelectionRange] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [columnWidths, setColumnWidths] = useState({});
  const [formulaValue, setFormulaValue] = useState('');
  
  const containerRef = useRef(null);
  const formulaInputRef = useRef(null);

  const getCellValue = (row, col) => {
    const cell = data[`${row},${col}`];
    if (!cell) return '';
    if (cell.computed !== undefined) return cell.computed;
    return cell.raw;
  };

  const getCellRaw = (row, col) => {
    const cell = data[`${row},${col}`];
    return cell ? cell.raw : '';
  };

  const evaluateFormula = (formula, currentData) => {
    const expression = formula.substring(1);
    
    // Функция SUM
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
    
    // Функция AVERAGE
    const avgMatch = expression.match(/AVERAGE\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/i);
    if (avgMatch) {
      const startCol = avgMatch[1].charCodeAt(0) - 65;
      const startRow = parseInt(avgMatch[2]) - 1;
      const endCol = avgMatch[3].charCodeAt(0) - 65;
      const endRow = parseInt(avgMatch[4]) - 1;
      
      let sum = 0;
      let count = 0;
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const val = getCellValue(row, col);
          const num = parseFloat(val);
          if (!isNaN(num)) {
            sum += num;
            count++;
          }
        }
      }
      return count > 0 ? sum / count : 0;
    }
    
    // Простые арифметические операции
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

  const updateCell = (row, col, rawValue) => {
    let computedValue = rawValue;
    
    if (typeof rawValue === 'string' && rawValue.startsWith('=')) {
      try {
        computedValue = evaluateFormula(rawValue, data);
      } catch (e) {
        computedValue = '#ОШИБКА!';
      }
    }
    
    const newData = {
      ...data,
      [`${row},${col}`]: { raw: rawValue, computed: computedValue }
    };
    
    setData(newData);
    
    // Пересчет всех формул
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
  };

  const startEdit = (row, col) => {
    setEditingCell({ row, col });
    const rawValue = getCellRaw(row, col);
    setEditValue(rawValue);
    setFormulaValue(rawValue);
  };

  const finishEdit = () => {
    if (editingCell) {
      updateCell(editingCell.row, editingCell.col, editValue);
      setEditingCell(null);
    }
  };

  // Добавление строки ВЫШЕ текущей
  const addRowAbove = (currentRow) => {
    const newData = {};
    
    Object.keys(data).forEach(key => {
      const [row, col] = key.split(',').map(Number);
      
      if (row < currentRow) {
        newData[key] = data[key];
      } else {
        newData[`${row + 1},${col}`] = data[key];
      }
    });
    
    setData(newData);
    
    if (selectedCell && selectedCell.row >= currentRow) {
      setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col });
      setSelectionRange(null);
    }
  };

  const deleteRow = (row) => {
    const newData = {};
    
    Object.keys(data).forEach(key => {
      const [r, col] = key.split(',').map(Number);
      
      if (r < row) {
        newData[key] = data[key];
      } else if (r > row) {
        newData[`${r - 1},${col}`] = data[key];
      }
    });
    
    setData(newData);
    
    if (selectedCell) {
      if (selectedCell.row === row) {
        setSelectedCell(null);
        setSelectionRange(null);
      } else if (selectedCell.row > row) {
        setSelectedCell({ row: selectedCell.row - 1, col: selectedCell.col });
        setSelectionRange(null);
      }
    }
  };

  const addColumnLeft = (currentCol) => {
    const newData = {};
    
    Object.keys(data).forEach(key => {
      const [row, col] = key.split(',').map(Number);
      
      if (col < currentCol) {
        newData[key] = data[key];
      } else {
        newData[`${row},${col + 1}`] = data[key];
      }
    });
    
    setData(newData);
    
    if (selectedCell && selectedCell.col >= currentCol) {
      setSelectedCell({ row: selectedCell.row, col: selectedCell.col + 1 });
      setSelectionRange(null);
    }
  };

  const deleteColumn = (col) => {
    const newData = {};
    
    Object.keys(data).forEach(key => {
      const [row, c] = key.split(',').map(Number);
      
      if (c < col) {
        newData[key] = data[key];
      } else if (c > col) {
        newData[`${row},${c - 1}`] = data[key];
      }
    });
    
    setData(newData);
    
    if (selectedCell) {
      if (selectedCell.col === col) {
        setSelectedCell(null);
        setSelectionRange(null);
      } else if (selectedCell.col > col) {
        setSelectedCell({ row: selectedCell.row, col: selectedCell.col - 1 });
        setSelectionRange(null);
      }
    }
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
      setColumnWidths(prev => ({ ...prev, [colIndex]: Math.max(50, newWidth) }));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const getVisibleRows = () => {
    const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
    const endIndex = Math.min(startIndex + VISIBLE_ROWS, DEFAULT_ROWS);
    return { startIndex, endIndex };
  };

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
      // Выделение диапазона с Shift
      setSelectionRange({
        start: selectedCell,
        end: { row, col }
      });
    } else {
      // Обычное выделение ячейки
      setSelectedCell({ row, col });
      setSelectionRange(null);
      const rawValue = getCellRaw(row, col);
      setFormulaValue(rawValue);
    }
  };

  const { startIndex, endIndex } = getVisibleRows();
  const visibleRows = [];

  for (let i = startIndex; i < endIndex; i++) {
    visibleRows.push(i);
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingCell) {
        if (e.key === 'Enter') {
          finishEdit();
        } else if (e.key === 'Escape') {
          setEditingCell(null);
        }
      } else if (selectedCell) {
        const { row, col } = selectedCell;
        if (e.key === 'Enter') {
          startEdit(row, col);
        } else if (e.key === 'Delete') {
          updateCell(row, col, '');
          setFormulaValue('');
        } else if (e.key === 'ArrowUp' && row > 0) {
          setSelectedCell({ row: row - 1, col });
          setSelectionRange(null);
          setFormulaValue(getCellRaw(row - 1, col));
        } else if (e.key === 'ArrowDown' && row < DEFAULT_ROWS - 1) {
          setSelectedCell({ row: row + 1, col });
          setSelectionRange(null);
          setFormulaValue(getCellRaw(row + 1, col));
        } else if (e.key === 'ArrowLeft' && col > 0) {
          setSelectedCell({ row, col: col - 1 });
          setSelectionRange(null);
          setFormulaValue(getCellRaw(row, col - 1));
        } else if (e.key === 'ArrowRight' && col < DEFAULT_COLS - 1) {
          setSelectedCell({ row, col: col + 1 });
          setSelectionRange(null);
          setFormulaValue(getCellRaw(row, col + 1));
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingCell, selectedCell]);

  // Обновление панели формул при изменении выбранной ячейки
  useEffect(() => {
    if (selectedCell && !editingCell) {
      const rawValue = getCellRaw(selectedCell.row, selectedCell.col);
      setFormulaValue(rawValue);
    }
  }, [selectedCell, data]);

  const formatDisplay = (value) => {
    if (value === true) return 'TRUE';
    if (value === false) return 'FALSE';
    if (value === undefined || value === null) return '';
    return value;
  };

  return (
    <div className="spreadsheet">
      {/* Панель формул */}
      <div className="formula-bar">
        <div className="formula-label">
          <span className="fx">fx</span>
        </div>
        <input
          ref={formulaInputRef}
          type="text"
          className="formula-input"
          value={formulaValue}
          onChange={(e) => {
            setFormulaValue(e.target.value);
            if (selectedCell && !editingCell) {
              setEditValue(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (selectedCell) {
                updateCell(selectedCell.row, selectedCell.col, formulaValue);
                if (editingCell) {
                  setEditingCell(null);
                }
              }
            }
          }}
          onBlur={() => {
            if (selectedCell && !editingCell) {
              updateCell(selectedCell.row, selectedCell.col, formulaValue);
            }
          }}
          placeholder="Введите значение или формулу..."
        />
      </div>
      
      <div 
        ref={containerRef}
        className="grid-container" 
        onScroll={handleScroll}
      >
        <div className="grid">
          <div className="corner"></div>
          
          <div className="headers-row">
            {Array.from({ length: DEFAULT_COLS }).map((_, i) => (
              <div 
                key={i} 
                className="col-header"
                style={{ width: columnWidths[i] || 100 }}
              >
                {getColumnLabel(i)}
                <div 
                  className="resize-handle"
                  onMouseDown={(e) => startResize(i, e)}
                />
              </div>
            ))}
          </div>
          
          <div style={{ height: `${DEFAULT_ROWS * ROW_HEIGHT}px`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: startIndex * ROW_HEIGHT, width: '100%' }}>
              {visibleRows.map(row => (
                <div key={row} className="row" style={{ height: ROW_HEIGHT }}>
                  <div className="row-header">{row + 1}</div>
                  {Array.from({ length: DEFAULT_COLS }).map((_, col) => {
                    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                    const isInRange = isCellInRange(row, col);
                    const isEditing = editingCell?.row === row && editingCell?.col === col;
                    const value = getCellValue(row, col);
                    
                    return (
                      <div
                        key={col}
                        className={`cell ${isSelected ? 'selected' : ''} ${isInRange && !isSelected ? 'in-range' : ''}`}
                        style={{ width: columnWidths[col] || 100 }}
                        onClick={(e) => handleCellClick(row, col, e)}
                        onDoubleClick={() => startEdit(row, col)}
                        onContextMenu={(e) => handleContextMenu(e, row, col)}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={finishEdit}
                            autoFocus
                          />
                        ) : (
                          <div className="cell-content">{formatDisplay(value)}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;