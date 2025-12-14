import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Service Worker는 vite-plugin-pwa가 자동으로 등록합니다
// 별도 등록 코드 불필요

createRoot(document.getElementById('root')!).render(<App />);
