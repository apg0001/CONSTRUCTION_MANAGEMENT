// Node.js 스크립트로 PNG 아이콘 생성
// 사용법: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Canvas를 사용하려면 node-canvas가 필요하지만,
// 간단하게 SVG를 기반으로 안내만 제공

console.log(`
PWA 아이콘 생성 가이드
====================

다음 방법 중 하나를 사용하여 PNG 아이콘을 생성하세요:

1. 온라인 도구 사용 (가장 쉬움):
   - https://www.pwabuilder.com/imageGenerator
   - icon.svg 파일 업로드
   - 생성된 파일을 frontend/public/에 저장

2. ImageMagick 사용:
   sudo apt-get install imagemagick
   cd frontend/public
   convert icon.svg -resize 192x192 icon-192.png
   convert icon.svg -resize 512x512 icon-512.png
   convert icon.svg -resize 96x96 icon-96.png

3. 브라우저에서 generate-icons.html 열기:
   - frontend/public/generate-icons.html 파일을 브라우저에서 열기
   - 자동으로 아이콘 다운로드됨

필요한 파일:
- icon-192.png (192x192 픽셀)
- icon-512.png (512x512 픽셀)
- icon-96.png (96x96 픽셀)

생성 후 frontend/public/ 폴더에 저장하세요.
`);

