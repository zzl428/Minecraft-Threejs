import * as THREE from 'three'

// const torch = new THREE.Group();
// const torchBody = new THREE.BufferGeometry(0.2, 0.6, 0.2);

export const torchGeometry = new THREE.BoxGeometry(0.15, 0.7, 0.15);

const headUvs = new Float32Array([
      // 右侧面
      .56, .625,  //右下
      .44, .625, //左下
      .56, 0, //右上
      .44, 0, //左上
      // 左侧面
      .56, .625,  //右下
      .44, .625, //左下
      .56, 0, //右上
      .44, 0, //左上
      // 上侧面
      .56, .625,  //右下
      .44, .625, //左下
      .56, .57, //右上
      .44, .57, //左上
      // 下侧面
      .56, .625,  //右下
      .44, .625, //左下
      .56, .65, //右上
      .44, .65, //左上
      // 前侧面
      .56, .625,  //右下
      .44, .625, //左下
      .56, 0, //右上
      .44, 0, //左上
      // 后侧面
      .56, .625,  //右下
      .44, .625, //左下
      .56, 0, //右上
      .44, 0, //左上
    ]);
torchGeometry.attributes.uv = new THREE.BufferAttribute(headUvs, 2)