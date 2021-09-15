
/*jshint esversion: 6 */
//https://codepen.io/HunorMarton/post/handling-complex-mouse-and-touch-events-with-rxjs
//get rx.js from here: https://cdnjs.com/libraries/rxjs
import {merge, timer, fromEvent, empty} from 'rxjs';
import {filter, concatMap, first, elementAt, catchError, takeUntil , share, switchMap, map} from 'rxjs/operators'

function getObservables(domItem) {
    const mouseEventToCoordinate = mouseEvent => {
        // if(mouseEvent.cancelable)mouseEvent.preventDefault();
        return {
            target: mouseEvent.target,
            x: mouseEvent.clientX,
            y: mouseEvent.clientY,
            type:'mouse',
            _e:mouseEvent
        };
    }

    const touchEventToCoordinate = touchEvent => {
        // console.log(touchEvent.cancelable)
        // if(touchEvent.cancelable)touchEvent.preventDefault();
        return {
            target: touchEvent.target,
            x: touchEvent.changedTouches[0].clientX,
            y: touchEvent.changedTouches[0].clientY,
            type:'touch',
            _e:touchEvent
        };
    }


    //mouse events
    //{capture:true, passive:false}
    const mouseDowns = fromEvent(domItem, "mousedown",).pipe(map(mouseEventToCoordinate));
    const mouseMoves = fromEvent(domItem, "mousemove",).pipe(map(mouseEventToCoordinate));
    const mouseUps = fromEvent(domItem, "mouseup",).pipe(map(mouseEventToCoordinate));
    //touch events
    const touchStarts = fromEvent(domItem, "touchstart",).pipe(map(touchEventToCoordinate));
    const touchMoves = fromEvent(domItem, "touchmove",).pipe(map(touchEventToCoordinate));
    const touchEnds = fromEvent(domItem, "touchend",).pipe(map(touchEventToCoordinate));

    //starts, moves, ends
    const starts = merge(mouseDowns,touchStarts);
    const moves = merge(mouseMoves,touchMoves);
    const ends = merge(mouseUps,touchEnds);

    //drag start event
    const moveStartsWithDirection =
        starts.pipe(
            concatMap(dragStartEvent =>
                moves.pipe(
                    takeUntil(ends),
                    elementAt(3),
                    catchError(err => empty()),
                    map(dragEvent => {
                        const initialDeltaX = dragEvent.x - dragStartEvent.x;
                        const initialDeltaY = dragEvent.y - dragStartEvent.y;
                        return {x: dragStartEvent.x, y: dragStartEvent.y, initialDeltaX, initialDeltaY, type:dragEvent.type, _e:dragEvent._e};
                    })
                )
            )
        );

    //on drag event
    const drags =
        starts.pipe(
            concatMap(dragStartEvent =>
                moves.pipe(
                    takeUntil(ends),
                    catchError(err => empty()),
                    map(dragEvent => {
                        const initialDeltaX = dragEvent.x - dragStartEvent.x;
                        const initialDeltaY = dragEvent.y - dragStartEvent.y;
                        return {x: dragEvent.x, y: dragEvent.y, initialDeltaX, initialDeltaY, type:dragEvent.type, _e:dragEvent._e};
                    })
                )
            )
        );

    //on drop event
    const drops =
        starts.pipe(
            concatMap(dragStartEvent =>
                ends.pipe(
                    first(),
                    catchError(err => empty()),
                    map(dragEndEvent => {
                        const initialDeltaX = dragEndEvent.x - dragStartEvent.x;
                        const initialDeltaY = dragEndEvent.y - dragStartEvent.y;
                        return {x: dragEndEvent.x, y: dragEndEvent.y, initialDeltaX, initialDeltaY, type:dragEndEvent.type};
                    })
                )
            )
        );



    //horizontal, vertical start event
    const horizontalMoveStarts = moveStartsWithDirection.pipe(filter(dragStartEvent => Math.abs(dragStartEvent.initialDeltaX) >= Math.abs(dragStartEvent.initialDeltaY)));
    const verticalMoveStarts = moveStartsWithDirection.pipe(filter(dragStartEvent => Math.abs(dragStartEvent.initialDeltaX) < Math.abs(dragStartEvent.initialDeltaY)));


    // Take the moves until an end occurs
    const movesUntilEnds = dragStartEvent =>
        moves.pipe(
            takeUntil(ends),
            map(dragEvent => {
                const x = dragEvent.x - dragStartEvent.x;
                const y = dragEvent.y - dragStartEvent.y;
                return {x, y, type:dragEvent.type, _e:dragEvent._e};
            })
        );

    //swipe up down, left/right moves
    const horizontalMoves = horizontalMoveStarts.pipe(concatMap(movesUntilEnds));
    const verticalMoves = verticalMoveStarts.pipe(concatMap(movesUntilEnds));

    const lastMovesAtEnds = dragStartEvent =>
        ends.pipe(
            first(),
            map(dragEndEvent => {
                const x = dragEndEvent.x - dragStartEvent.x;
                const y = dragEndEvent.y - dragStartEvent.y;
                return {x, y, type: dragEndEvent.type, _e:dragStartEvent._e};
            }));


    //swipe up/down left/right ends
    const horizontalMoveEnds = horizontalMoveStarts.pipe(concatMap(lastMovesAtEnds));
    const verticalMoveEnds = verticalMoveStarts.pipe(concatMap(lastMovesAtEnds));

    return {
        horizontalMoveStarts: horizontalMoveStarts.pipe(share()),
        horizontalMove: horizontalMoves.pipe(share()),
        horizontalMoveEnds: horizontalMoveEnds.pipe(share()),

        verticalMoveStarts: verticalMoveStarts.pipe(share()),
        verticalMove: verticalMoves.pipe(share()),
        verticalMoveEnds: verticalMoveEnds.pipe(share()),

        starts: starts.pipe(share()),
        moves: moves.pipe(share()),
        ends: ends.pipe(share()),

        drags: drags.pipe(share()),
        drops: drops.pipe(share()),
        //distinct click/tap event from drop/swipe end event
        clickAndTaps: starts.pipe(switchMap(_=>ends.pipe(takeUntil(timer(250)))),share()),
        vertical2: verticalMoveStarts.pipe(switchMap(_=>ends.pipe(takeUntil(timer(250)))),share())
    };
}

export default getObservables
/*
InputPointer.prototype.initialize = function() {
    const {pipe, merge} = rxjs;
    const {filter, map, tap, mapTo,concatMap, first, elementAt, catchError, takeUntil} = rxjs.operators;

    //filtering mouse or touch
    // pointers.starts.pipe(filter(d => d.type ==='mouse')).subscribe(d => console.log('mouse click start:',d));
    // pointers.starts.pipe(filter(d => d.type ==='touch')).subscribe(d => console.log('touch tap start:',d));

    //or use them together
    // pointers.drags.subscribe(d => console.log('drag', d));
    // pointers.ends.subscribe(d => console.log('ends', d));

};
*/
