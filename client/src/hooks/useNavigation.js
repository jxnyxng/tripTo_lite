import { useState, useEffect } from 'react';

const useNavigation = () => {
  const [currentPage, setCurrentPage] = useState('main'); // 항상 'main'으로 시작

  // 강제로 메인 페이지 유지
  useEffect(() => {
    console.log('강제로 메인 페이지 설정');
    setCurrentPage('main');
    window.history.replaceState({ page: 'main' }, '', '/');
  }, []);

  // 페이지 변경 시 스크롤을 상단으로 이동
  useEffect(() => {
    console.log('현재 페이지 상태:', currentPage);
    window.scrollTo(0, 0);
  }, [currentPage]);

  // 디버깅용 - currentPage 상태 변화 추적
  useEffect(() => {
    console.log('Current page changed to:', currentPage);
  }, [currentPage]);

  const navigateTo = (page, url) => {
    setCurrentPage(page);
    window.history.pushState({ page }, '', url);
    window.scrollTo(0, 0);
  };

  const setupBrowserNavigation = (recommendation, savedRecommendation, setSavedRecommendation, setRecommendation) => {
    // 일시적으로 비활성화 - 메인 페이지 강제 유지
    console.log('setupBrowserNavigation 비활성화됨');
    return () => {}; // 빈 cleanup 함수 반환
  };

  return {
    currentPage,
    setCurrentPage,
    navigateTo,
    setupBrowserNavigation
  };
};

export default useNavigation;
