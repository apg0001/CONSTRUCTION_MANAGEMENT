#!/usr/bin/env python3
"""
PWA 아이콘 생성 스크립트
icon-192.png와 icon-512.png를 생성합니다.
"""

import sys
import subprocess

# Pillow 설치 확인 및 설치
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow가 설치되어 있지 않습니다. 설치 중...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "Pillow"])
    # 설치 후 다시 import 시도
    import importlib
    importlib.invalidate_caches()
    from PIL import Image, ImageDraw, ImageFont

import os

def create_icon(size, output_path):
    """아이콘 생성"""
    # 이미지 생성
    img = Image.new('RGB', (size, size), color='#3b82f6')
    draw = ImageDraw.Draw(img)
    
    # 둥근 모서리 (원 그리기)
    margin = size // 8
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill='white',
        outline='white'
    )
    
    # 텍스트 추가
    try:
        # 시스템 폰트 사용 시도
        font_size = size // 3
        try:
            # Windows에서 한글 폰트 찾기
            if os.name == 'nt':
                font_paths = [
                    'C:/Windows/Fonts/malgun.ttf',  # 맑은 고딕
                    'C:/Windows/Fonts/gulim.ttc',  # 굴림
                    'C:/Windows/Fonts/batang.ttc',  # 바탕
                ]
                font = None
                for path in font_paths:
                    if os.path.exists(path):
                        font = ImageFont.truetype(path, font_size)
                        break
                if font is None:
                    font = ImageFont.load_default()
            else:
                font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # 텍스트 그리기
    text = "건"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    position = ((size - text_width) // 2, (size - text_height) // 2 - text_height // 4)
    draw.text(position, text, fill='#3b82f6', font=font)
    
    # 저장
    img.save(output_path, 'PNG')
    print(f"✅ {output_path} 생성 완료 ({size}x{size})")

def main():
    """메인 함수"""
    # 출력 디렉토리
    output_dir = 'frontend/public'
    os.makedirs(output_dir, exist_ok=True)
    
    # 아이콘 생성
    create_icon(192, os.path.join(output_dir, 'icon-192.png'))
    create_icon(512, os.path.join(output_dir, 'icon-512.png'))
    
    print("\n✅ 모든 아이콘 생성 완료!")
    print(f"📁 위치: {output_dir}/")

if __name__ == '__main__':
    main()

