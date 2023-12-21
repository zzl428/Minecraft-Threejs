import * as THREE from 'three'

import './style.css'

import Core from './core'

const app = document.querySelector('#app');

const core = Core.getInstance(app);

const clock = new THREE.Clock();

let time = 0;

// 锁帧
const fpsLimit = 1 / 180;

const animate = () => {
  time += clock.getDelta();

  if (time >= fpsLimit) {
    time %= fpsLimit;
    core.update();
  }

  requestAnimationFrame( animate );
}

animate();