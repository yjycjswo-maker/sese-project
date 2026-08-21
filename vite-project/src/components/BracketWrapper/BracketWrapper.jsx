import React from 'react';
import './BracketWrapper.css';

export default function BracketWrapper({ leftContent, rightContent, onBracketClick, className = '' }) {
  return (
    <div className={`bracket-container ${className}`}>
      {leftContent && <div className="info-left">{leftContent}</div>}
      <span 
        className="bracket left-bracket" 
        onClick={onBracketClick}
        style={{ cursor: onBracketClick ? 'pointer' : 'default', pointerEvents: 'auto' }}
      >
        [
      </span>
      <span 
        className="bracket right-bracket" 
        onClick={onBracketClick}
        style={{ cursor: onBracketClick ? 'pointer' : 'default', pointerEvents: 'auto' }}
      >
        ]
      </span>
      {rightContent && <div className="info-right">{rightContent}</div>}
    </div>
  );
}