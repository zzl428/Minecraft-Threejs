import * as THREE from 'three'

const initScene = () => {
  const scene = new THREE.Scene();
  // 设置背景色
  const backgroundColor = 0x87ceeb

  scene.fog = new THREE.Fog(backgroundColor, 1, 150)
  scene.background = new THREE.Color(backgroundColor);

  // 设置坐标轴
  // const axesHelper = new THREE.AxesHelper( 16 );
  // axesHelper.position.set(0, 20, 0)
  // scene.add( axesHelper );

  // 设置网格平面
  // const size = 100;
  // const divisions = 100;
  // const gridHelper = new THREE.GridHelper( size, divisions );
  // scene.add( gridHelper );

  // 设置灯光
  // const light = new THREE.AmbientLight( 0xffffff )
  // scene.add(light)

  const ambientLight = new THREE.AmbientLight( 0xeeeeee, 1 );
  scene.add( ambientLight );

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set( 0, 1000, 0 ).normalize();
  scene.add( directionalLight );

  return scene;
}

export {
  initScene
}