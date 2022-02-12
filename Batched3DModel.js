import { BatchTableMap } from "./BatchTableMap"
import { FeatureTableMap, B3DM_GLOBAL_PROPERTY } from "./FeatureTableMap"
import { copyInOrder } from "./utils"

export class Batched3DModel {
  name = null
  _gltf = null
  _batchLength = null
  _batchTableMap = null
  _featureTableMap = null

  constructor(name, batchTableMap, featureTableMap, gltf) {
    if (name) this.name = name
    if (batchTableMap) this.batchTableMap = batchTableMap
    if (featureTableMap) this.featureTableMap = featureTableMap
    if (gltf) this.gltf = gltf
  }

  set gltf(value) {
    this._gltf = value
  }

  get gltf() {
    return this._gltf
  }

  set batchTableMap(value) {
    this._batchTableMap = value
  }

  get batchTableMap() {
    return this._batchTableMap
  }

  set featureTableMap(value) {
    this._featureTableMap = value
  }

  get featureTableMap() {
    return this._featureTableMap
  }

  set batchLength(value) {
    this._batchLength = value
  }

  get batchLength() {
    if (this.featureTableMap && this.featureTableMap.has(B3DM_GLOBAL_PROPERTY.BATCH_LENGTH)) {
      return this.featureTableMap.get(B3DM_GLOBAL_PROPERTY.BATCH_LENGTH)
    } else if (this.batchTableMap && typeof (this.batchTableMap.batchLength) === "number") {
      return this.batchTableMap.batchLength
    } else if (this.gltf) {
      return this.gltf.batchLength
    } else {
      return null
    }
  }

  async export(options) {
    if (!this.gltf) throw new Error("no gltf")
    if (!this.featureTableMap) this.featureTableMap = new FeatureTableMap()
    if (!this.batchTableMap) this.batchTableMap = new BatchTableMap()

    if (!this.featureTableMap.has(B3DM_GLOBAL_PROPERTY.BATCH_LENGTH)) {
      this.featureTableMap.set(B3DM_GLOBAL_PROPERTY.BATCH_LENGTH, this.batchLength)
    }
    if (typeof (this.batchTableMap.batchLength) !== "number") {
      this.batchTableMap.batchLength = this.batchLength
    }

    const {
      tableJSONIterator: featureTableJSONIterator,
      tableBinaryIterator: featureTableBinaryIterator,
      tableJSONByteLength: featureTableJSONByteLength,
      tableBinaryByteLength: featureTableBinaryByteLength,
    } = this.featureTableMap.export()

    const {
      tableJSONIterator: batchTableJSONIterator,
      tableBinaryIterator: batchTableBinaryIterator,
      tableJSONByteLength: batchTableJSONByteLength,
      tableBinaryByteLength: batchTableBinaryByteLength,
    } = this.batchTableMap.export()

    const glbBuffer = await this.gltf.export(options)

    const b3dmTotalByteLength = Math.ceil((28 +
      featureTableJSONByteLength +
      featureTableBinaryByteLength +
      batchTableJSONByteLength +
      batchTableBinaryByteLength +
      glbBuffer.byteLength) / 4) * 4

    const b3dmBuffer = new ArrayBuffer(b3dmTotalByteLength)
    const b3dmUint32Buffer = new Uint32Array(b3dmBuffer)

    // 设置文件类型为b3dm、版本号为1、文件总长度
    copyInOrder(b3dmUint32Buffer, [0x6d643362])
    copyInOrder(b3dmUint32Buffer, [1])
    copyInOrder(b3dmUint32Buffer, [b3dmTotalByteLength])

    // 分别设置featureTable和batchTable的json和binary的长度
    copyInOrder(b3dmUint32Buffer, [featureTableJSONByteLength])
    copyInOrder(b3dmUint32Buffer, [featureTableBinaryByteLength])
    copyInOrder(b3dmUint32Buffer, [batchTableJSONByteLength])
    copyInOrder(b3dmUint32Buffer, [batchTableBinaryByteLength])

    // 拷贝featureTable
    copyInOrder(b3dmUint32Buffer, featureTableJSONIterator)
    copyInOrder(b3dmUint32Buffer, featureTableBinaryIterator)

    // 拷贝batchTable
    copyInOrder(b3dmUint32Buffer, batchTableJSONIterator)
    copyInOrder(b3dmUint32Buffer, batchTableBinaryIterator)

    // 拷贝glb
    copyInOrder(b3dmUint32Buffer, new Uint32Array(glbBuffer))

    return b3dmBuffer
  }
}