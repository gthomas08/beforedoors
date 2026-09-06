export function ReportContourLines() {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      viewBox="0 0 1052 267"
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id="report-contour-fade" cx="76%" cy="46%" r="82%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="68%" stopColor="white" stopOpacity="0.82" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <mask
          id="report-contour-mask"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1052"
          height="267"
        >
          <rect width="1052" height="267" fill="url(#report-contour-fade)" />
        </mask>
      </defs>
      <g
        fill="none"
        stroke="var(--app-ink)"
        strokeWidth="1"
        opacity="0.065"
        mask="url(#report-contour-mask)"
      >
        <path d="M-40 42c70-38 126-32 174 7s84 53 145 30 92-68 155-50 85 68 151 53 98-67 164-44 89 66 158 45 113-60 179-31" />
        <path d="M-42 78c66-32 119-27 167 8s89 47 145 24 94-62 155-43 87 64 150 47 98-61 162-39 91 60 157 39 114-52 178-23" />
        <path d="M-44 116c65-28 113-23 160 9s86 40 143 18 95-57 153-39 87 59 148 42 98-56 159-35 93 53 156 33 113-47 179-19" />
        <path d="M-38 156c60-23 108-17 151 11s86 34 139 13 96-53 153-36 86 53 145 38 99-51 157-32 94 46 153 27 116-40 183-13" />
        <path d="M-34 198c57-18 102-13 145 13s81 28 133 10 98-46 151-30 87 47 143 34 100-45 157-28 94 39 151 22 118-33 181-8" />
        <path d="M-28 238c54-14 95-9 135 14s79 23 126 8 94-39 145-25 87 41 141 29 99-38 153-23 96 32 153 18 119-25 181-3" />
        <path d="M592 8c-36 31-44 72-11 96s103 6 131 39 13 80-32 100-105 10-112 45 35 48 76 42" />
        <path d="M642 8c-24 27-27 56-2 73s83 6 104 33 8 58-29 74-87 9-93 38 31 37 61 34" />
        <path d="M705 8c-16 21-12 43 9 54s61 8 74 29-1 44-27 55-67 4-71 28 24 30 46 28" />
        <path d="M814 0c-18 22-19 47 6 61s71 4 85 27-4 53-34 66-72 5-76 35 30 39 58 35 55-14 76 5 17 41 2 58" />
        <path d="M930 0c-16 18-14 37 8 49s60 1 72 20-6 42-29 52-55 5-59 28 25 31 45 29 45-11 61 6 9 37-12 55" />
      </g>
    </svg>
  );
}
