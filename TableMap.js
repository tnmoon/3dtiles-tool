import { sumArray, stringCharCodeIterator, defaultValue } from "./utils"

export class TableMap extends Map {

  constructor() {
    super()
  }

  export() {
    const tableJSON = this.exportTableJSON()
    const tableJSONString = Object.keys(tableJSON).length === 0 ? "" : JSON.stringify(tableJSON)
    const tableBinary = this.exportTableBinary()

    const tableJSONByteLength = 4 * Math.ceil(tableJSONString.length / 4)
    const tableBinaryByteLength = sumArray(tableBinary.map(({ buffer }) => 4 * Math.ceil(buffer.byteLength / 4)))

    return {
      tableJSONIterator: {
        *[Symbol.iterator]() {
          const iterator = stringCharCodeIterator(tableJSONString)[Symbol.iterator]()
          for (let index = 0; index < tableJSONByteLength / 4; index++) {
            const binary = new DataView(new ArrayBuffer(4))
            binary.setUint8(0, defaultValue(iterator.next().value, 0x20))
            binary.setUint8(1, defaultValue(iterator.next().value, 0x20))
            binary.setUint8(2, defaultValue(iterator.next().value, 0x20))
            binary.setUint8(3, defaultValue(iterator.next().value, 0x20))
            yield binary.getUint32(0, true)
          }
        }
      },
      tableBinaryIterator: {
        *[Symbol.iterator]() {
          for (const { buffer } of tableBinary) {
            const dataView = new DataView(buffer)
            const byteLength = buffer.byteLength
            for (let index = 0; index < Math.ceil(byteLength / 4); index++) {
              const byteOffset = 4 * index
              if (byteOffset + 4 > byteLength) {
                const binary = new DataView(new ArrayBuffer(4))
                binary.setUint8(0, byteOffset >= byteLength ? 0 : dataView.getUint8(byteOffset))
                binary.setUint8(1, byteOffset + 1 >= byteLength ? 0 : dataView.getUint8(byteOffset + 1))
                binary.setUint8(2, byteOffset + 2 >= byteLength ? 0 : dataView.getUint8(byteOffset + 2))
                binary.setUint8(3, byteOffset + 3 >= byteLength ? 0 : dataView.getUint8(byteOffset + 3))
                yield binary.getUint32(0, true)
              } else {
                yield dataView.getUint32(byteOffset, true)
              }
            }
          }
        }
      },
      tableJSONByteLength,
      tableBinaryByteLength,
    }
  }
}