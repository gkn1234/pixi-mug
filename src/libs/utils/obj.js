// 对象判定方法，对象操作方法
const objUtils = {
  getType (obj) {
    return Object.prototype.toString.call(obj).slice(8, -1)
  },
  
  // 群体检查迭代器
  checkAll (objs, handler) {
    let sign = true
    const len = objs.length
    for (let i = 0; i < len; i++) {
      const obj = objs[i]
      if (typeof handler === 'function') {
        const res = handler(obj)
        sign = res ? true : false
      }
      if (!sign) {
        return false
      }
    }
    return true
  },
  
  // 是否为数字类型，不排除NaN，Infinity
  isNumber (obj) {
    return objUtils.getType(obj) === 'Number'
  },
  
  // 是否为具体的数字，不包括NaN和Infinity
  isValidNum (obj) {
    return objUtils.isNumber(obj) && !Number.isNaN(obj) && obj !== Infinity && obj !== -Infinity
  },
  // 群体版
  isValidNums (...args) {
    return objUtils.checkAll(args, (obj) => {
      return objUtils.isValidNum(obj)
    })
  },
  
  // 是否为字符串
  isString (obj) {
    return objUtils.getType(obj) === 'String'
  },
  
  // 检查字符串是不是数字字符串，不包括NaN和Infinity
  isNumString (obj) {
    return objUtils.isString(obj) && objUtils.isValidNum(Number(obj))
  },
  
  // 是否为数组
  isArray (obj) {
    return objUtils.getType(obj) === 'Array'
  },
  
  // 是否为对象
  isObject (obj) {
    return objUtils.getType(obj) === 'Object'
  },
  
  // 通过JSON实现的对象深度拷贝，但只能拷贝对象的属性
  jsonClone (obj) {
    return JSON.parse(JSON.stringify(obj))
  },
}

export default objUtils