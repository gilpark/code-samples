import * as React from "react";

function SvgIconVideoPlay(props) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <defs>
        <clipPath id="ICON_videoPlay_svg__a">
          <path fill="none" d="M-865.55 102.97H990.21v1080H-865.55z" />
        </clipPath>
      </defs>
      <g clipPath="url(#ICON_videoPlay_svg__a)">
        <image
          width={2611}
          height={1705}
          transform="matrix(.75 0 0 .67 -962.56 46.51)"
        />
      </g>
      <path
        d="M49.69 32A17.69 17.69 0 1132 14.31 17.69 17.69 0 0149.69 32zm-21.9-6.74v13.48l11-6.74-11-6.74z"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default SvgIconVideoPlay;
