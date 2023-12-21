import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise'

//  perlin(x, y)
// 对于普通的柏林函数，对其引入振幅和频率后，可得：  amplitude * perlin(x * frequence, y * frequence)
// 其中 amplitude 为振幅，frequence为频率，对其多次进行迭代（引入频率和振幅）算出总和（具体可参考three官方例子）后可得到不错的效果，这个过程称为噪声叠加
// octaves 采样次数
// persistence 可持续度-振幅变化率,即山顶和山谷的高度差
// lacunarity 不均匀度-频率变化率，即一段距离内山谷或山顶的出现次数
// 比较好的方式是，对于每一个多出的倍频，频率翻倍，振幅减小一半

export default class Noise {
  perlin = new ImprovedNoise();
  simplex = new SimplexNoise();
  seed = Math.random(); // 种子，对应相同的值，每次生成的地形会一致
  octaves = 4;
  persistence = 2;
  lacunarity = 8;

  getHeight(x, z) {
    // 后续优化参考
    // https://www.cnblogs.com/leoin2012/p/7218033.html
    const tempArr = new Array(this.octaves).fill(0);
    let amp = 0;
    tempArr.forEach((ele, index) => {
      const amplitude = this.persistence * 0.5 ** index;
      const frequence = this.lacunarity * 2 ** index;
      amp += amplitude;
      tempArr[index] += this.perlin.noise(x / frequence, z / frequence, this.seed) * amplitude
    })
    // console.log('amp', amp)
    return (tempArr.reduce((pre, cur) => pre + cur, 0) + amp) * 2.5
  }

  getDensity(x, y, z) {
    return this.simplex.noise3d(x, y, z)
  }

  getNoise(x, z) {
    return this.perlin.noise(x, z, this.seed)
  }

  // 确保全局只返回一个类单例
  static getInstance() {
    // 判断是否已经new过1个实例
    if (!Noise.instance) {
      // 若这个唯一的实例不存在，那么先创建它
      Noise.instance = new Noise()
    }
    // 如果这个唯一的实例已经存在，则直接返回
    return Noise.instance
  }
}