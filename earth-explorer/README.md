# Earth Explorer (cesium.js, svelte.js, node.js)

### Code samples

Filtering scrolling up/down event when user is swiping left/right by calculating touch direction.
`TouchScreen/libs/Swipeable/Swipeable.svelte`

```javascript
function move(position) {
  if(block) return;
  if (!dragging) return
  let delta = calc(()=>position - lastPosition)
  let angleDelta = calc(()=>position - initialPosition)
  let rad =  Math.atan2(angleDelta.y,angleDelta.x);
  const sin = Math.abs(Math.sin(rad)).toFixed(3) //y
  const cos = Math.abs(Math.cos(rad)).toFixed(3) //x
  const isVertical = direction === 'vertical'
  const inRange = (isVertical ?cos :sin) < 0.85 //angle threshold
  //todo wish list: ignore when inRange value is jumpy
  blockEvent = inRange
  if(!inRange) return

  lastPosition = position.clone()
  const d = direction==='vertical'? delta.y : delta.x
  draggedPixels -= d * speed
  if (draggedPixels < 0) draggedPixels = 0
  if (draggedPixels > maxSlideIndex * size) draggedPixels = maxSlideIndex * size
  draggedBack = d < 0
  jumpEnabled = false
  $progress = (draggedPixels / size) || 0
}
```

### documentation
#### App
  * [video 1](https://drive.google.com/file/d/1g8VeD37ik6InfW5So2fuQK-Cs6qvyvDh/view?usp=sharing)
