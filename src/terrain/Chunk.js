import * as THREE from 'three'

import {chunkSize} from '../constant'
import { bedRockMaterial, stoneMaterial, grassMaterial, dirtMaterial } from '../objects/material';

import Noise from './Noise';

export default class Chunk {
  width = chunkSize.width;
  height = chunkSize.height;
  depth = chunkSize.depth;

  // 区块坐标
  chunkX = 1;
  chunkZ = 1;

  // 位置坐标偏移
  coordinateOffsetX = 0;
  coordinateOffsetZ = 0;

  // 区块内方块
  blockMap = new Map();
  // 基岩
  bedRock = null;
  // 云层
  cloud = null;
  // 预生成的地形方块
  defaultBlock = {
    stone: null,
    grass: null,
    dirt: null,
  }
  // 自定义方块
  customBlock = new Map();

  noise = Noise.getInstance()
  
  constructor({ chunkX = 0, chunkZ = 0 }) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;

    this.coordinateOffsetX = chunkX << 4;
    this.coordinateOffsetZ = chunkZ << 4;

    // 生成基岩
    this.generateBedrock();

    // 生成地貌
    this.generateTerrain();

    // 生成云层
    this.generateCloud();
  }

  generateBedrock() {
    const geometry = new THREE.BoxGeometry(this.width, 1, this.depth);
    const bedRock = new THREE.Mesh(geometry, bedRockMaterial);

    // 设置位置偏移
    bedRock.position.set(this.coordinateOffsetX + this.width / 2 - 0.5, 0, this.coordinateOffsetZ + this.depth / 2 - 0.5);
    this.bedRock = bedRock;
  }

  generateTerrain() {
    const stones = [];
    const grasses = [];
    const dirts = [];

    const line = 8;

    for (let x = this.coordinateOffsetX; x < this.coordinateOffsetX + this.width; x++) {
      for (let z = this.coordinateOffsetZ; z < this.coordinateOffsetZ + this.depth; z++) {
        // 计算每个点位的海拔高度，范围从 0 - 16,设海平面为6
        const height = Math.floor(this.noise.getHeight(x, z));

        if (height > line) {
          grasses.push({x, y: height, z});
          this.blockMap.set(`${x},${height},${z}`, {
            type: 'grass',
            category: 'default',
            instanceId: grasses.length - 1
          });
        } else {
          stones.push({x, y: height, z});
          this.blockMap.set(`${x},${height},${z}`, {
            type: 'stone',
            category: 'default',
            instanceId: stones.length - 1
          });
        }

        for (let y = 1; y < height; y++) {
          // 靠近基岩部分不进行渲染，节省性能
          if (y < 3) continue;
          const density = this.noise.getDensity(x, y, z);
          if (y <= line && density > 0.75) {
            // 密度小于等于0为空气，否则为石头
            stones.push({x, y, z});
            this.blockMap.set(`${x},${y},${z}`, {
              type: 'stone',
              category: 'default',
              instanceId: stones.length - 1
            });
          }
          if (y > line) {
            dirts.push({x, y, z});
            this.blockMap.set(`${x},${y},${z}`, {
              type: 'dirt',
              category: 'default',
              instanceId: dirts.length - 1
            });
          }
        }
      }
    }

    const geometry = new THREE.BoxGeometry();
    const matrix = new THREE.Matrix4();

    const stoneInstancedMesh = new THREE.InstancedMesh(geometry, stoneMaterial, stones.length);
    stones.forEach((stone, index) => {
      stoneInstancedMesh.setMatrixAt(index, matrix.makeTranslation(stone.x, stone.y, stone.z))
    })
    this.defaultBlock.stone = stoneInstancedMesh;

    const grassInstancedMesh = new THREE.InstancedMesh(geometry, grassMaterial, grasses.length);
    grasses.forEach((grass, index) => {
      grassInstancedMesh.setMatrixAt(index, matrix.makeTranslation(grass.x, grass.y, grass.z))
    })
    this.defaultBlock.grass = grassInstancedMesh;

    const dirtInstancedMesh = new THREE.InstancedMesh(geometry, dirtMaterial, dirts.length);
    dirts.forEach((dirt, index) => {
      dirtInstancedMesh.setMatrixAt(index, matrix.makeTranslation(dirt.x, dirt.y, dirt.z))
    })
    this.defaultBlock.dirt = dirtInstancedMesh;
  }

  generateCloud() {
    if (this.noise.getNoise(this.chunkX, this.chunkZ) < 0.25) return;
    const geometry = new THREE.BoxGeometry(16, 4, 16);
    const cloud = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        transparent: true,
        color: 0xffffff,
        opacity: 1
      })
    );

    // 设置位置偏移
    const x = this.coordinateOffsetX + this.width / 2 - 0.5;
    const y = 100;
    const z = this.coordinateOffsetZ + this.depth / 2 - 0.5;
    cloud.position.set( x, y, z );
    this.cloud = cloud;
  }

  load(scene) {
    scene.add(this.bedRock);
    this.cloud && scene.add(this.cloud);
    Object.keys(this.defaultBlock).forEach(key => {
      const block = this.defaultBlock[key];
      if (!block) return;
      scene.add(block);
    });
    this.customBlock.forEach(mesh => {
      scene.add(mesh)
    })
  }

  unload(scene) {
    scene.remove(this.bedRock);
    this.cloud && scene.remove(this.cloud);
    Object.keys(this.defaultBlock).forEach(key => {
      const block = this.defaultBlock[key];
      if (!block) return;
      scene.remove(block)
    });
    this.customBlock.forEach(mesh => {
      scene.remove(mesh)
    })
  }

  parseKey(coordinate) {
    return `${coordinate.x},${coordinate.y},${coordinate.z}`;
  }

  getBlock(coordinate) {
    const key = this.parseKey(coordinate);
    if (!this.blockMap.has(key)) return false;
    return {
      type: this.blockMap.get(key).type,
      coordinate
    }
  }

  addBlock(coordinate, type, scene) {
    const key = this.parseKey(coordinate);
    if (this.blockMap.has(key)) {
      console.log('add error，此位置已有方块', coordinate)
      return;
    }
    // 新增必为自定义方块
    const geometry = new THREE.BoxGeometry();
    let newMesh = new THREE.Mesh(geometry, type.material);

    if (type.category == 'tool') {
      newMesh = type.mesh();
    }
    
    this.blockMap.set(key, {
      type: type.key,
      category: 'custom',
    });
    this.customBlock.set(key, newMesh);

    newMesh.position.set(coordinate.x, coordinate.y, coordinate.z);
    scene.add(newMesh);
  }

  removeBlock(coordinate, scene) {
    const key = this.parseKey(coordinate);
    const block = this.blockMap.get(key);
    if (!block) return false;

    switch(block.category) {
      case 'default':
        // 默认
        if (!block.instanceId && block.instanceId != 0) return;

        const instanceMesh = this.defaultBlock[block.type];
        if (!instanceMesh) return;

        instanceMesh.setMatrixAt(block.instanceId, new THREE.Matrix4().set(...new Array(16).fill(0)));
        instanceMesh.instanceMatrix.needsUpdate = true;

        this.blockMap.delete(key);
        break;
      case 'custom':
        // 自定义
        scene.remove(this.customBlock.get(key));
        this.blockMap.delete(key);
        this.customBlock.delete(key);
        break;
    }
  }
}