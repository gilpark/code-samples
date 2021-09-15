import * as React from "react";

function SvgIconHamburger(props) {
    const {color, width} = props

    return (
        <svg viewBox="0 0 64 64" {...props}>
            <defs>
                <clipPath id="ICON_hamburger_svg__a">
                    <path fill="none" d="M-801.55 102.97h1855.76v1080H-801.55z" />
                </clipPath>
            </defs>
            <g clipPath="url(#ICON_hamburger_svg__a)">
                <image
                    width={2611}
                    height={1705}
                    transform="matrix(.75 0 0 .67 -898.56 46.51)"
                />
            </g>
            <path
                d="M52.33 42.92H11.67M52.33 32H11.67m40.66-10.92H11.67"
                stroke={color?color:'#003865'}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={width?width:2}
                fill="none"
            />
        </svg>
    );
}

export default SvgIconHamburger;
