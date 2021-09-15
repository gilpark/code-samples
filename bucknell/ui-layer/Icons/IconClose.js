import * as React from "react";

function SvgIconClose(props) {
    const {color, width} = props
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <defs>
        <clipPath id="ICON_close_svg__clip-path">
          <path fill="none" d="M-737.55 102.97h1855.76v1080H-737.55z" />
        </clipPath>
        {/*<style>*/}
        {/*  {*/}
        {/*    `.ICON_close_svg__cls-3{fill:none;stroke:${props.color?props.color:'#003865'};stroke-linecap:round;stroke-linejoin:round;stroke-width:${width?width:2}}`*/}
        {/*  }*/}
        {/*</style>*/}
      </defs>
      <g clipPath="url(#ICON_close_svg__clip-path)" id="ICON_close_svg__BG">
        <image
          width={2611}
          height={1705}
          transform="matrix(.75 0 0 .67 -834.56 46.51)"
        />
      </g>
      <g id="ICON_close_svg__EXPORT">
        <path
          className="ICON_close_svg__cls-3"
          d="M17.6 17.6l28.8 28.8M46.4 17.6L17.6 46.4"
          stroke={color?color:'#003865'}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={width?width:2}
          fill="none"
        />
      </g>
    </svg>
  );
}

export default SvgIconClose;
