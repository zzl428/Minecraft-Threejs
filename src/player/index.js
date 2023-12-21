import * as THREE from 'three'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'

import Minecraft_Simple_Rig from '../assets/imgs/character/Minecraft_Simple_Rig.obj'

import {EYEHEIGHT} from '../constant'

class Player {
  position = {
    x: 0,
    y: 0,
    z: 0
  };
  dom = document.querySelector('#coordinate');
  coordinate = {
    x: 0,
    y: 0,
    z: 0
  }
  
  // constructor(scene) {
  //   const group = new THREE.Group();
  //   // 图片像素 64*64
  //   const steveMaterial = materials.steve.material;

  //   const headBox = new THREE.BoxGeometry(0.45, 0.45, 0.45);
  //   const headUvs = new Float32Array([
  //     // 右侧面
  //     16/64, (64-8)/64, //左上
  //     24/64, (64-8)/64, //右上
  //     16/64, (64-16)/64, //左下
  //     24/64, (64-16)/64,  //右下
  //     // 左侧面
  //     0, (64-8)/64, 
  //     8/64, (64-8)/64, 
  //     0, (64-16)/64, 
  //     8/64, (64-16)/64,
  //     // 上侧面
  //     8/64, 1, 
  //     16/64, 1, 
  //     8/64, (64-8)/64, 
  //     16/64, (64-8)/64,
  //     // 下侧面
  //     16/64, 1, 
  //     24/64, 1, 
  //     16/64, (64-8)/64, 
  //     24/64, (64-8)/64,
  //     // 前侧面
  //     8/64, (64-8)/64, 
  //     16/64, (64-8)/64, 
  //     8/64, (64-16)/64, 
  //     16/64, (64-16)/64,
  //     // 后侧面
  //     24/64, (64-8)/64,
  //     32/64, (64-8)/64,
  //     24/64, (64-16)/64,
  //     32/64, (64-16)/64, 
  //   ]);
  //   headBox.attributes.uv = new THREE.BufferAttribute(headUvs, 2);
  //   const head = new THREE.Mesh(headBox, steveMaterial);
  //   group.add(head);
  //   scene.add(group)
  // }
  // constructor(scene) {
  //   const loader = new OBJLoader();
  //   loader.load(Minecraft_Simple_Rig, simple => {
  //     // 
  //     // simple.position.set(0, -0.5, 0)
  //     const obj = new THREE.Box3().setFromObject(simple);
  //     const scale = this.height / (obj.max.y - obj.min.y);
  //     simple.scale.set(scale , scale, scale)
  //     console.log('simple', simple.position)
  //     // 校准站在基岩上时的Y偏移量
  //     const adjustingY = -obj.min.y * scale;
  //     scene.add(simple);
  //     this.mc = simple;
  //   });
  // }

  constructor(camera) {
    // 处于方便考虑，将摄像机当成玩家，而不考虑引入额外的模型，此后对摄像机的操作，等价于对玩家的操作
    this.position = camera.position;

    // 设置出生位置
    camera.position.set(0, EYEHEIGHT + 32, 0);

    this.updateCoordinate()
  }

  update(camera) {
    this.position = camera.position;
    this.updateCoordinate();
  }

  updateCoordinate() {
    this.coordinate.x = this.parseCoordinate(this.position.x);
    this.coordinate.y = this.parseCoordinate((this.position.y - EYEHEIGHT).toFixed(3));
    this.coordinate.z = this.parseCoordinate(this.position.z);
    this.dom.innerHTML = `坐标：${this.coordinate.x}, ${this.coordinate.y}, ${this.coordinate.z};
    真实位置：${this.position.x.toFixed(3)}, ${this.position.y.toFixed(3)}, ${this.position.z.toFixed(3)}`
  }

  // 位置转化为坐标：向下取整
  parseCoordinate(number) {
    return Math.floor(+number + 0.5);
  }

  getAroundCoordinate(radius = 1) {
    const aroundCoordinate = [];
    // 底部,y不变
    for (let y = this.coordinate.y - radius; y <= this.coordinate.y + (radius == 1 ? 2 : radius); y++) {
      for (let x = this.coordinate.x - radius; x <= this.coordinate.x + radius; x++) {
        for (let z = this.coordinate.z - radius; z <= this.coordinate.z + radius; z++) {
          aroundCoordinate.push({x, y, z});
        }
      }
    }
    
    return aroundCoordinate;
  }
}

export default Player