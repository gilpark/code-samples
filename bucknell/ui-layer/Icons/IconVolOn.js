import * as React from "react";

function SvgIconVolOn(props) {
    const {color, width} = props
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <defs>
        <clipPath id="ICON_volOn_svg__clip-path">
          <path fill="none" d="M-33.55 102.97h1855.76v1080H-33.55z"

          />
        </clipPath>
        {/*<style>*/}
        {/*  {*/}
        {/*    `.ICON_volOn_svg__cls-3{fill:none;stroke:${color?color:'#003865'};stroke-linecap:round;stroke-linejoin:round;stroke-width:${width?width:2}}`*/}
        {/*  }*/}
        {/*</style>*/}
      </defs>
      <g clipPath="url(#ICON_volOn_svg__clip-path)" id="ICON_volOn_svg__BG">
        <image
          width={2611}
          height={1705}
          transform="matrix(.75 0 0 .67 -130.56 46.51)"
        />
      </g>
      <g id="ICON_volOn_svg__EXPORT">
        <path
            stroke={color?color:'#003865'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={width?width:2}
            fill="none"
          className="ICON_volOn_svg__cls-3"
          d="M34.82 35.36c.13-.1.25-.21.38-.33a4.29 4.29 0 000-6.06c-.13-.12-.25-.23-.38-.33M38.3 39.78a10.42 10.42 0 00.87-.77 9.92 9.92 0 000-14 10.42 10.42 0 00-.87-.77"
        />
        <path
            stroke={color?color:'#003865'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={width?width:2}
            fill="none"
          className="ICON_volOn_svg__cls-3"
          d="M41.79 44.22A14.34 14.34 0 0043.17 43a15.55 15.55 0 000-22 14.34 14.34 0 00-1.38-1.22M29.32 21.46l-5.23 5.18h-6.22a1.6 1.6 0 00-1.6 1.59v7.54a1.6 1.6 0 001.6 1.59h6.22l5.23 5.18a1.28 1.28 0 002.17-.9V22.36a1.28 1.28 0 00-2.17-.9z"
        />
      </g>
    </svg>
  );
}

export default SvgIconVolOn;
