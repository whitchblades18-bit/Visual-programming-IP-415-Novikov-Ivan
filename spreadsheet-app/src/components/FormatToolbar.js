import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateRangeStyles } from '../store/slices/spreadsheetSlice';
import './FormatToolbar.css';

function FormatToolbar() {
  const dispatch = useDispatch();
  const { selectedCell, selectionRange, styles } = useSelector((state) => state.spreadsheet);
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerType, setColorPickerType] = useState('text');
  
  const getCurrentCellStyle = () => {
    if (!selectedCell) return {};
    const key = `${selectedCell.row},${selectedCell.col}`;
    return styles[key] || {};
  };
  
  const currentStyle = getCurrentCellStyle();
  
  const getActiveRange = () => {
    if (selectionRange) {
      return selectionRange;
    } else if (selectedCell) {
      return { start: selectedCell, end: selectedCell };
    }
    return null;
  };
  
  const applyStyle = (styleKey, styleValue) => {
    const range = getActiveRange();
    if (range) {
      dispatch(updateRangeStyles({
        range,
        styles: { [styleKey]: styleValue }
      }));
    }
  };
  
  const toggleStyle = (styleKey, activeValue) => {
    const current = currentStyle[styleKey];
    applyStyle(styleKey, current === activeValue ? null : activeValue);
  };
  
  const handleColorChange = (color, type) => {
    applyStyle(type === 'text' ? 'textColor' : 'backgroundColor', color);
    setShowColorPicker(false);
  };
  
  const handleFormatChange = (format) => {
    applyStyle('format', format);
  };
  
  return (
    <div className="format-toolbar">
      <div className="toolbar-group">
        <button
          className={`toolbar-icon ${currentStyle.bold === true ? 'active' : ''}`}
          onClick={() => toggleStyle('bold', true)}
          title="Жирный (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          className={`toolbar-icon ${currentStyle.italic === true ? 'active' : ''}`}
          onClick={() => toggleStyle('italic', true)}
          title="Курсив (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          className={`toolbar-icon ${currentStyle.underline === true ? 'active' : ''}`}
          onClick={() => toggleStyle('underline', true)}
          title="Подчёркивание (Ctrl+U)"
        >
          <u>U</u>
        </button>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <button
          className={`toolbar-icon ${currentStyle.format === 'percent' ? 'active' : ''}`}
          onClick={() => handleFormatChange(currentStyle.format === 'percent' ? null : 'percent')}
          title="Процент"
        >
          %
        </button>
        <button
          className={`toolbar-icon ${currentStyle.format === 'currency' ? 'active' : ''}`}
          onClick={() => handleFormatChange(currentStyle.format === 'currency' ? null : 'currency')}
          title="Валюта"
        >
          $
        </button>
        <button
          className={`toolbar-icon ${currentStyle.format === 'date' ? 'active' : ''}`}
          onClick={() => handleFormatChange(currentStyle.format === 'date' ? null : 'date')}
          title="Дата"
        >
          📅
        </button>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <button
          className="toolbar-icon"
          onClick={() => {
            setColorPickerType('text');
            setShowColorPicker(!showColorPicker);
          }}
          title="Цвет текста"
          style={{ color: currentStyle.textColor || '#000' }}
        >
          A
        </button>
        <button
          className="toolbar-icon"
          onClick={() => {
            setColorPickerType('background');
            setShowColorPicker(!showColorPicker);
          }}
          title="Цвет фона"
          style={{ background: currentStyle.backgroundColor || '#fff', border: '1px solid #ddd' }}
        >
          🎨
        </button>
      </div>
      
      {showColorPicker && (
        <div className="color-picker-popup">
          <div className="color-grid">
            {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF',
              '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#95A5A6'].map(color => (
              <div
                key={color}
                className="color-option"
                style={{ backgroundColor: color, width: '30px', height: '30px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                onClick={() => handleColorChange(color, colorPickerType)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FormatToolbar;