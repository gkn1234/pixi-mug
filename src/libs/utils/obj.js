const objUtils = {
  getType (obj) {
    return Object.prototype.toString.call(obj).slice(8, -1)
  },
  
  // 是否为具体的数字，不包括NaN和Infinity
  isValidNum (obj) {
    const type = objUtils.getType(obj)
    if (type === 'Number' && obj !== NaN && obj !== Infinity) {
      return true
    }
    return false
  },
  
  // 是否为字符串
  isString (obj) {
    return objUtils.getType(obj) === 'String'
  },
  
  // 是否为数组
  isArray (obj) {
    return objUtils.getType(obj) === 'Array'
  },
}

export default objUtils