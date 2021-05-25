import { TableMap } from "./TableMap"
import { PropertyOffsetAccumulator, arrayToObject, isTypedArray } from "./utils"

export class FeatureTableMap extends TableMap {
  constructor() {
    super()
  }

  set(key, value) {
    if (!Object.values(B3DM_GLOBAL_PROPERTY).includes(key)
      && !Object.values(I3DM_GLOBAL_PROPERTY).includes(key)
      && !Object.values(I3DM_PERINSTANCE_PROPERTY).includes(key)) {
      throw new Error("unkonw feature table key")
    }
    super.set(key, value)
  }

  exportTableJSON() {
    const offsetAccumulator = new PropertyOffsetAccumulator()
    return arrayToObject([...this.entries()].map(([key, value]) => ({
      [key]: isTypedArray(value) ? {
        byteOffset: offsetAccumulator.add(value),
      } : value
    })))
  }

  exportTableBinary() {
    return [...this.values()].filter(array => isTypedArray(array))
  }
}

export const B3DM_GLOBAL_PROPERTY = {
  BATCH_LENGTH: "BATCH_LENGTH",
  RTC_CENTER: "RTC_CENTER",
}

export const I3DM_GLOBAL_PROPERTY = {
  INSTANCES_LENGTH: "INSTANCES_LENGTH",
  QUANTIZED_VOLUME_OFFSET: "QUANTIZED_VOLUME_OFFSET",
  QUANTIZED_VOLUME_SCALE: "QUANTIZED_VOLUME_SCALE",
  EAST_NORTH_UP: "EAST_NORTH_UP",
  RTC_CENTER: "RTC_CENTER",
}

export const I3DM_PERINSTANCE_PROPERTY = {
  POSITION: "POSITION",
  POSITION: "POSITION",
  POSITION_QUANTIZED: "POSITION_QUANTIZED",
  NORMAL_UP: "NORMAL_UP",
  NORMAL_UP_OCT32P: "NORMAL_UP_OCT32P",
  NORMAL_RIGHT: "NORMAL_RIGHT",
  NORMAL_RIGHT_OCT32P: "NORMAL_RIGHT_OCT32P",
  SCALE: "SCALE",
  SCALE_NON_UNIFORM: "SCALE_NON_UNIFORM",
  BATCH_ID: "BATCH_ID",
}