import { BatchTableMap } from "./BatchTableMap"
import { FeatureTableMap } from "./FeatureTableMap"
import { copyUint8ToDataViewInOrder, copyUint32ToDataViewInOrder } from "./utils"

export class Batched3DModel {
  name = null
  _glbBuffer = null
  _batchLength = null
  _batchTableMap = null
  _featureTableMap = null

  constructor(name, batchTableMap, featureTableMap, glbBuffer) {
    if (name) this.name = name
    if (batchTableMap) this.batchTableMap = batchTableMap
    if (featureTableMap) this.featureTableMap = featureTableMap
    if (glbBuffer) this.glbBuffer = glbBuffer
  }

  set glbBuffer(value) {
    this._glbBuffer = value

    const jsonChunkLength = new DataView(value.slice(12, 16)).getUint32(0, true)
    const jsonChunkBuffer = value.slice(20, 20 + jsonChunkLength)
    const glbHeader = JSON.parse(new TextDecoder("utf-8").decode(new Uint8Array(jsonChunkBuffer)))
    const batchIdIndexArray = glbHeader?.meshes?.flatMap(({ primitives }) => primitives.map(p => p.attributes._BATCHID)).filter(i => typeof (i) === "number")

    if (!batchIdIndexArray || batchIdIndexArray.length === 0) this.batchLength = 0
    else this.batchLength = Math.max(...batchIdIndexArray.map(index => glbHeader.accessors[index].max[0])) + 1
  }

  get glbBuffer() {
    return this._glbBuffer
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
    return this._batchLength
  }

  export() {
    if (!this.glbBuffer) throw new Error("no glb buffer")
    if (!this.featureTableMap) this.featureTableMap = new FeatureTableMap()
    if (!this.batchTableMap) this.batchTableMap = new BatchTableMap()

    // TODO: batch_length有三处可被设置，分别是glb推导、batchTableMap设置、featureTableMap设置BATCH_LENGTH，优先级依次降低
    this.featureTableMap.set("BATCH_LENGTH", this.batchLength)
    this.batchTableMap.batchLength = this.batchLength

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

    const b3dmTotalByteLength = 28 +
      featureTableJSONByteLength +
      featureTableBinaryByteLength +
      batchTableJSONByteLength +
      batchTableBinaryByteLength +
      this.glbBuffer.byteLength

    const b3dmBuffer = new ArrayBuffer(b3dmTotalByteLength)
    const b3dmDataView = new DataView(b3dmBuffer)

    // 设置文件类型为b3dm、版本号为1、文件总长度
    copyUint32ToDataViewInOrder(b3dmDataView, [0x6233646d], false)
    copyUint32ToDataViewInOrder(b3dmDataView, [1], true)
    copyUint32ToDataViewInOrder(b3dmDataView, [b3dmTotalByteLength], true)

    // 分别设置featureTable和batchTable的json和binary的长度
    copyUint32ToDataViewInOrder(b3dmDataView, [featureTableJSONByteLength], true)
    copyUint32ToDataViewInOrder(b3dmDataView, [featureTableBinaryByteLength], true)
    copyUint32ToDataViewInOrder(b3dmDataView, [batchTableJSONByteLength], true)
    copyUint32ToDataViewInOrder(b3dmDataView, [batchTableBinaryByteLength], true)

    // 拷贝featureTable
    copyUint8ToDataViewInOrder(b3dmDataView, featureTableJSONIterator)
    copyUint8ToDataViewInOrder(b3dmDataView, featureTableBinaryIterator)

    // 拷贝batchTable
    copyUint8ToDataViewInOrder(b3dmDataView, batchTableJSONIterator)
    copyUint8ToDataViewInOrder(b3dmDataView, batchTableBinaryIterator)

    // 拷贝glb
    copyUint8ToDataViewInOrder(b3dmDataView, new Uint8Array(this.glbBuffer))

    return b3dmBuffer
  }
}