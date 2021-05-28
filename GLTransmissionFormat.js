import { exportGltfFromTHREE } from "./utils"

// 临时解决方案，使用Three.js作为过渡，待理解glTF规范后重构
export class GLTransmissionFormat {
  glbBuffer = null

  async fromTHREE(input) {
    this.glbBuffer = await exportGltfFromTHREE(input, { binary: true })
  }

  get batchLength() {
    if (!this.glbBuffer) return null
    const jsonChunkLength = new DataView(this.glbBuffer.slice(12, 16)).getUint32(0, true)
    const jsonChunkBuffer = this.glbBuffer.slice(20, 20 + jsonChunkLength)
    const glbHeader = JSON.parse(new TextDecoder("utf-8").decode(new Uint8Array(jsonChunkBuffer)))
    const batchIdIndexArray = glbHeader?.meshes?.flatMap(({ primitives }) => primitives.map(p => p.attributes._BATCHID)).filter(i => typeof (i) === "number")

    if (!batchIdIndexArray || batchIdIndexArray.length === 0) return 0
    else return Math.max(...batchIdIndexArray.map(index => glbHeader.accessors[index].max[0])) + 1
  }

  export({ binary = true } = {}) {
    return this.glbBuffer
  }
}