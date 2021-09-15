import {vector, calc, } from '@js-basics/vector'

export default function(){
    let initialPosition = vector()
    const touchMoves = e =>{
        const x = e.changedTouches[0].pageX
        const y = e.changedTouches[0].pageY
        const currentPos = vector(x,y)
        let angleDelta = calc(()=>currentPos - initialPosition)
        let rad =  Math.atan2(angleDelta.y,angleDelta.x);
        const sin = Math.abs(Math.sin(rad)).toFixed(3) //y
        const cos = Math.abs(Math.cos(rad)).toFixed(3) //x
        const isVertical = true
        const inRange = (isVertical ?cos :sin) < 0.85 //angle threshold
        if(inRange){
            // console.log('should block??')
            e.stopPropagation()
        }
    }
    const touchStart = e =>{
        const x = e.changedTouches[0].pageX
        const y = e.changedTouches[0].pageY
        initialPosition = vector(x,y)
    }
    return {touchMoves, touchStart}
}