import * as React from "react";

function SvgIconVolOff(props) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <defs>
        <clipPath id="ICON_volOff_svg__clip-path">
          <path fill="none" d="M-97.55 102.97h1855.76v1080H-97.55z" />
        </clipPath>
        <style>
          {
            ".ICON_volOff_svg__cls-3{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.19px}"
          }
        </style>
      </defs>
      <g clipPath="url(#ICON_volOff_svg__clip-path)" id="ICON_volOff_svg__BG">
        <image
          width={2611}
          height={1705}
          transform="matrix(.75 0 0 .67 -194.56 46.51)"
        />
      </g>
      <g id="ICON_volOff_svg__EXPORT">
        <path
          className="ICON_volOff_svg__cls-3"
          d="M29.32 21.46l-5.23 5.18h-6.22a1.6 1.6 0 00-1.6 1.59v7.54a1.6 1.6 0 001.6 1.59h6.22l5.23 5.18a1.28 1.28 0 002.17-.9V22.36a1.28 1.28 0 00-2.17-.9zM36.74 26.84l10.33 10.32M47.07 26.84L36.74 37.16"
        />
      </g>
    </svg>
  );
}

export default SvgIconVolOff;
