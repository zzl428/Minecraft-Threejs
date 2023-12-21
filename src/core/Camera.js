import * as THREE from 'three'

const initCamera = () => {
  const fov = 60; //摄像机视锥体垂直视野角度
  const aspect = window.innerWidth / window.innerHeight;  //摄像机视锥体长宽比
  const near = 0.01; //摄像机视锥体近端面
  const far = 20000;  //摄像机视锥体远端面

  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );

  return camera;
}

export {
  initCamera
}