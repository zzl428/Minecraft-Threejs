import grassIcon from '../assets/imgs/icons/grass.png'
import stoneIcon from '../assets/imgs/icons/stone.png'
import dirtIcon from '../assets/imgs/icons/dirt.webp'
import torchIcon from '../assets/imgs/icons/torch.png'
import { bedRockMaterial, stoneMaterial, grassMaterial, dirtMaterial } from '../objects/material';
import { getTorch } from '../objects/mesh';

class UI {
  // 当前选中物品栏
  current = 0;
  // 物品栏数量
  count = 9;
  // 物品顺序
  block = [
    {
      key: 'grass',
      icon: grassIcon,
      material: grassMaterial
    },
    {
      key: 'stone',
      icon: stoneIcon,
      material: stoneMaterial
    },
    {
      key: 'dirt',
      icon: dirtIcon,
      material: dirtMaterial
    },
    {
      key: 'torch',
      icon: torchIcon,
      mesh: getTorch,
      category: 'tool'
    }
  ];

  constructor() {
    this.initHandyBar();
  }

  get currentBlock() {
    return this.block[this.current]
  }

  initHandyBar() {
    const dom = document.querySelector('.handy-bar');
    for(let i = 0; i < this.count; i++) {
      const child = document.createElement('div');
      child.className = 'handy-bar-item';
      if (i == 0) {
        child.classList.add('active')
      }
      if (this.block[i]) {
        const pic = document.createElement('img');
        pic.src = this.block[i].icon;
        child.appendChild(pic)
      }
      
      dom.appendChild(child)
    }
  }

  update(arrow) {
    if (arrow < 0) {
      this.current++;
      if (this.current > this.count - 1) {
        this.current = 0;
      }
    } else {
      this.current--;
      if (this.current < 0) {
        this.current = this.count - 1;
      }
    }

    const dom = document.querySelector('.handy-bar');
    for (let i = 0; i < this.count; i++) {
      const condition1 = this.current == i
      const condition2 = dom.children[i].classList.contains('active');
      if (condition1 && !condition2) {
        dom.children[i].classList.add('active')
      }

      if (!condition1 && condition2) {
        dom.children[i].classList.remove('active')
      }
    }
  }
}

export default UI