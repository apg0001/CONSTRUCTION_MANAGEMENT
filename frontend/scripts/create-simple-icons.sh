#!/bin/bash
# 간단한 PNG 아이콘 생성 스크립트
# ImageMagick이 설치되어 있어야 합니다

cd "$(dirname "$0")/../public"

echo "PNG 아이콘 생성 중..."

# ImageMagick 확인
if ! command -v convert &> /dev/null; then
    echo "ImageMagick이 설치되어 있지 않습니다."
    echo "설치: sudo apt-get install imagemagick"
    exit 1
fi

# SVG 파일 확인
if [ ! -f "icon.svg" ]; then
    echo "icon.svg 파일을 찾을 수 없습니다."
    exit 1
fi

# PNG 생성
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
convert icon.svg -resize 96x96 icon-96.png

echo "✅ 아이콘 생성 완료!"
echo "생성된 파일:"
ls -lh icon-*.png

