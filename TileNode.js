import * as THREE from "three"

export const AMERICAN_TRANSFORM = new THREE.Matrix4().set(
  96.86, -15.99, 19.02, 1215107.76,
  24.85, 62.32, -74.16, -4736682.90,
  0, 76.56, 64.34, 4081926.09,
  0, 0, 0, 1
)

export class TileNode {
  refine = "REPLACE"
  boundingVolume = {}
  geometricError = null

  // 这四项在json中可以缺失（根结点没有content），故设为undefined
  content = undefined
  children = undefined
  transform = undefined
  extras = undefined

  constructor(filedOption) {
    if (filedOption) this.setFiled(filedOption)
  }

  setFiled({ boundingBox, boundingRegion, geometricError, children, transform, extras, uri } = {}) {
    if (boundingBox) this.setBoundingBox(boundingBox)
    if (boundingRegion) this.setBoundingRegion(boundingRegion)
    if (geometricError) this.geometricError = geometricError
    if (children && children instanceof Array) this.children = children
    if (transform) this.setTransform(transform)
    if (extras) this.setExtras(extras)
    if (uri) this.content = { uri }
    return this
  }

  // 改为setter方法
  setBoundingBox(boundingBox) {
    const center = boundingBox.getCenter(new THREE.Vector3())
    const size = boundingBox.getSize(new THREE.Vector3())
    this.boundingVolume.box = [
      center.x, center.y, center.z,
      size.x / 2, 0, 0,
      0, size.y / 2, 0,
      0, 0, size.z / 2
    ]
  }

  // 改为setter方法
  getBoundingBox() {
    const box = this.boundingVolume.box
    if (!box) return null
    else return new THREE.Box3(
      new THREE.Vector3(box[0] - box[3], box[1] - box[7], box[2] - box[11]),
      new THREE.Vector3(box[0] + box[3], box[1] + box[7], box[2] + box[11]),
    )
  }

  // 改为setter方法
  setBoundingRegion(boundingRegion) {
    this.boundingVolume.region = [
      boundingRegion.min.x * (Math.PI / 180),
      boundingRegion.min.y * (Math.PI / 180),
      boundingRegion.max.x * (Math.PI / 180),
      boundingRegion.max.y * (Math.PI / 180),
      boundingRegion.min.z,
      boundingRegion.max.z,
    ]
  }

  // 改为setter方法
  setTransform(matrix4) {
    this.transform = matrix4.toArray()
  }

  // 改为setter方法
  setExtras(extras) {
    this.extras = extras
  }

  static newDefaultRoot({ boundingBox, children, transform } = {}) {
    return new TileNode().setFiled({
      // boundingBox, geometricError: 20000, children, transform: defaultTransform
      boundingBox, geometricError: 100000, children, transform
    })
  }
}