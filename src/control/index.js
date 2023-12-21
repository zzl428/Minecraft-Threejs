import * as THREE from 'three'
import {HEIGHT, EYEHEIGHT, RUNSPEED, FREEZJUMP, HEAD, BODY} from '../constant'

class Control {
  pointerLockControls = null;
  terrain = null;
  player = null;

  // 记录每一帧人物的位移分量
  velocity = new THREE.Vector3();
  direction = new THREE.Vector3();
  canJump = false;
  jumpTime = Date.now();
  transition = 0;

  // 判断运动方向
  moveForward = false;
  moveLeft = false;
  moveBackward = false;
  moveRight = false;

  // 碰撞检测
  raycaster = new THREE.Raycaster();
  upCollide = false;
  downCollide = false;
  frontCollide = false;
  backCollide = false;
  leftCollide = false;
  rightCollide = false;

  aimMesh = null;
  aimMatrix = new THREE.Matrix4(); 

  constructor(pointerLockControls, terrain, player) {
    this.pointerLockControls = pointerLockControls;
    this.terrain = terrain;
    this.player = player;

    this.raycaster.near = 0;

    this.initListen()
  }

  handleKeyDown(e) {
    switch(e.code) {
      case 'KeyW': 
        // 向前
        this.moveForward = true;
        break;
      case 'KeyS':
        // 向后
        this.moveBackward = true;
        break;
      case 'KeyA': 
        // 向左
        this.moveLeft = true;
        break;
      case 'KeyD':
        // 向右
        this.moveRight = true;
        break;
      case 'Space':
        // 跳跃
        if (this.canJump) {
          this.jumpTime = Date.now();
          this.velocity.y += 7.82;
        }
        this.canJump = false;
        break;
    }
  }

  handleKeyUp(e) {
    switch(e.code) {
      case 'KeyW': 
        // 向前
        this.moveForward = false;
        break;
      case 'KeyS':
        // 向后
        this.moveBackward = false;
        break;
      case 'KeyA': 
        // 向左
        this.moveLeft = false;
        break;
      case 'KeyD':
        // 向右
        this.moveRight = false;
        break;
    }
  }

  initListen() {
    document.body.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.body.addEventListener('keyup', this.handleKeyUp.bind(this));
    document.body.addEventListener('mousedown', this.handleMousedown.bind(this))
  }

  aim() {
    // 获取周围坐标,判断坐标归属区块，并查找有无实体方块
    const coordinates = this.player
      .getAroundCoordinate(6)
      .map(item => this.terrain.hasBlock(item))
      .filter(item => item.type);

    if (coordinates.length == 0) return;

    // 模拟方块
    const geometry = new THREE.BoxGeometry();
    const matrix = new THREE.Matrix4();
    const simulateMesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial(), coordinates.length);
    coordinates.forEach((mesh, index) => {
      simulateMesh.setMatrixAt(index, matrix.makeTranslation(mesh.coordinate.x, mesh.coordinate.y, mesh.coordinate.z))
    });
    simulateMesh.instanceMatrix.needsUpdate = true

    const direction = this.pointerLockControls.getDirection(new THREE.Vector3()).normalize();
    this.raycaster.set(this.player.position, direction);
    this.raycaster.far = 5.5;

