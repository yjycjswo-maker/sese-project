import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

// GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  useEffect(() => {
    // 1. Lenis 스크롤 엔진 생성
    const lenis = new Lenis({
      duration: 1.2, // 스크롤이 부드럽게 멈추는 시간
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 이징 함수
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    // 2. Lenis 스크롤 시 GSAP ScrollTrigger 업데이트
    lenis.on('scroll', ScrollTrigger.update);

    // 3. GSAP Ticker 프레임 연동 (핵심)
    const updateGsap = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateGsap);
    gsap.ticker.lagSmoothing(0); // 프레임 저하 시 스크롤 밀림 방지

    // 클린업 (컴포넌트 언마운트 시 메모리 정리)
    return () => {
      gsap.ticker.remove(updateGsap);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}