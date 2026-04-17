export function checkRectangleCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2
}

export function checkCircleRectangleCollision(circleX, circleY, radius, rectX, rectY, rectWidth, rectHeight) {
  const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth))
  const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight))

  const distanceX = circleX - closestX
  const distanceY = circleY - closestY

  return (distanceX * distanceX + distanceY * distanceY) < (radius * radius)
}