import GLTFExporter from "./GLTFExporter"

export class PropertyOffsetAccumulator {
  index = 0

  add(property) {
    const byteLength = property ? (4 * Math.ceil(property.buffer.byteLength / 4)) : 0
    return (this.index += byteLength) - byteLength
  }
}

export function isTypedArray(obj) {
  return obj instanceof Uint8Array ||
    obj instanceof Int8Array ||
    obj instanceof Uint16Array ||
    obj instanceof Int16Array ||
    obj instanceof Uint32Array ||
    obj instanceof Int32Array ||
    obj instanceof Float32Array ||
    obj instanceof Float64Array
}

export function arrayToObject(array) {
  const result = {}
  array.forEach(element => {
    const [key, value] = Object.entries(element)[0]
    result[key] = value
  })
  return result
}

export function sumArray(array) {
  let result = 0
  array.forEach(element => result += element)
  return result
}

const exporter = new GLTFExporter()
export function exportGlbBufferFromTHREE(blockMeshGroup) {
  return new Promise(resolve => {
    exporter.parse(blockMeshGroup, gltf => resolve(gltf), { binary: true })
  })
}

const targetIndexMap = new WeakMap() // 使用WeakMap以避免内存泄漏

export function copyUint32ToDataViewInOrder(dataView, source, littleEndian) {
  let index = targetIndexMap.get(dataView) || 0
  for (const value of source) {
    dataView.setUint32((index += 4) - 4, value, littleEndian)
  }
  if (index < dataView.byteLength) targetIndexMap.set(dataView, index)
  else targetIndexMap.delete(dataView)
}

export function copyUint8ToDataViewInOrder(dataView, source) {
  let index = targetIndexMap.get(dataView) || 0
  for (const value of source) {
    dataView.setUint8(index++, value)
  }
  if (index < dataView.byteLength) targetIndexMap.set(dataView, index)
  else targetIndexMap.delete(dataView)
}

export function stringCharCodeIterator(string) {
  return {
    *[Symbol.iterator]() {
      for (let index = 0; index < string.length; index++) {
        yield string.charCodeAt(index)
      }
    }
  }
}
