import * as THREE from 'three'

import { torchGeometry } from "./geometry";
import { torchMaterial } from "./material";

// 火把
export const getTorch = () => {
  const newGeometry = new THREE.BoxGeometry();
  newGeometry.clone(torchGeometry);
  const torch = new THREE.Mesh(torchGeometry, torchMaterial);
  // 添加光源
  const pointLight = new THREE.PointLight( 0xffffff, 1, 10, 2 );
  pointLight.position.y += 0.4;
  torch.add( pointLight );
  return torch;
}

