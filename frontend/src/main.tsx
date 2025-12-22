import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Service Worker 등록 확인
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // vite-plugin-pwa가 자동으로 등록하지만, 확인용 로그
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        console.log('✅ Service Worker 등록됨:', registrations.length, '개');
      } else {
        console.log('ℹ️ Service Worker 대기 중... (빌드 후 자동 등록)');
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
