"use client";
import { useId } from "react";
import "./monochrome-home.css";
export default function ProductArtwork({ tone }: { tone: number }) {
  const id = useId();
  if (tone === 0)
    return (
      <div className="tee-scene black-tee">
        <svg
          className="shirt"
          viewBox="0 0 400 440"
          role="img"
          aria-label="Black graphic tee reading Probably Overthinking"
        >
          <defs>
            <linearGradient id={`${id}-black`} x1="0" x2="1">
              <stop stopColor="#1a1a1a" />
              <stop offset=".3" stopColor="#3a3a3a" />
              <stop offset=".55" stopColor="#282828" />
              <stop offset=".8" stopColor="#363636" />
              <stop offset="1" stopColor="#181818" />
            </linearGradient>
            <filter id={`${id}-shadow`}>
              <feDropShadow
                dx="0"
                dy="20"
                stdDeviation="12"
                floodOpacity=".45"
              />
            </filter>
          </defs>
          <g filter={`url(#${id}-shadow)`}>
            <path
              d="M137 49 99 62 30 135 80 189 110 165 98 384Q200 402 302 384L290 165 320 189 370 135 301 62 263 49Q200 84 137 49Z"
              fill={`url(#${id}-black)`}
              stroke="#4c4c4c"
              strokeWidth="1.4"
            />
            <path
              d="M137 49Q145 111 200 111T263 49Q200 80 137 49"
              fill="#151515"
              stroke="#4e4e4e"
              strokeWidth="3"
            />
            <path
              d="M111 165 120 112M290 165 280 112M111 374Q200 389 291 374"
              fill="none"
              stroke="#575757"
              opacity=".4"
            />
            <path
              d="M132 198q-9 72 0 152M269 206q12 69 0 144"
              fill="none"
              stroke="#5b5b5b"
              opacity=".2"
              strokeWidth="4"
            />
          </g>
          <text
            x="200"
            y="191"
            textAnchor="middle"
            fill="#eaeaea"
            fontFamily="Arial,sans-serif"
            fontWeight="800"
            fontSize="19"
            letterSpacing="-1"
          >
            PROBABLY
          </text>
          <text
            x="200"
            y="214"
            textAnchor="middle"
            fill="#eaeaea"
            fontFamily="Arial,sans-serif"
            fontWeight="800"
            fontSize="19"
            letterSpacing="-1"
          >
            OVERTHINKING.
          </text>
          <text
            x="200"
            y="235"
            textAnchor="middle"
            fill="#b2b2b2"
            fontFamily="Arial"
            fontSize="5"
            letterSpacing="2"
          >
            NO NONSENSES · INSIDE VOICE CLUB
          </text>
        </svg>
      </div>
    );
  if (tone === 1)
    return (
      <div className="tee-scene white-tee">
        <svg
          className="shirt"
          viewBox="0 0 400 440"
          role="img"
          aria-label="Off-white graphic tee reading social battery 1 percent"
        >
          <defs>
            <filter id={`${id}-shadow`}>
              <feDropShadow
                dx="0"
                dy="20"
                stdDeviation="12"
                floodOpacity=".45"
              />
            </filter>
            <linearGradient id={`${id}-cream`} x1="0" x2="1">
              <stop stopColor="#a3a3a3" />
              <stop offset=".3" stopColor="#dedede" />
              <stop offset=".55" stopColor="#c9c9c9" />
              <stop offset=".8" stopColor="#e3e3e3" />
              <stop offset="1" stopColor="#989898" />
            </linearGradient>
          </defs>
          <g filter={`url(#${id}-shadow)`}>
            <path
              d="M137 49 99 62 30 135 80 189 110 165 98 384Q200 402 302 384L290 165 320 189 370 135 301 62 263 49Q200 84 137 49Z"
              fill={`url(#${id}-cream)`}
              stroke="#d1d1d1"
              strokeWidth="1.4"
            />
            <path
              d="M137 49Q145 111 200 111T263 49Q200 80 137 49"
              fill="#858585"
              stroke="#bcbcbc"
              strokeWidth="3"
            />
            <path
              d="M111 165 120 112M290 165 280 112M111 374Q200 389 291 374"
              fill="none"
              stroke="#818181"
              opacity=".5"
            />
            <path
              d="M132 198q-9 72 0 152M269 206q12 69 0 144"
              fill="none"
              stroke="#818181"
              opacity=".15"
              strokeWidth="4"
            />
          </g>
          <text
            x="200"
            y="190"
            textAnchor="middle"
            fill="#333333"
            fontFamily="Arial,sans-serif"
            fontWeight="700"
            fontSize="21"
            letterSpacing="-1"
          >
            social battery
          </text>
          <rect
            x="170"
            y="204"
            width="58"
            height="24"
            rx="4"
            fill="none"
            stroke="#3c3c3c"
            strokeWidth="2"
          />
          <rect x="229" y="211" width="4" height="10" rx="1" fill="#3c3c3c" />
          <rect x="174" y="208" width="5" height="16" rx="1" fill="#3c3c3c" />
          <text
            x="202"
            y="221"
            textAnchor="middle"
            fill="#3c3c3c"
            fontFamily="Arial"
            fontSize="12"
          >
            1%
          </text>
          <text
            x="200"
            y="248"
            textAnchor="middle"
            fill="#666666"
            fontFamily="Arial"
            fontSize="5"
            letterSpacing="2"
          >
            NO NONSENSES · RECHARGING
          </text>
        </svg>
      </div>
    );
  if (tone === 2)
    return (
      <div className="tee-scene grey-tee">
        <svg
          className="shirt"
          viewBox="0 0 400 440"
          role="img"
          aria-label="Ash-grey essential tee with No Nonsenses print"
        >
          <defs>
            <filter id={`${id}-shadow`}>
              <feDropShadow
                dx="0"
                dy="20"
                stdDeviation="12"
                floodOpacity=".45"
              />
            </filter>
            <linearGradient id={`${id}-sage`} x1="0" x2="1">
              <stop stopColor="#5e5e5e" />
              <stop offset=".3" stopColor="#9d9d9d" />
              <stop offset=".55" stopColor="#858585" />
              <stop offset=".8" stopColor="#a4a4a4" />
              <stop offset="1" stopColor="#5e5e5e" />
            </linearGradient>
          </defs>
          <g filter={`url(#${id}-shadow)`}>
            <path
              d="M137 49 99 62 30 135 80 189 110 165 98 384Q200 402 302 384L290 165 320 189 370 135 301 62 263 49Q200 84 137 49Z"
              fill={`url(#${id}-sage)`}
              stroke="#aeaeae"
              strokeWidth="1.4"
            />
            <path
              d="M137 49Q145 111 200 111T263 49Q200 80 137 49"
              fill="#424242"
              stroke="#8e8e8e"
              strokeWidth="3"
            />
            <path
              d="M111 165 120 112M290 165 280 112M111 374Q200 389 291 374"
              fill="none"
              stroke="#5b5b5b"
              opacity=".65"
            />
            <path
              d="M132 198q-9 72 0 152M269 206q12 69 0 144"
              fill="none"
              stroke="#454545"
              opacity=".15"
              strokeWidth="4"
            />
          </g>
          <text
            x="200"
            y="200"
            textAnchor="middle"
            fill="#2e2e2e"
            fontFamily="Arial,sans-serif"
            fontWeight="800"
            fontSize="18"
            letterSpacing="-1"
          >
            NO NONSENSES
          </text>
          <text
            x="200"
            y="217"
            textAnchor="middle"
            fill="#424242"
            fontFamily="Arial"
            fontSize="5"
            letterSpacing="3"
          >
            LESS PRETENDING. MORE YOU.
          </text>
        </svg>
      </div>
    );
  return null;
}
