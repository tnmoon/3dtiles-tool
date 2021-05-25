3dtiles-tool
========

#### 3DTiles Generate Tool ####

3DTiles规范包括了诸如GLTF、B3DM、PNTS、JSON等多种类型的文件，本工具库主要是为生成及组装这些文件提供便利。当前，仅支持从Three.js对象导出GLB及生成B3DM文件两大功能，后续还将不断完善。

### Usage ###

1.首先，根据Three.js对象生成GLB文件，其中batchId数组需要依据业务需求填充相应值，具体请参考3DTiles规范文档。
```javascript
import { exportGlbBufferFromTHREE } from "3dtiles-tool"
import * as THREE from "three"

const blockFaceAttribute = {
  batchId: new Uint16Array(visibleTriangleFaceCount * 3),
  position: new Float64Array(visibleTriangleFaceCount * 9),
  normal: new Float64Array(visibleTriangleFaceCount * 9),
  color: new Float32Array(visibleTriangleFaceCount * 12),
}

const blockFaceGeometry = new THREE.BufferGeometry()
blockFaceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(blockFaceAttribute.position, 3))
blockFaceGeometry.setAttribute('color', new THREE.Float32BufferAttribute(blockFaceAttribute.color, 4))
blockFaceGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(blockFaceAttribute.normal, 3))
blockFaceGeometry.setAttribute('batchId', new THREE.Uint16BufferAttribute(blockFaceAttribute.batchId, 1))

const blockFaceMesh = new THREE.Mesh(blockFaceGeometry, new THREE.MeshPhongMaterial({
  vertexColors: THREE.FaceColors,
  flatShading: true,
}))

const glbBuffer = await exportGlbBufferFromTHREE(blockFaceMesh)
```

2.接着，根据业务需求制作batchTable和featureTable对象。若业务上对此无需求，也可不构造相应的table对象，并在下一步中省略为b3dm对象赋该值。当为batchTable对象添加属性时，它将根据batchLength值和传入的typedArray类型及长度自动生成对应的JSON Header。当为featureTable对象添加属性时，属性的key值必须为3DTiles规范内合法的key值，这将由常量B3DM_GLOBAL_PROPERTY所记载，超出该常量范围的key值将导致报错。另外，BATCH_LENGTH这种特殊的featureTable属性可由Batched3DModel对象根据GLB推导得出，可省略设置。
```javascript
import { BatchTableMap, FeatureTableMap, B3DM_GLOBAL_PROPERTY } from "3dtiles-tool"

const batchLength = 100
const batchTableMap = new BatchTableMap()
batchTableMap.set("verticeIndex", new Uint16Array(batchLength))
batchTableMap.set("cellIndex", new Uint16Array(3 * batchLength))

const featureTableMap = new FeatureTableMap()
featureTableMap.set(B3DM_GLOBAL_PROPERTY.RTC_CENTER, new Float32Array([1, 2, 3]))
```

3.最后，构造Batched3DModel对象并设置相应属性后，调用export()方法即可将以上三者拼接成B3DM文件。该方法返回值为ArrayBuffer对象，可直接作为二进制数据流存入数据库或写入文件。
```javascript
import { Batched3DModel } from "3dtiles-tool"

const b3dm = new Batched3DModel()
b3dm.glbBuffer = glbBuffer
b3dm.batchTableMap = batchTableMap
b3dm.featureTableMap = featureTableMap

const buffer = b3dm.export()
```

[npm-url]: https://www.npmjs.com/package/3dtiles-tool