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

  if (!project) {
    return <div className="detail-container">Project not found</div>;
  }

  const originalImages = project.detail?.images || [];
  
  // 무한 스크롤을 위해 배열을 3번 반복 ([복제, 원본, 복제])
  const images = [...originalImages, ...originalImages, ...originalImages];

  // 스크롤 및 무한 루프 처리 + 크기(Scale) 변화
  const handleScroll = () => {
    const container = rightContainerRef.current;
    if (!container || isResetting.current) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const singleSectionHeight = scrollHeight / 3;

    // 1. 무한 스크롤 위치 리셋 (상단 끝이나 하단 끝에 도달했을 때 중앙으로 점프)
    if (scrollTop <= 10) {
      isResetting.current = true;
      container.scrollTop = scrollTop + singleSectionHeight;
      setTimeout(() => { isResetting.current = false; }, 50);
    } else if (scrollTop >= scrollHeight - clientHeight - 10) {
      isResetting.current = true;
      container.scrollTop = scrollTop - singleSectionHeight;
      setTimeout(() => { isResetting.current = false; }, 50);
    }

    // 2. 중앙 이미지 크기(Scale) 및 투명도 계산
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    imageRefs.current.forEach((el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const imageCenter = rect.top + rect.height / 2;
      
      const distance = Math.abs(containerCenter - imageCenter);
      const maxDistance = containerRect.height / 2;
      let progress = 1 - distance / maxDistance;
      progress = Math.max(0, Math.min(1, progress));

      const scale = 0.7 + progress * 0.3; // 중앙 1.1 ~ 주변 0.8
      const opacity = 0.4 + progress * 0.6;

      el.style.transform = `scale(${scale})`;
      el.style.opacity = opacity;
    });
  };

  // 컴포넌트 마운트 시 정확히 중간(원본 섹션)에서 시작하도록 설정
  useEffect(() => {
    const container = rightContainerRef.current;
    if (container && originalImages.length > 0) {
      // 첫 번째 복제본이 끝나는 지점(중간 세션)으로 초기 스크롤 이동
      const singleSectionHeight = container.scrollHeight / 3;
      container.scrollTop = singleSectionHeight;
    }
    handleScroll();
  }, [project]);

  return (
    <div className="detail-container">
      {/* 대괄호는 고정 */}
      <BracketWrapper />

      {/* 좌측 정보 영역 */}
      <div className="detail-left">
        <Link to="/" className="back-btn">Back</Link>
      </div>

      {/* 우측 이미지 영역 (무한 스크롤) */}
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
    </div>
  );
}