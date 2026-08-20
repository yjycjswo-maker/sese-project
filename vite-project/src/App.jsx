import React from 'react';
import Header from './components/Header/Header';
import MainCarousel from './components/MainCarousel/MainCarousel';
import SmoothScroll from './components/SmoothScroll/SmoothScroll';

export default function App() {
  return (
    <SmoothScroll>
      <div className="app-container">
        <Header />
        <MainCarousel />
      </div>
    </SmoothScroll>
  );
}