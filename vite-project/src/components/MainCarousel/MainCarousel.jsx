import React, { useState, useEffect, useRef } from 'react';
import './MainCarousel.css';
import { ORIGINAL_DATA } from "../data/projectsData";

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

  // 2. [수정] 전역 window 휠 이벤트 처리 (상단 배너 등 어디서나 스크롤 가능)
  useEffect(() => {
    const handleWheel = (e) => {
      targetY.current += e.deltaY * 0.8;
    };

    // window 객체에 휠 리스너 등록
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const current = ORIGINAL_DATA[activeIndex] || ORIGINAL_DATA[0];

  // 두 자릿수 포맷팅 (01, 02 등)
  const formattedCurrentIndex = String(activeIndex + 1).padStart(2, '0');
  const formattedTotalCount = String(TOTAL_ORIGINAL).padStart(2, '0');

  return (
    // [수정] section 태그의 onWheel 제거
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

      {/* 2. 중앙 고정 레이어 (카테고리, 대괄호, 태그) */}
      <div className="carousel-center-wrapper">
        <div className="info-left">{current.category}</div>
        <span className="bracket left-bracket">[</span>
        <span className="bracket right-bracket">]</span>
        <div className="info-right">{current.tags}</div>
      </div>

      {/* 3. 관성 스크롤 적용 트랙 */}
      <div className="image-track-wrapper">
        <div className="image-track" ref={trackRef}>
          {PROJECT_DATA.map((item, index) => {
            const itemOffset = index * ITEM_HEIGHT;
            const distance = Math.abs(currentY.current - itemOffset);
            const isActive = distance < ITEM_HEIGHT * 0.5;

            return (
              <div 
                key={`${item.id}-${index}`} 
                className={`carousel-image-box ${isActive ? "active" : ""}`}
                /* [수정] 이미지 클릭 시 해당 위치로 부드럽게 이동 */
                onClick={() => {
                  targetY.current = index * ITEM_HEIGHT;
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