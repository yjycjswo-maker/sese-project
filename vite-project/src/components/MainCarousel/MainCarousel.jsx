import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainCarousel.css';
import { ORIGINAL_DATA } from "../data/projectsData";
import BracketWrapper from "../BracketWrapper/BracketWrapper";

const PROJECT_DATA = [
  ...ORIGINAL_DATA,
  ...ORIGINAL_DATA,
  ...ORIGINAL_DATA,
  ...ORIGINAL_DATA,
  ...ORIGINAL_DATA
];

const TOTAL_ORIGINAL = ORIGINAL_DATA.length;
const ITEM_HEIGHT = 175;
const LIST_ITEM_HEIGHT = 22;
const CENTER_ROW_INDEX = 5;

export default function MainCarousel() {
  const navigate = useNavigate();
  const [animatingId, setAnimatingId] = useState(null);

  // 1. 이전 위치 기억 복원 (저장된 인덱스가 있으면 해당 위치, 없으면 1번 위치)
  const getInitialY = () => {
    const savedIndex = sessionStorage.getItem("last_active_index");
    if (savedIndex !== null) {
      const idx = parseInt(savedIndex, 10);
      if (!isNaN(idx) && idx >= 0 && idx < TOTAL_ORIGINAL) {
        return (TOTAL_ORIGINAL * 2 + idx) * ITEM_HEIGHT;
      }
    }
    return TOTAL_ORIGINAL * 2 * ITEM_HEIGHT; // 기본값 (1번 프로젝트)
  };

  const initialY = getInitialY();
  const targetY = useRef(initialY);
  const currentY = useRef(initialY);

  // 초기 activeIndex 설정
  const initialIdx = Math.round(initialY / ITEM_HEIGHT) % TOTAL_ORIGINAL;
  const [activeIndex, setActiveIndex] = useState(
    ((initialIdx % TOTAL_ORIGINAL) + TOTAL_ORIGINAL) % TOTAL_ORIGINAL
  );

  const trackRef = useRef(null);
  const listTrackRef = useRef(null);
  const reqId = useRef(null);

  useEffect(() => {
    const updateMotion = () => {
      currentY.current += (targetY.current - currentY.current) * 0.08;

      if (trackRef.current) {
        trackRef.current.style.transform = `translateY(${-currentY.current}px)`;
      }

      if (listTrackRef.current) {
        const currentItemIndex = currentY.current / ITEM_HEIGHT;
        const listOffsetY = (currentItemIndex - CENTER_ROW_INDEX) * LIST_ITEM_HEIGHT;
        listTrackRef.current.style.transform = `translateY(${-listOffsetY}px)`;
      }

      const exactIndex = Math.round(currentY.current / ITEM_HEIGHT);
      const realIdx = ((exactIndex % TOTAL_ORIGINAL) + TOTAL_ORIGINAL) % TOTAL_ORIGINAL;
      
      setActiveIndex(realIdx);
      
      // 메인에서 스크롤할 때마다 현재 활성화된 인덱스를 브라우저에 저장
      sessionStorage.setItem("last_active_index", realIdx);

      const minBound = ITEM_HEIGHT * TOTAL_ORIGINAL;
      const maxBound = ITEM_HEIGHT * TOTAL_ORIGINAL * 3;

      if (targetY.current < minBound) {
        targetY.current += ITEM_HEIGHT * TOTAL_ORIGINAL;
        currentY.current += ITEM_HEIGHT * TOTAL_ORIGINAL;
      } else if (targetY.current > maxBound) {
        targetY.current -= ITEM_HEIGHT * TOTAL_ORIGINAL;
        currentY.current -= ITEM_HEIGHT * TOTAL_ORIGINAL;
      }

      reqId.current = requestAnimationFrame(updateMotion);
    };

    reqId.current = requestAnimationFrame(updateMotion);
    return () => cancelAnimationFrame(reqId.current);
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      targetY.current += e.deltaY * 0.8;
    };
    window.addEventListener('wheel', handleWheel, { passive: true, capture: true });
    return () => window.removeEventListener('wheel', handleWheel, { capture: true });
  }, []);

  const current = ORIGINAL_DATA[activeIndex] || ORIGINAL_DATA[0];
  const formattedCurrentIndex = String(activeIndex + 1).padStart(2, '0');
  const formattedTotalCount = String(TOTAL_ORIGINAL).padStart(2, '0');

  const handleOpenDetail = () => {
    if (current && current.id) {
      sessionStorage.setItem("last_active_index", activeIndex);
      setAnimatingId(current.id);
      setTimeout(() => {
        navigate(`/project/${current.id}`);
      }, 400);
    }
  };

  return (
    <section className="main-carousel">
      {/* 1. 좌측 프로젝트 목록 */}
      <aside className="project-list-sidebar">
        <div className="project-list-viewport">
          <ul className="project-list-track" ref={listTrackRef}>
            {PROJECT_DATA.map((item, index) => {
              const exactIndex = Math.round(currentY.current / ITEM_HEIGHT);
              const isActive = index === exactIndex;
              return (
                <li 
                  key={`${item.id}-${index}`} 
                  className={`project-item ${isActive ? "active" : ""}`}
                  onClick={() => { targetY.current = index * ITEM_HEIGHT; }}
                >
                  {item.title}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* 2. 중앙 대괄호 컴포넌트 */}
      <BracketWrapper 
        className={`carousel-center-wrapper ${animatingId ? "squeezed" : ""}`}
        leftContent={current.category}
        rightContent={current.tags}
        onBracketClick={handleOpenDetail}
      />

      {/* 3. 이미지 트랙 */}
      <div className="image-track-wrapper">
        <div className="image-track" ref={trackRef}>
          {PROJECT_DATA.map((item, index) => {
            const itemOffset = index * ITEM_HEIGHT;
            const distance = Math.abs(currentY.current - itemOffset);
            const isActive = distance < ITEM_HEIGHT * 0.5;
            const isTarget = animatingId === item.id;

            return (
              <div 
                key={`${item.id}-${index}`} 
                className={`carousel-image-box ${isActive ? "active" : ""} ${isTarget ? "animating" : ""}`}
                onClick={() => {
                  if (isActive) handleOpenDetail();
                  else targetY.current = index * ITEM_HEIGHT;
                }}
              >
                <img src={item.image} alt={item.title} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 우측 번호 사이드바 */}
      <aside className="project-number-sidebar">
        <span className="current-num">{formattedCurrentIndex}</span>
        <span className="num-divider">/</span>
        <span className="total-num">{formattedTotalCount}</span>
      </aside>
    </section>
  );
}