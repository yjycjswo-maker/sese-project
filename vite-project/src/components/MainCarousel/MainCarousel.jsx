// MainCarousel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainCarousel.css';
import { ORIGINAL_DATA } from "../data/projectsData";
import BracketWrapper from "../BracketWrapper/BracketWrapper";

// 무한 스크롤용 데이터 5세트 확장 (충분한 관성 버퍼 확보)
const PROJECT_DATA = [
  ...ORIGINAL_DATA,
  ...ORIGINAL_DATA,
  ...ORIGINAL_DATA,
  ...ORIGINAL_DATA,
  ...ORIGINAL_DATA
];

const TOTAL_ORIGINAL = ORIGINAL_DATA.length;
const ITEM_HEIGHT = 175; // 이미지 높이(170px) + gap(5px)
const CENTER_SET_OFFSET = TOTAL_ORIGINAL * 2 * ITEM_HEIGHT; // 정중앙 세트 위치

// 좌측 목록 계산 관련 상수
const LIST_ITEM_HEIGHT = 22; // 목록 한 줄 높이 (px)
const CENTER_ROW_INDEX = 5;  // 0~10 총 11개 줄 중 6번째 줄 (인덱스 5)

export default function MainCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatingId, setAnimatingId] = useState(null); // 대괄호 좁혀지는 애니메이션용 상태
  const navigate = useNavigate();

  // 위치 제어를 위한 Ref
  const targetY = useRef(CENTER_SET_OFFSET);
  const currentY = useRef(CENTER_SET_OFFSET);
  const trackRef = useRef(null);
  const listTrackRef = useRef(null);
  const reqId = useRef(null);

  // 1. Smooth Inertia (관성 감쇠) 애니메이션 루프
  useEffect(() => {
    const updateMotion = () => {
      // Lerp(선형 보간) 공식
      currentY.current += (targetY.current - currentY.current) * 0.08;

      // 중앙 이미지 트랙 이동
      if (trackRef.current) {
        trackRef.current.style.transform = `translateY(${-currentY.current}px)`;
      }

      // 좌측 목록 트랙 이동 (6번째 행 정중앙 맞춤)
      if (listTrackRef.current) {
        const currentItemIndex = currentY.current / ITEM_HEIGHT;
        const listOffsetY = (currentItemIndex - CENTER_ROW_INDEX) * LIST_ITEM_HEIGHT;
        listTrackRef.current.style.transform = `translateY(${-listOffsetY}px)`;
      }

      // 현재 트랙 위치 기반 활성화 인덱스 자동 계산
      const exactIndex = Math.round(currentY.current / ITEM_HEIGHT);
      const realIdx = ((exactIndex % TOTAL_ORIGINAL) + TOTAL_ORIGINAL) % TOTAL_ORIGINAL;
      
      setActiveIndex(realIdx);

      // 무한 루프 구간 가상 워프
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

  // 2. 전역 window 휠 이벤트 처리
  useEffect(() => {
    const handleWheel = (e) => {
      targetY.current += e.deltaY * 0.8;
    };

    window.addEventListener('wheel', handleWheel, { passive: true, capture: true});

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, []);

  const current = ORIGINAL_DATA[activeIndex] || ORIGINAL_DATA[0];

  // 두 자릿수 포맷팅 (01, 02 등)
  const formattedCurrentIndex = String(activeIndex + 1).padStart(2, '0');
  const formattedTotalCount = String(TOTAL_ORIGINAL).padStart(2, '0');

  // 3. 상세페이지 이동 처리 함수 (대괄호 좁혀지는 애니메이션 연동)
  const handleOpenDetail = () => {
    if (current && current.id) {
      setAnimatingId(current.id);
      setTimeout(() => {
        navigate(`/project/${current.id}`);
      }, 400); // CSS 애니메이션 타이밍에 맞춰 이동
    }
  };

  return (
    <section className="main-carousel">
      {/* 1. 좌측 프로젝트 11개 행 고정 목록 */}
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
                  onClick={() => {
                    targetY.current = index * ITEM_HEIGHT;
                  }}
                >
                  {item.title}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* 2. 중앙 고정 레이어 (카테고리, 대괄호, 태그) - 기존 구조 및 BracketWrapper 결합 */}
      <div className={`carousel-center-wrapper ${animatingId ? "squeezed" : ""}`}>
        <div className="info-left">{current.category}</div>
        
        {/* 기존의 대괄호 배치 및 클릭 이벤트 보존 */}
        <span 
          className="bracket left-bracket" 
          onClick={handleOpenDetail} 
          style={{ cursor: "pointer", pointerEvents: "auto" }}
        >
          [
        </span>
        <span 
          className="bracket right-bracket" 
          onClick={handleOpenDetail} 
          style={{ cursor: "pointer", pointerEvents: "auto" }}
        >
          ]
        </span>

        <div className="info-right">{current.tags}</div>
      </div>

      {/* 3. 관성 스크롤 적용 트랙 */}
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
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (isActive) {
                    handleOpenDetail(); // 정중앙 이미지 클릭 시 상세페이지 이동
                  } else {
                    targetY.current = index * ITEM_HEIGHT; // 중앙이 아닌 이미지 클릭 시 해당 위치로 스크롤
                  }
                }}
              >
                <img src={item.image} alt={item.title} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 우측 프로젝트 번호 사이드바 */}
      <aside className="project-number-sidebar">
        <span className="current-num">{formattedCurrentIndex}</span>
        <span className="num-divider">/</span>
        <span className="total-num">{formattedTotalCount}</span>
      </aside>
    </section>
  );
}