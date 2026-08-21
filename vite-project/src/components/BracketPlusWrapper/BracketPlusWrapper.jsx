import React from 'react';
import './BracketPlusWrapper.css'; // 이 줄이 있어야 CSS가 적용됩니다!

export default function BracketPlusWrapper() {
  return (
    <div className="bracket-fixed-container">
      <span className="bracket left-bracket">[</span>
      <span className="bracket center-plus">+</span>
      <span className="bracket right-bracket">]</span>
    </div>
  );
}