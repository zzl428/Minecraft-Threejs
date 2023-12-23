import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'

import { initScene } from './Scene';
import { initRenderer, initStats } from './Renderer';
import { initCamera } from './Camera';

import Player from '../player'
import Terrain from '../terrain'
import Control from '../control'
import UI from '../ui'

const clock = new THREE.Clock();

export default class Core {
  app = null;
  scene = initScene();
  renderer = null;
  Coordinates = null;
  camera = initCamera();
  stats = null;
  player = null;
  terrain = null;
  controls = null;
  ui = new UI();

  constructor(app) {
    this.app = app;
    this.renderer = initRenderer(app);
    this.stats = initStats(app);

    // 添加轨道控制器
    // this.Coordinates = new OrbitControls(this.camera, this.renderer.domElement);

    // 初始化玩家
    this.player = new Player(this.camera);

    // 初始化地形
    this.terrain = new Terrain(this.player.coordinate, this.ui, this.scene);

    // 初始化控制模块
    const pointerLockControls = new PointerLockControls(this.camera, this.app);
    this.controls = new Control(pointerLockControls, this.terrain, this.player);

    this.listen();
  }

  update() {
    const delta = clock.getDelta();
    this.stats.update();
    // this.Coordinates.update();

    if (this.controls.pointerLockControls.isLocked) {
      this.player.update(this.camera);
      this.terrain.update(this.player.position);
      this.controls.update(delta);
    }

    this.renderer.render( this.scene, this.camera );
  }

  listen() {
    // 视口改变
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
      this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
      this.camera.updateProjectionMatrix();
    })

    document.querySelector("#start").addEventListener('click', () => {
      if (!this.controls.pointerLockControls.isLocked) {
        this.controls.pointerLockControls.lock();
      }
    });

    this.controls.pointerLockControls.addEventListener( 'lock', () => {
      document.querySelector("#start").style.display = 'none';
      document.querySelector(".aim").style.display = 'unset';
    });

    this.controls.pointerLockControls.addEventListener( 'unlock', () => {
      document.querySelector("#start").style.display = 'unset';
      document.querySelector('.aim').style.display = 'none';
      
      this.controls.pointerLockControls.unlock();
    });

    document.addEventListener('wheel', (e) => {
      if (this.controls.pointerLockControls.isLocked) {
        this.ui.update(e.wheelDelta);
      }
    })
  }

  // 确保全局只返回一个类单例
  static getInstance(app) {
    // 判断是否已经new过1个实例
    if (!Core.instance) {
      // 若这个唯一的实例不存在，那么先创建它
      Core.instance = new Core(app)
    }
    // 如果这个唯一的实例已经存在，则直接返回
    return Core.instance
  }
}