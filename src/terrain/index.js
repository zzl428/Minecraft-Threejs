import * as THREE from 'three'

import Chunk from './Chunk.js'
import {radius} from '../constant'

export default class Terrain {
  scene = null;
  ui = null;
  chunkMap = new Map();
  loadingChunk = new Map();
  centerChunk = {
    chunkX: 1,
    chunkZ: 1
  }

  aimCoverMesh = null;

  constructor(coordinate, ui, scene) {
    this.scene = scene;
    this.ui = ui;

    // 给每个区块编号,采用逗号连接法,比如从(0, 0)到(16, 16)的区域,属于区块 1,1
    // 取得区块编号
    const chunkOffset = this.getChunkOffset(coordinate);
    // 加载当前区块
    this.loadChunk(chunkOffset);
    // 加载周围区块
    const aroundChunks = this.getAroundChunkOffset(chunkOffset);
    aroundChunks.forEach(offset => this.loadChunk(offset));

    console.log('map', this.chunkMap)
  }

  loadChunk({chunkX, chunkZ}) {
    const key = this.parseKey(chunkX, chunkZ);
    let chunk = null;
    if (this.chunkMap.has(key)) {
      // 已创建过
      chunk = this.chunkMap.get(key).chunk;
    } else {
      // 创建新的区块并记录
      chunk = new Chunk({ chunkX, chunkZ });
      this.chunkMap.set(key, {chunk, state: 'load'});
    }
    chunk.load(this.scene);
    this.loadingChunk.set(key, {chunkX, chunkZ});
  }

  unloadChunk({chunkX, chunkZ}) {
    const key = this.parseKey(chunkX, chunkZ);
    const chunk = this.chunkMap.get(key)?.chunk;
    if (!chunk) return;
    chunk.unload(this.scene);
    this.loadingChunk.delete(key)
  }

  getAroundChunkOffset({chunkX, chunkZ}) {
    const offsets = [];
    for (let x = chunkX - radius; x <= chunkX + radius; x++) {
      for (let z = chunkZ - radius; z <= chunkZ + radius; z++) {
        if (x == chunkX && z == chunkZ) continue;
        offsets.push({ chunkX: x, chunkZ: z });
      }
    }
    return offsets;
  }

  getChunkOffset(coordinate) {
    // 区块坐标以16的倍数为分界
    const { x, z } = coordinate;
    return { chunkX: x >> 4, chunkZ: z >> 4 };
  }

  parseKey(chunkX, chunkZ) {
    return `${chunkX},${chunkZ}`;
  }

  hasBlock(coordinate) {
    const {chunkX, chunkZ} = this.getChunkOffset(coordinate);
    const key = this.parseKey(chunkX, chunkZ);
    const chunk = this.chunkMap.get(key)?.chunk;
    if (!chunk) return false;
    return chunk.getBlock(coordinate);
  }

  addBlock(coordinate) {
    if (!this.ui.currentBlock) {
      console.log('add error，未选择要放置的方块')
      return;
    }
    const {chunkX, chunkZ} = this.getChunkOffset(coordinate);
    const key = this.parseKey(chunkX, chunkZ);
    const chunk = this.chunkMap.get(key)?.chunk;
    if (!chunk) return false;
    chunk.addBlock(coordinate, this.ui.currentBlock, this.scene);
  }

  removeBlock(coordinate) {
    const {chunkX, chunkZ} = this.getChunkOffset(coordinate);
    const key = this.parseKey(chunkX, chunkZ);
    const chunk = this.chunkMap.get(key)?.chunk;
    if (!chunk) return false;
    chunk.removeBlock(coordinate, this.scene);
  }

  update(position) {
    const {chunkX, chunkZ} = this.getChunkOffset(position);
    if (this.centerChunk.chunkX == chunkX && this.centerChunk.chunkZ == chunkZ) return;
    console.log('chunk update', this.loadingChunk);
    this.centerChunk = { chunkX, chunkZ };
    const newAroundChunks = this.getAroundChunkOffset({chunkX, chunkZ});

    this.loadingChunk.forEach(chunk => {
      if (chunk.chunkX == chunkX && chunk.chunkZ == chunkZ) return;
      if (newAroundChunks.find(offset => chunk.chunkX == offset.chunkX && chunk.chunkZ == offset.chunkZ)) return;
      // 如果新的包围圈不包含旧的，则进行卸载
      this.unloadChunk(chunk);
    })

    newAroundChunks.forEach(offset => {
      const key = this.parseKey(offset.chunkX, offset.chunkZ);
      if (this.loadingChunk.has(key)) return;
      this.loadChunk(offset)
    })
  }

  updateAim(aimMatrix) {
    // 移除旧的选中块
    this.scene.remove(this.aimCoverMesh);
    this.aimCoverMesh = null;

    if (!aimMatrix) return;


    const geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01)
    const material = new THREE.MeshStandardMaterial({
      transparent: true,
      color: 0xffffff,
      opacity: 0.25
    })
    const aimCoverMesh = new THREE.Mesh(geometry, material);
    aimCoverMesh.applyMatrix4(aimMatrix);
    this.scene.add(aimCoverMesh);
    this.aimCoverMesh = aimCoverMesh;
  }
}