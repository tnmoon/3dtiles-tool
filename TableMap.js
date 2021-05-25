import { isTypedArray, sumArray, stringCharCodeIterator } from "./utils"

export class TableMap extends Map {

  constructor() {
    super()
  }

  export() {
    const tableJSON = this.exportTableJSON()
    const tableJSONString = Object.keys(tableJSON).length === 0 ? "" : JSON.stringify(tableJSON)
    const tableBinary = this.exportTableBinary()

    return {
      tableJSONIterator: stringCharCodeIterator(tableJSONString),
      tableJSONByteLength: tableJSONString.length,
      tableBinaryIterator: {
        *[Symbol.iterator]() {
          for (const { buffer } of tableBinary) {
            const dataView = new DataView(buffer)
            const byteLength = buffer.byteLength
            for (let index = 0; index < byteLength; index++) {
              yield dataView.getUint8(index)
            }
            for (let index = 0; index < 4 * Math.ceil(byteLength / 4) - byteLength; index++) {
              yield 0 // 保证每个property的二进制段都是4字节对齐的
            }
          }
        }
      },
      tableBinaryByteLength: sumArray(tableBinary.map(({ buffer }) => 4 * Math.ceil(buffer.byteLength / 4))),
    }
  }
}