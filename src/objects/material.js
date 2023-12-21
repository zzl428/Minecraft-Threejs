import * as THREE from 'three'

import grassSidePic from '../assets/imgs/blocks/grass_block_side.png'
import grassTopPic from '../assets/imgs/blocks/grass_top_green.png'
import dirtPic from '../assets/imgs/blocks/dirt.png'
import stonePic from '../assets/imgs/blocks/stone.png'
import bedRockPic from '../assets/imgs/blocks/bedrock.png'
import stevePic from '../assets/imgs/character/steve.png'
import torchPic from '../assets/imgs/blocks/torch_on.png'

import {chunkSize} from '../constant'

const loader = new THREE.TextureLoader()

// 基岩
const bedRockSide1 = loader.load(bedRockPic);
bedRockSide1.magFilter = THREE.NearestFilter;
bedRockSide1.wrapS = THREE.RepeatWrapping;
bedRockSide1.wrapT = THREE.RepeatWrapping;
bedRockSide1.repeat.set( chunkSize.width, chunkSize.width );
const bedRockSide2 = loader.load(bedRockPic);
bedRockSide2.magFilter = THREE.NearestFilter;
bedRockSide2.wrapS = THREE.RepeatWrapping;
bedRockSide2.repeat.set( chunkSize.width, 1 );
const bedRockTexture = [bedRockSide2, bedRockSide2, bedRockSide1, bedRockSide1, bedRockSide2, bedRockSide2]
export const bedRockMaterial = bedRockTexture.map(item => new THREE.MeshBasicMaterial({map: item}));

// 泥土
const dirtTexture = loader.load(dirtPic);
dirtTexture.magFilter = THREE.NearestFilter;
export const dirtMaterial = new THREE.MeshStandardMaterial({ map: dirtTexture });

// 草
const grassSide = loader.load(grassSidePic);
grassSide.magFilter = THREE.NearestFilter;
const grassTop = loader.load(grassTopPic)
grassTop.magFilter = THREE.NearestFilter;
const grassTexture = [grassSide, grassSide, grassTop, dirtTexture, grassSide, grassSide];
export const grassMaterial = grassTexture.map(item => new THREE.MeshStandardMaterial({map: item}));

// 石头
const stoneTexture = loader.load(stonePic);
stoneTexture.magFilter = THREE.NearestFilter;
export const stoneMaterial = new THREE.MeshStandardMaterial({ map: stoneTexture });

// 火把
const torchTexture = loader.load(torchPic);
torchTexture.magFilter = THREE.NearestFilter;
export const torchMaterial = new THREE.MeshStandardMaterial({ map: torchTexture });


// const materials = {
//   // 基岩
//   bedRock: {
//     material: bedRockTexture.map(item => new THREE.MeshBasicMaterial({map: item})),
//   },
//   // 泥土
//   dirt: {
//     material: new THREE.MeshStandardMaterial({ map: dirtTexture }),
//   },
//   // 石头
//   stone: {
//     material: new THREE.MeshStandardMaterial({ map: stoneTexture }),
//   },
//   // 草地
//   grass: {
//     material: grassTexture.map(item => new THREE.MeshStandardMaterial({map: item})),
//   },
//   // 史蒂夫
//   // steve: {
//   //   material: new THREE.MeshLambertMaterial({ map: loader.load(stevePic) }),
//   // }
// }

// export {
//   materials
// }