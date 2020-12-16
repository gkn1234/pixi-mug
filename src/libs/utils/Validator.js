
// 校验器
export default class Validator {
  constructor (options) {
    if (!Validator.isObject(options)) {
      throw new Error('Validator\'s options must be an object!')
    }
    this._options = options
    
    for (let key in options) {
      this._fixValidator(key)
    }
  }
  
  // 给定key，规范化验证对象
  _fixValidator (key) {
    const validator = this._options[key]
    
    // 初始化验证对象的各个参数
    // 初始化 类型验证type 和 默认值defaultVal
    let { type, defaultVal } = this._initDefaultValue(key)
    // 合法规则，返回true通过校验，否则不通过。初始为【无条件通过】
    let valid = () => { return true }
    // 检测到非法时的回调函数
    let onInvalid = () => {}
    // 非法时，是否用默认值覆盖非法值
    let invalidForceDefault = true
    // 非法时，是否抛出警告
    let invalidWarn = false
    // 非法时，是否中断脚本执行
    let invalidBreak = false
    
    if (Validator.isObject(validator)) {      
      if (Validator.isFunction(validator.valid)) {
        valid = validator.valid
      }
      
      if (Validator.isFunction(validator.onInvalid)) {
        onInvalid = validator.onInvalid
      }
      
      if (Validator.isBool(validator.invalidForceDefault)) {
        invalidForceDefault = validator.invalidForceDefault
      }
      
      if (Validator.isBool(validator.invalidWarn)) {
        invalidWarn = validator.invalidWarn
      }
      
      if (Validator.isBool(validator.invalidBreak)) {
        invalidBreak = validator.invalidBreak
      }
    }
    
    this[key] = {
      type,
      valid,
      default: defaultVal,
      onInvalid,
      invalidForceDefault,
      invalidWarn,
      invalidBreak
    }
  }
  
  // 给定key，从【待规范】的验证对象中获取 类型验证type 和 默认值defaultVal
  _initDefaultValue (key) {
    const validator = this._options[key]
    
    // 类型验证默认为null，null代表不进行类型验证
    let type = null
    // 默认值
    let defaultVal = null
    
    if (Validator.isObject(validator)) {
      type = Validator.isFunction(validator.type) && validator.type.prototype ? validator.type : null
      
      // 修正default
      defaultVal = validator.default
      if (type === null || defaultVal === null) {
        // type为null时代表不进行类型验证，defaultVal可以为任何值
        // 默认值defaultVal为null时，代表不进行类型验证
        return { type, defaultVal }
      }
      
      // 默认类别验证失败，抛出错误
      if (!defaultVal.constructor || type.name !== defaultVal.constructor.name) {
        throw new Error(`On key ${key}: There is a type error on default value! Except ${type.name} get ${Validator.getType(defaultVal)}.`)
      }
    }
    
    return { type, defaultVal }
  }
  
  // 对obj的某个key赋予值value，对此进行验证并处理，合法时才允许赋值
  _validate (obj, key, value) {
    const validator = this[key]
    
    // 初始化验证结果
    let res = true
    // 初始化警告文字
    let invalidTxt = ''
    
    // 验证类型
    if (validator.type !== null && value !== null) {
      res = res & (value.constructor && validator.type.name === value.constructor.name)
      if (!res) {
        // 类型错误警告
        invalidTxt = `Type error! Except ${validator.type.name} get ${Validator.getType(value)}.`
      }
    }
    
    // 函数验证
    if (res) {
      const validSign = validator.valid(obj) ? true : false
      res = res & validSign      
    }

    if (!res) {
      // 非法
      if (!invalidTxt) {
        invalidTxt = 'Invalid value!'
      }
      
      // 执行非法时的回调函数，参数说明：obj赋值对象，key赋值键，value非法值
      validator.onInvalid(obj, key, value)
      
      if (validator.invalidForceDefault) {
        // 非法时，强制用默认值取代
        obj[key] = validator.default
        invalidTxt = invalidTxt + ' The value has been replaced by default value.'
      }
      invalidTxt = `On key ${key}: ` + invalidTxt
      
      if (validator.invalidWarn && !validator.invalidBreak) {
        // 非法警告
        console.warn(invalidTxt)
      }
      
      if (validator.invalidBreak) {
        // 抛出错误
        throw new Error(invalidTxt)
      }
    }
    
    // 合法的值，允许赋值
    obj[key] = value
  }
  
  // 将校验器挂载到对象，使对象变成一个动态校验对象
  mount (obj) {
    if (!Validator.isObject(obj)) {
      throw new Error('Validator can only be used on an object!')
    }
    
    // 先对obj本身的值进行一轮验证
    for (let key in obj) {
      this._validate(obj, key, obj[key])
    }
    
    return new Proxy(obj, {
      set (target, key, val) {
        this._validate(target, key, val)
        return true
      }
    })
  }
  
  // 获取对象类型
  static getType (obj) {
    return Object.prototype.toString.call(obj).slice(8, -1)
  },
  
  // 是否为数字类型，不排除NaN，Infinity
  static isNumber (obj) {
    return objUtils.getType(obj) === 'Number'
  },
  // 是否为具体的数字，不包括NaN和Infinity
  static isValidNum (obj) {
    return objUtils.isNumber(obj) && !Number.isNaN(obj) && obj !== Infinity && obj !== -Infinity
  },
  
  // 是否为字符串
  static isString (obj) {
    return objUtils.getType(obj) === 'String'
  },
  // 检查字符串是不是数字字符串，不包括NaN和Infinity
  static isNumString (obj) {
    return objUtils.isString(obj) && objUtils.isValidNum(Number(obj))
  },
  
  // 是否为数组
  static isArray (obj) {
    return objUtils.getType(obj) === 'Array'
  },
  
  // 是否为对象
  static isObject (obj) {
    return objUtils.getType(obj) === 'Object'
  },
  
  // 是否为函数
  static isFunction (obj) {
    return objUtils.getType(obj) === 'Function'
  }
  
  // 是否为布尔
  static isBool (obj) {
    return objUtils.getType(obj) === 'Boolean'
  }
}