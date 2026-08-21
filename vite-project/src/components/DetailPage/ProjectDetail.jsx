import React, { useRef, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ORIGINAL_DATA } from "../data/projectsData";
import BracketWrapper from "../BracketWrapper/BracketWrapper";
import "./ProjectDetail.css";

export default function ProjectDetail() {
  const { id } = useParams();
  const project = ORIGINAL_DATA.find((item) => String(item.id) === String(id));

  const rightContainerRef = useRef(null);
  const imageRefs = useRef([]);
  const isResetting = useRef(false);

  // 현재 화면 중앙에 위치한 이미지의 인덱스 상태 (0부터 시작)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!project) {
    return <div className="detail-container">Project not found</div>;
  }

  const originalImages = project.detail?.images || [];
  const totalImagesCount = originalImages.length;
  
  // 무한 스크롤을 위해 3번 반복한 배열
  const images = [...originalImages, ...originalImages, ...originalImages];

  const handleScroll = () => {
    const container = rightContainerRef.current;
    if (!container || isResetting.current) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const singleSectionHeight = scrollHeight / 3;

    // 1. 무한 스크롤 위치 리셋 (점프)
    if (scrollTop <= 10) {
      isResetting.current = true;
      container.scrollTop = scrollTop + singleSectionHeight;
      setTimeout(() => { isResetting.current = false; }, 50);
    } else if (scrollTop >= scrollHeight - clientHeight - 10) {
      isResetting.current = true;
      container.scrollTop = scrollTop - singleSectionHeight;
      setTimeout(() => { isResetting.current = false; }, 50);
    }

    // 2. 중앙 이미지 크기(Scale) 및 투명도 계산 + 가장 중앙에 가까운 이미지 찾기
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    imageRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const imageCenter = rect.top + rect.height / 2;
      
      const distance = Math.abs(containerCenter - imageCenter);

      // 가장 중앙에 가까운 이미지 추적
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx % totalImagesCount; // 원본 배열 기준 인덱스로 변환
      }

      const maxDistance = containerRect.height / 2;
      let progress = 1 - distance / maxDistance;
      progress = Math.max(0, Math.min(1, progress));

      const scale = 0.7 + progress * 0.3;
      const opacity = 0.4 + progress * 0.6;

      el.style.transform = `scale(${scale})`;
      el.style.opacity = opacity;
    });

    // 현재 중앙에 있는 이미지 번호 업데이트
    setCurrentImageIndex(closestIndex);
  };

  useEffect(() => {
    const container = rightContainerRef.current;
    if (container && originalImages.length > 0) {
      const singleSectionHeight = container.scrollHeight / 3;
      container.scrollTop = singleSectionHeight;
    }
    handleScroll();
  }, [project]);

  // 포맷팅 (01, 02 등)
  const formattedCurrentIndex = String(currentImageIndex + 1).padStart(2, '0');
  const formattedTotalCount = String(totalImagesCount).padStart(2, '0');

  return (
    <div className="detail-container">
      {/* 중앙 고정 괄호 */}
      <BracketWrapper className="detail-bracket-fixed" />

      {/* 좌측 정보 영역 */}
      <div className="detail-left">
        <Link to="/" className="back-btn">Back</Link>
      </div>

      {/* 우측 세로 무한 스크롤 이미지 영역 */}
      <div 
        ref={rightContainerRef}
        className="detail-right slide-in-from-right"
        onScroll={handleScroll}
      >
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="image-wrapper"
            ref={(el) => (imageRefs.current[idx] = el)}
          >
            <img src={img} alt={`detail-${idx}`} />
          </div>
        ))}
      </div>

      {/* 우측 하단: 스크롤에 따라 실시간으로 바뀌는 이미지 순번 */}
      <aside className="project-number-sidebar">
        <span className="current-num">{formattedCurrentIndex}</span>
        <span className="num-divider">/</span>
        <span className="total-num">{formattedTotalCount}</span>
      </aside>
    </div>
  );
}