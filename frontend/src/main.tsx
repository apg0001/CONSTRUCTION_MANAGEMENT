import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Service Worker 등록 및 업데이트 감지
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.ready.then((registration) => {
      console.log('✅ Service Worker 등록됨');

      // 주기적으로 업데이트 확인 (1분마다)
      setInterval(() => {
        registration.update();
      }, 60 * 1000);

      // Service Worker 업데이트 감지
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 새 버전이 설치되었고, 현재 활성화된 SW가 있으면 업데이트 가능
              console.log('🔄 새 버전 사용 가능 - 페이지 새로고침 필요');
              // 사용자에게 알림 (App.tsx에서 처리)
            }
          });
        }
      });

      // 초기 업데이트 확인
      registration.update();
    });

    // Service Worker 컨트롤러 변경 감지 (업데이트 완료)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker 업데이트 완료 - 페이지 새로고침');
      window.location.reload();
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
