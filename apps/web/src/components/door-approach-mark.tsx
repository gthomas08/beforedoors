import "./door-approach-mark.css";

export function DoorApproachMark() {
  return (
    <div className="approach-mark mb-4 h-28 w-34 text-(--landing-ink) sm:mb-5 sm:h-32 sm:w-40">
      <svg
        aria-hidden="true"
        className="h-full w-full"
        fill="none"
        viewBox="0 0 192 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="approach-door" stroke="currentColor">
          <path d="M67 116V28h45v88" strokeLinecap="square" strokeWidth="3" />
          <path
            className="approach-door-leaf"
            d="M67 28 35 10v116l32-10Z"
            fill="var(--landing-bg)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          <circle
            className="approach-door-handle"
            cx="45"
            cy="70"
            r="4"
            fill="var(--landing-accent)"
            stroke="none"
          />
        </g>

        <g className="approach-person" stroke="currentColor">
          <circle cx="138" cy="116" r="16" strokeWidth="3" />
          <circle cx="139" cy="76" r="5.5" strokeWidth="3" />
          <path
            d="M140 88v16h-15l-9 17h-15"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          <path d="m140 92-12 5-7-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          <path
            className="approach-wheel-tick"
            d="M138 102v7"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        </g>

        <g
          className="approach-ground"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.5"
        >
          <path d="m10 132 29-10 12 4" />
          <path d="m158 122 25 8" />
          <path className="approach-grass" d="m22 127-1-13m4 11 5-12m-9 14-7-7" />
          <path d="m25 143 7-3m4 6 5 1m80-7 5-2m8 3 4 1" />
        </g>

        <g
          className="approach-route"
          stroke="var(--landing-accent)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        >
          <path d="M68 126c-12 1-10 12-20 14" />
          <path d="M81 124c14 4 7 13 20 20" />
          <path
            className="approach-route-dash"
            d="M106 132c6-3 10-2 15 2"
            pathLength="12"
            strokeDasharray="2 5"
          />
        </g>
      </svg>
    </div>
  );
}
