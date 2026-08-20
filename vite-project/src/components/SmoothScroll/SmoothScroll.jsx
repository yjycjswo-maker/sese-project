import React, { useEffect } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis'; // 최신 패키지명 적용

export default function SmoothScroll({ children }) {
  useEffect(() => {
    // 1. Lenis 스크롤 엔진 생성
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    // 2. GSAP Ticker 프레임 연동
    const updateGsap = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateGsap);
    gsap.ticker.lagSmoothing(0);

    // 클린업
    return () => {
      gsap.ticker.remove(updateGsap);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}