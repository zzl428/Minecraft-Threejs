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

  constructor(camera) {
    // 处于方便考虑，将摄像机当成玩家，而不考虑引入额外的模型，此后对摄像机的操作，等价于对玩家的操作
    this.position = camera.position;

    // 设置出生位置
    camera.position.set(10, EYEHEIGHT + 32, 10);

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