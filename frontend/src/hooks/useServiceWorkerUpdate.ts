import { useEffect } from 'react';
import { toast } from 'sonner';

export function useServiceWorkerUpdate() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Service Worker 등록 감지
      navigator.serviceWorker.ready.then((reg) => {
        // 주기적으로 업데이트 확인 (1분마다)
        const checkForUpdate = () => {
          reg.update();
        };

        const updateInterval = setInterval(checkForUpdate, 60 * 1000);

        // Service Worker 업데이트 감지
        const handleUpdateFound = () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 새 버전이 설치되었고, 현재 활성화된 SW가 있으면 업데이트 가능
                toast.info('새 버전이 사용 가능합니다. 새로고침하여 업데이트하세요.', {
                  duration: 10000,
                  action: {
                    label: '새로고침',
                    onClick: () => {
                      // Service Worker에게 SKIP_WAITING 메시지 전송
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    },
                  },
                });
              }
            });
          }
        };

        reg.addEventListener('updatefound', handleUpdateFound);

        // 초기 업데이트 확인
        checkForUpdate();

        return () => {
          clearInterval(updateInterval);
          reg.removeEventListener('updatefound', handleUpdateFound);
        };
      });

      // Service Worker 컨트롤러 변경 감지 (업데이트 완료)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker 업데이트 완료');
        window.location.reload();
      });
    }
  }, []);
}

