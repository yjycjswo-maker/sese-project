import React, { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ORIGINAL_DATA } from "../data/projectsData";
import "./ProjectDetail.css";

export default function ProjectDetail() {
  const { id } = useParams();

  // URL의 id값과 일치하는 실제 프로젝트 찾기
  const project = ORIGINAL_DATA.find((item) => String(item.id) === String(id)) || ORIGINAL_DATA[0];

  // 이미지 배열 가져오기 (project.images 또는 project.detail?.images 모두 대응 가능하도록 안전하게 처리)
  const rawImages = project.images || project.detail?.images || [];
  const TOTAL_ORIGINAL = rawImages.length;

  // 무한 스크롤을 위해 데이터를 5세트로 확장
  const INFINITE_IMAGES = [
    ...rawImages,
    ...rawImages,
    ...rawImages,
    ...rawImages,
    ...rawImages,
  ];

  const containerRef = useRef(null);
  const isWarping = useRef(false);

  // 컴포넌트 마운트 시 정중앙 세트(3번째 세트) 위치로 스크롤 초기화
  useEffect(() => {
    if (containerRef.current && TOTAL_ORIGINAL > 0) {
      const singleSetHeight = containerRef.current.scrollHeight / 5;
      containerRef.current.scrollTop = singleSetHeight * 2;
    }
  }, [id, TOTAL_ORIGINAL]);

  // 스크롤 무한 루프 위치 보정 핸들러
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || TOTAL_ORIGINAL === 0 || isWarping.current) return;

    const singleSetHeight = el.scrollHeight / 5;
    const currentScrollTop = el.scrollTop;

    // 상단 경계 도달 시 중간 지점으로 점프
    if (currentScrollTop < singleSetHeight) {
      isWarping.current = true;
      el.scrollTop = currentScrollTop + singleSetHeight * 2;
      setTimeout(() => { isWarping.current = false; }, 50);
    } 
    // 하단 경계 도달 시 중간 지점으로 점프
    else if (currentScrollTop > singleSetHeight * 3) {
      isWarping.current = true;
      el.scrollTop = currentScrollTop - singleSetHeight * 2;
      setTimeout(() => { isWarping.current = false; }, 50);
    }
  };

  return (
    <div className="detail-container">
      {/* 좌측 고정 텍스트 정보 영역 */}
      <div className="detail-left">
        <div className="detail-info">
          <h2>{project.title}</h2>
          <p className="category">{project.category}</p>
          {project.link && (
            <a href={project.link} target="_blank" rel="noreferrer" className="live-link">
              Live Website
            </a>
          )}
        </div>
        <Link to="/" className="back-btn">Back</Link>
      </div>

      {/* 우측 세로 무한 스크롤 이미지 목록 영역 */}
      <div className="detail-right" ref={containerRef} onScroll={handleScroll}>
        {INFINITE_IMAGES.map((imgSrc, idx) => (
          <div key={idx} className="image-wrapper">
            <img src={imgSrc} alt={`${project.title} ${idx + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}