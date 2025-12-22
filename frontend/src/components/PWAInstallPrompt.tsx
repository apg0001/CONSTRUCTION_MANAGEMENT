import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if app was previously installed
    if (localStorage.getItem('pwa-installed') === 'true') {
      setIsInstalled(true);
      return;
    }

    // For iOS, show manual install instructions
    if (iOS) {
      // iOS doesn't support beforeinstallprompt, show manual instructions
      const hasShownIOSPrompt = sessionStorage.getItem('ios-install-shown');
      if (!hasShownIOSPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
          sessionStorage.setItem('ios-install-shown', 'true');
        }, 3000); // Show after 3 seconds
      }
      return;
    }

    // For other browsers, listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS manual install instructions
      alert('iOS에서 설치하려면:\n1. Safari 메뉴(□↑) 클릭\n2. "홈 화면에 추가" 선택\n3. "추가" 클릭');
      setShowPrompt(false);
      return;
    }

    if (!deferredPrompt) {
      // Fallback: try to open install dialog manually
      if ('serviceWorker' in navigator) {
        alert('앱을 설치하려면 브라우저 주소창의 설치 아이콘을 클릭하세요.');
      }
      setShowPrompt(false);
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Install error:', error);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed') === 'true') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">앱 설치</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {isIOS 
            ? '홈 화면에 추가하여 앱처럼 사용하세요'
            : '홈 화면에 추가하여 더 빠르게 접근하세요'}
        </CardDescription>
        <Button onClick={handleInstall} className="w-full" size="sm">
          <Download className="mr-2 h-4 w-4" />
          {isIOS ? '설치 방법 보기' : '설치하기'}
        </Button>
      </CardContent>
    </Card>
  );
}

