import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <a href="/">SeSe </a>
      </div>
      <nav className="header-nav">
        <ul>
          <li><a href="#work">Work</a></li>
          <li><a href="#about">About</a></li>
        </ul>
      </nav>
    </header>
  );
}