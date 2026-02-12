// Rotates a node around a pivot point using relativeTransform.
// Pivot is specified as fractional offset from top-left (0-1 range).
// Keeps the pivot fixed in place while the node rotates around it.
export function rotateNodeAroundOrigin(
  node: SceneNode & { width?: number; height?: number },
  angleDegrees: number,
  pivotXFrac: number,
  pivotYFrac: number,
): void {
  if (!('relativeTransform' in node) || !('width' in node) || !('height' in node)) {
    return
  }

  const angleRad = (angleDegrees * Math.PI) / 180
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)

  const px = node.width * pivotXFrac
  const py = node.height * pivotYFrac

  const [[a, b, tx], [c, d, ty]] = node.relativeTransform
  const pivotX = a * px + b * py + tx
  const pivotY = c * px + d * py + ty

  const txNew = pivotX - (cos * px + sin * py)
  const tyNew = pivotY - (-sin * px + cos * py)

  node.relativeTransform = [
    [cos, sin, txNew],
    [-sin, cos, tyNew],
  ]
}

// nodes: SceneNode[]

// The rotation of the node in degrees
// angle: number

// X and Y offset from upper left corner
// offsetX, offsetY: number

// Type of units
// unitTypeX, unitTypeY: string ("px" or "%")

/* Example */
// const nodes = figma.currentPage.selection
// rotateOriginXY(nodes, 45, 100, 10)
// rotateOriginXY(nodes, 45, .5, 0, "%", "px")
// rotateOriginXY(nodes, 45, 1, 0, "%", "%")

export function rotateOriginXY(
  nodes: SceneNode[],
  angle = 0,
  offsetX = 0,
  offsetY = 0,
  unitTypeX = "px",
  unitTypeY = "px",
) {
  // keep the position of the elements
  const parents = nodes.map((node) => ({
    id: node.id,
    parent: node.parent,
    index: getNodeIndex(node),
  }))

  let group = figma.group(nodes, figma.currentPage)
  const [[, , x1], [, , y1]] = group.absoluteTransform

  // using the frame, we will change the center of rotation
  const frameNode = figma.createFrame()
  frameNode.appendChild(group)
  frameNode.x = x1
  frameNode.y = y1

  const [[, , x2], [, , y2]] = group.absoluteTransform

  // relative position of the center of rotation
  if (unitTypeX === "%") {
    offsetX = group.width * offsetX
  }
  if (unitTypeY === "%") {
    offsetY = group.height * offsetY
  }

  // сorrect the position of the group after moving to frame
  group.x -= x2 - x1
  group.y -= y2 - y1

  // change the center of rotation
  group.x -= offsetX
  group.y -= offsetY
  frameNode.x += offsetX
  frameNode.y += offsetY

  frameNode.rotation = angle

  // get rid of the frame
  const [[, , x3], [, , y3]] = group.absoluteTransform
  figma.currentPage.appendChild(group)
  frameNode.remove()

  group.x = x3
  group.y = y3
  group.rotation = angle

  // shake out the nodes in a new not rotated group. Node rotation is maintained
  group = figma.group(group.children, figma.currentPage)
  const totalX = group.x
  const totalY = group.y
  const totalWidth = group.width
  const totalHeight = group.height

  // return the elements to their original positions
  nodes.forEach((n) => {
    let p = parents.find((p) => p.id == n.id)

    if (p) {
      p.parent?.insertChild(p.index, n)
    } else {
      // never know what ..
      figma.currentPage.appendChild(n)
    }

    let [[, , x4], [, , y4]] = n.absoluteTransform
    let [[, , x5], [, , y5]] = n.relativeTransform

    n.x = n.x + x5 - x4
    n.y = n.y + y5 - y4
  })

  function getNodeIndex(node: SceneNode) {
    const id = node.id
    const index =
      node.parent?.children.findIndex((item: SceneNode) => item.id === id) ?? -1
    return index < 0 ? 0 : index
  }

  // return total x, y, width, height all group elements
  return {
    x: totalX,
    y: totalY,
    width: totalWidth,
    height: totalHeight,
  }
}
