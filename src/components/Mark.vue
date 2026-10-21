<template>
  <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
    <defs>
      <linearGradient id="mkBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stop-color="#1060a8" />
        <stop offset="1" stop-color="#053265" />
      </linearGradient>
    </defs>

    <!-- 底圆 -->
    <circle cx="20" cy="20" r="20" fill="url(#mkBg)" />

    <!-- 外金色圆环 -->
    <circle cx="20" cy="20" r="18.5" fill="none" stroke="#d4a520" stroke-width="1.1" />

    <!-- 左侧麦穗茎 -->
    <path d="M20 30 Q16 27 13 22 Q11 18 12 14" fill="none" stroke="#e8c040" stroke-width="0.9" stroke-linecap="round"/>
    <!-- 左麦粒 5颗 -->
    <ellipse cx="11.5" cy="24.5" rx="1.8" ry="1.0" fill="#e8c040" transform="rotate(-55 11.5 24.5)"/>
    <ellipse cx="10.8" cy="21.2" rx="1.7" ry="0.95" fill="#e8c040" transform="rotate(-50 10.8 21.2)"/>
    <ellipse cx="10.8" cy="18.0" rx="1.6" ry="0.9" fill="#e8c040" transform="rotate(-45 10.8 18.0)"/>
    <ellipse cx="11.5" cy="15.2" rx="1.5" ry="0.85" fill="#e8c040" transform="rotate(-40 11.5 15.2)"/>
    <ellipse cx="12.8" cy="13.0" rx="1.4" ry="0.8" fill="#e8c040" transform="rotate(-35 12.8 13.0)"/>

    <!-- 右侧麦穗茎 -->
    <path d="M20 30 Q24 27 27 22 Q29 18 28 14" fill="none" stroke="#e8c040" stroke-width="0.9" stroke-linecap="round"/>
    <!-- 右麦粒 5颗 -->
    <ellipse cx="28.5" cy="24.5" rx="1.8" ry="1.0" fill="#e8c040" transform="rotate(55 28.5 24.5)"/>
    <ellipse cx="29.2" cy="21.2" rx="1.7" ry="0.95" fill="#e8c040" transform="rotate(50 29.2 21.2)"/>
    <ellipse cx="29.2" cy="18.0" rx="1.6" ry="0.9" fill="#e8c040" transform="rotate(45 29.2 18.0)"/>
    <ellipse cx="28.5" cy="15.2" rx="1.5" ry="0.85" fill="#e8c040" transform="rotate(40 28.5 15.2)"/>
    <ellipse cx="27.2" cy="13.0" rx="1.4" ry="0.8" fill="#e8c040" transform="rotate(35 27.2 13.0)"/>

    <!-- 底部托弧 -->
    <path d="M13.5 30.5 Q20 33 26.5 30.5" fill="none" stroke="#d4a520" stroke-width="1.0" stroke-linecap="round"/>

    <!-- 齿轮托底（半圆锯齿） -->
    <path d="M14 31.5 Q20 35 26 31.5" fill="none" stroke="#d4a520" stroke-width="0.6" stroke-linecap="round" opacity="0.7"/>

    <!-- 五角星（金色，居中） -->
    <polygon
      points="20,9.5 21.8,15.0 27.6,15.0 22.9,18.5 24.7,24.0 20,20.5 15.3,24.0 17.1,18.5 12.4,15.0 18.2,15.0"
      fill="#f0c820"
      stroke="#c89010"
      stroke-width="0.3"
    />

    <!-- 五角星中心亮点 -->
    <circle cx="20" cy="17.5" r="1.4" fill="#fff8d0" opacity="0.5"/>
  </svg>
</template>

<style scoped>
.brand-mark { display: block; width: 100%; height: 100%; }
</style>