    const aimIntersections = this.raycaster.intersectObject( simulateMesh, false );
    if (aimIntersections.length == 0) {
      this.terrain.updateAim();
      this.aimMesh = null;
      return;
    }
    // console.log('aimIntersections', aimIntersections[0])
    this.aimMesh = aimIntersections[0];
    simulateMesh.getMatrixAt(this.aimMesh.instanceId, this.aimMatrix);
    this.terrain.updateAim(this.aimMatrix);
  }

  handleMousedown(e) {
    if (!this.pointerLockControls.isLocked) return;
    if (!this.aimMesh || !this.terrain.aimCoverMesh) return;

    if (e.button == 0) {
      console.log('left click');
      this.removeBlock();
    } else if (e.button == 2) {
      console.log('right click', this.aimMesh.faceIndex);
      this.addBlock();
    }
  }

  addBlock() {
    // faceIndex顺序为[0-右，1-右，2-左，3-左，4-上，5-上，6-下，7-下，8-前，9-前，10-后，11-后]
    const aimFace = this.aimMesh.faceIndex;
    if (!(aimFace >= 0 && aimFace <= 11)) return;
    const face = parseInt(aimFace / 2);
    let { x, y, z } = new THREE.Vector3().setFromMatrixPosition(this.aimMatrix);
    switch(+face) {
      case 0:
        // 右
        x++;
        break;
      case 1:
        // 左
        x--;
        break;
      case 2:
        // 上
        y++;
        break;
      case 3:
        // 下
        y--;
        break;
      case 4:
        // 后
        z++;
        break;
      case 5:
        // 前
        z--;
        break;
    }
    const newBlockCoordinate = {
      x: this.player.parseCoordinate(x),
      y: this.player.parseCoordinate(y),
      z: this.player.parseCoordinate(z)
    }
    if ( newBlockCoordinate.x == this.player.coordinate.x && newBlockCoordinate.z == this.player.coordinate.z) {
      const yDistance = this.player.position.y - y;
      if (yDistance > 0 && Math.abs(yDistance) < EYEHEIGHT) {
        console.log('add error 被人物阻挡',this.player.position.y - y)
        return;
      }
    }
    this.terrain.addBlock(newBlockCoordinate);
  }

  removeBlock() {
    const { x, y, z } = new THREE.Vector3().setFromMatrixPosition(this.aimMatrix);
    const aimBlockCoordinate = {
      x: this.player.parseCoordinate(x),
      y: this.player.parseCoordinate(y),
      z: this.player.parseCoordinate(z)
    }
    this.terrain.removeBlock(aimBlockCoordinate);
  }

  // 校正碰撞位移后的位置
  adjustPosition() {
    const { y } = this.pointerLockControls.getObject().position;
    // console.log('y', y)
    if (this.velocity.y == 0) {
      // 已落地
      const footPosition = Math.ceil(y - EYEHEIGHT - 0.5 - this.transition);
      this.pointerLockControls.getObject().position.y = footPosition + EYEHEIGHT + 0.5;
    }
  }

  // 碰撞检测
  detectCollision() {
    this.upCollide = false;
    this.downCollide = false;
    this.frontCollide = false;
    this.backCollide = false;
    this.leftCollide = false;
    this.rightCollide = false;

    // 获取周围坐标,判断坐标归属区块，并查找有无实体方块
    const coordinates = this.player
      .getAroundCoordinate()
      .map(item => this.terrain.hasBlock(item))
      .filter(item => item.type);

    if (coordinates.length == 0) return;

    // 模拟方块
    const geometry = new THREE.BoxGeometry();
    const matrix = new THREE.Matrix4();
    const simulateMesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial(), coordinates.length);
    coordinates.forEach((mesh, index) => {
      simulateMesh.setMatrixAt(index, matrix.makeTranslation(mesh.coordinate.x, mesh.coordinate.y, mesh.coordinate.z))
    });
    simulateMesh.instanceMatrix.needsUpdate = true

    // 检测上方
    if (this.velocity.y > 0) {
      // 办法：从头顶四个顶点分别发出射线，只要有物体解除即判定站稳
      // 四顶点位置计算复杂，暂时只发射一条射线，留待后续优化
      this.raycaster.set(this.player.position, new THREE.Vector3( 0, 1, 0 ));
      this.raycaster.far = HEIGHT - EYEHEIGHT;
      const headIntersections = this.raycaster.intersectObject( simulateMesh, false );
      this.upCollide = headIntersections.length > 0;
    } else if (this.player.coordinate.y != 0) {
      // 站在基岩上不用检测下方
      // 对于脚下，已知宽 0.45 格，深 0.225 格
      // 办法：从脚底四个顶点分别发出射线，只要有物体解除即判定站稳
      // 四顶点位置计算复杂，暂时只发射一条射线，留待后续优化
      this.raycaster.set(this.player.position, new THREE.Vector3( 0, -1, 0 ));
      this.raycaster.far = EYEHEIGHT + this.transition;
      const footIntersections = this.raycaster.intersectObject( simulateMesh, false );
      this.downCollide = footIntersections.length > 0;
    }

    // 向后运动不用检测前方
    if (!this.moveBackward) {
      // 办法：从身前顶点分别发出射线，只要有物体接触即判定有障碍
      // 顶点位置计算复杂，暂时只发射一条射线，留待后续优化
      // 对于斜着向前运动时，当角度过大，仍会出现卡墙问题，单射线的方案过于简单，同时不够精准，后续思路，沿着xz周平行发出射线，再与运动方向对比后判断是否阻塞
      const direction = this.pointerLockControls.getDirection(new THREE.Vector3()).setY(0).normalize();
      // 头部
      this.raycaster.far = Math.abs(this.velocity.z) * 2;
      this.raycaster.set(this.player.position, direction);
      const frontUpIntersections = this.raycaster.intersectObject( simulateMesh, false );
      // 身体
      this.raycaster.set({...this.player.position, y: this.player.position.y - 1}, direction);
      const frontDownIntersections = this.raycaster.intersectObject( simulateMesh, false );
      this.frontCollide = frontUpIntersections.length + frontDownIntersections.length;
    }

    // 向前运动不用检测后方
    if (!this.moveForward) {
      // 办法：从身后顶点分别发出射线，只要有物体接触即判定有障碍
      // 顶点位置计算复杂，暂时只发射一条射线，留待后续优化
      const direction = this.pointerLockControls.getDirection(new THREE.Vector3()).setY(0).normalize().negate();
      // 头部
      this.raycaster.far = HEAD.depth;
      this.raycaster.set(this.player.position, direction);
      const backUpIntersections = this.raycaster.intersectObject( simulateMesh, false );
      // 身体
      this.raycaster.far = BODY.depth + (HEAD.depth - BODY.depth) / 2;
      this.raycaster.set({...this.player.position, y: this.player.position.y - 1}, direction);
      const backDownIntersections = this.raycaster.intersectObject( simulateMesh, false );
      this.backCollide = backUpIntersections.length + backDownIntersections.length;
    }

    // 向左运动不用检测右侧
    if (!this.moveLeft) {
      // 办法：从身侧顶点分别发出射线，只要有物体接触即判定有障碍
      // 顶点位置计算复杂，暂时只发射一条射线，留待后续优化 
      const forward = this.pointerLockControls.getDirection(new THREE.Vector3()).setY(0).normalize();
      const direction = new THREE.Vector3(0, -1, 0).cross(forward);  //两向量垂直，结果为单位向量，无须归一化
      // 头部
      this.raycaster.far = HEAD.width / 2;
      this.raycaster.set(this.player.position, direction);
      const rightUpIntersections = this.raycaster.intersectObject( simulateMesh, false );
      // 身体
      this.raycaster.set({...this.player.position, y: this.player.position.y - 1}, direction);
      const rightDownIntersections = this.raycaster.intersectObject( simulateMesh, false );
      this.rightCollide = rightUpIntersections.length + rightDownIntersections.length;
    }

    // 向右运动不用检测左侧
    if (!this.moveRight) {
      const forward = this.pointerLockControls.getDirection(new THREE.Vector3()).setY(0).normalize();
      const direction = new THREE.Vector3(0, 1, 0).cross(forward);  //两向量垂直，结果为单位向量，无须归一化
      // 头部
      this.raycaster.far = HEAD.width / 2;
      this.raycaster.set(this.player.position, direction);
      const leftUpIntersections = this.raycaster.intersectObject( simulateMesh, false );
      // 身体
      this.raycaster.set({...this.player.position, y: this.player.position.y - 1}, direction);
      const leftDownIntersections = this.raycaster.intersectObject( simulateMesh, false );
      this.leftCollide = leftUpIntersections.length + leftDownIntersections.length;
    }
  }

  handleCollision() {
    // 底部碰撞
    if (this.downCollide) {
      this.velocity.y = Math.max( 0, this.velocity.y );

      if ((Date.now() - this.jumpTime) > FREEZJUMP) {
        this.canJump = true;
      }
    }

    if (this.upCollide) {
      this.velocity.y = -this.transition;
    }

    // 前方碰撞
    if (this.frontCollide) {
      this.velocity.z = Math.min(0, this.velocity.z);
    }

    // 后方碰撞
    if (this.backCollide) {
      this.velocity.z = Math.max(0, this.velocity.z);
    }

    // 左侧碰撞
    if (this.leftCollide) {
      this.velocity.x = Math.max(0, this.velocity.z);
    }


    // 右侧碰撞
    if (this.rightCollide) {
      this.velocity.x = Math.min(0, this.velocity.z);
    }
  }

  update(delta) {
    
    // 判断移动方向
    this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
    this.direction.x = Number( this.moveRight ) - Number( this.moveLeft );
    this.direction.normalize(); // this ensures consistent movements in all directions

    // 确保过度效果
    // 此处减速能把速度快速减到一个极小数，约等于0，能够不影响后续计算移动距离时的基准值，一旦有效帧失效，位移会快速递降到0附近
    // this.velocity.x -= this.velocity.x * 10.0 * delta;
    // this.velocity.z -= this.velocity.z * 10.0 * delta;
    // 过度效果较小，且无法统一不同帧率移动距离不同的问题，故舍去
    this.velocity.x = 0;
    this.velocity.z = 0;
    this.velocity.y -= 25 * delta;

    // 计算移动距离
    if ( this.moveForward || this.moveBackward ) {
      // 位移 = 方向 * 速度 * 时间
      this.velocity.z += this.direction.z * RUNSPEED * delta;
    }
		if ( this.moveLeft || this.moveRight ) {
      this.velocity.x += this.direction.x * RUNSPEED * delta;
    }

    // 预留一帧做缓冲
    this.transition = Math.abs(this.velocity.y * delta);

    this.detectCollision();
    this.handleCollision();

    // 移动，此API会沿着鼠标方向直线移动，自动将直线距离分解为x,y的距离
    this.pointerLockControls.moveRight( this.velocity.x );
    this.pointerLockControls.moveForward( this.velocity.z );

    this.pointerLockControls.getObject().position.y += this.velocity.y * delta;

    this.adjustPosition();

    // 确保人物不会掉到基岩之下
    const minY = EYEHEIGHT + 0.5;
    if ( this.pointerLockControls.getObject().position.y < minY ) {
      this.velocity.y = 0;
      this.pointerLockControls.getObject().position.y = minY;

      this.canJump = true;
    }

    this.aim();
  }
}

export default Control