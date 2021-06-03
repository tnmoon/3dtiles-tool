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
export function exportGltfFromTHREE(input, option) {
  return new Promise(resolve => {
    exporter.parse(input, gltf => resolve(gltf), option)
  })
}

const targetIndexMap = new WeakMap() // 使用WeakMap以避免内存泄漏
// 遇到ArrayBuffer时，以小端模式拷贝
export function copyInOrder(target, source) {
  let index = targetIndexMap.get(target) || 0
  for (const value of source) {
    target[index++] = value
  }
  if (index < target.length) targetIndexMap.set(target, index)
  else targetIndexMap.delete(target)
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

export function defaultValue(a, b) {
  if (a !== undefined && a !== null) return a
  else return b
}