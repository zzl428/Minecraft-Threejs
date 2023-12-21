import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'

const initRenderer = (app) => {
  const renderer = new THREE.WebGLRenderer({antialias: false});
  app.appendChild(renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  return renderer;
}

const initStats = (app) => {
  const stats = new Stats();
  stats.domElement.classList.add('stats')
  app.appendChild(stats.domElement);
  return stats;
}

export {
  initRenderer,
  initStats
}