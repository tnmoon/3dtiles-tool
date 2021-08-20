import { TableMap } from "./TableMap"
import { PropertyOffsetAccumulator, isTypedArray, arrayToObject } from "./utils"

function getPropertyComponentType(property) {
  if (property instanceof Uint8Array) return "UNSIGNED_BYTE"
  else if (property instanceof Int8Array) return "BYTE"
  else if (property instanceof Uint16Array) return "UNSIGNED_SHORT"
  else if (property instanceof Int16Array) return "SHORT"
  else if (property instanceof Uint32Array) return "UNSIGNED_INT"
  else if (property instanceof Int32Array) return "INT"
  else if (property instanceof Float32Array) return "FLOAT"
  else if (property instanceof Float64Array) return "DOUBLE"
  else throw new Error("batchTable property type error")
}

function getPropertyType(property, batchLength) {
  if (batchLength === 0) throw new Error("batch length is 0")
  else if (property.length === batchLength) return "SCALAR"
  else if (property.length === 2 * batchLength) return "VEC2"
  else if (property.length === 3 * batchLength) return "VEC3"
  else if (property.length === 4 * batchLength) return "VEC4"
  else throw new Error(`batchTable property length error, property length is ${property.length}, batchLength is ${batchLength}`)
}

export class BatchTableMap extends TableMap {
  _batchLength = null

  constructor() {
    super()
  }

  set batchLength(value) {
    this._batchLength = value
  }

  get batchLength() {
    return this._batchLength
  }

  exportTableJSON() {
    if (!typeof (this.batchLength) === "number" || this.batchLength < 0) throw new Error("incorrect batchLength")
    if (this.batchLength === 0) return {}

    const offsetAccumulator = new PropertyOffsetAccumulator()
    return arrayToObject([...this.entries()].map(([key, value]) => ({
      [key]: isTypedArray(value) ? {
        byteOffset: offsetAccumulator.add(value),
        componentType: getPropertyComponentType(value),
        type: getPropertyType(value, this.batchLength),
      } : value
    })))
  }

  exportTableBinary() {
    return this.batchLength === 0 ? [] : [...this.values()].filter(array => isTypedArray(array))
  }
}