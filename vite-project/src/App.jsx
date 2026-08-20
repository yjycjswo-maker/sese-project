import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import MainCarousel from "./components/MainCarousel/MainCarousel";
import ProjectDetail from "./components/DetailPage/ProjectDetail";

export default function App() {
  return (
    <>
      <Header />

      {/* 라우팅 구역 */}
      <Routes>
        <Route path="/" element={<MainCarousel />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
      </Routes>
    </>
  );
}