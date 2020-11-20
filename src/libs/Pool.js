// 对象池
export default class Pool {
  /*
    name 对象池的名称
    fn 对象池的构造函数
  */
  constructor (fn) {
    this.fn = fn
    this._checkConstructor()
    // 正在使用中的对象
    this.usingSet = {}
    // 空闲中的对象
    this.avaSet = {}
  }
  
  _checkConstructor () {
    if (typeof this.fn !== 'function' || !this.fn.prototype) {
      throw new Error('Invalid Constructor')
    }
  }
  
  // 获取一个对象，key相同的对象共用一个对象池
  get (key, ...args) {
    let { avaSet, usingSet } = this.getPool(key)
    
    let obj
    if (avaSet.size === 0) {
      // 没有空闲对象了，则返回一个新对象
      obj = this.create.apply(this, args)
    }
    else {
      // 还有空闲对象，则获取
      obj = avaSet.values().next().value
      avaSet.delete(obj)
    }
    
    // 加入正在使用中的对象
    usingSet.add(obj)
    return obj
  }
  
  // 创建一个对象
  create (...args) {
    this._checkConstructor()
    
    const InitFunc = this.fn
    const obj = new InitFunc(...args)
    return obj
  }
  
  // 根据key获取对象池
  getPool (key) {
    if (!this.usingSet[key]) {
      this.usingSet[key] = new Set()
      this.avaSet[key] = new Set()
    }
    return {
      usingSet: this.usingSet[key],
      avaSet: this.avaSet[key]
    }
  }
}
