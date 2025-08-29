import { useState, useEffect } from 'react';

const useNavigation = () => {
  const [currentPage, setCurrentPage] = useState('main'); // 항상 'main'으로 시작

  // 페이지가 새로고침되거나 mount될 때 현재 URL에 따라 페이지 상태를 복원
  useEffect(() => {
    const page = window.location.pathname === '/result' ? 'result' : 'main';
    setCurrentPage(page);
    window.history.replaceState({ page }, '', window.location.pathname);
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
    // 브라우저 뒤로가기/앞으로가기 시 추천 결과 복원
    const onPopState = (event) => {
      const state = event.state;
      if (state && state.page === 'result' && savedRecommendation) {
        setRecommendation(savedRecommendation);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  };

  return {
    currentPage,
    setCurrentPage,
    navigateTo,
    setupBrowserNavigation
  };
};

export default useNavigation;
