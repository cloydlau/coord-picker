export function isEmpty(value) {
  return {
    object: () =>
      value === null ||
      Array.isArray(value) && value.length === 0 ||
      isPlainObject(value) && Object.getOwnPropertyNames(value).length === 0,
    number: () => Number.isNaN(value),
    string: () => value === '',
    undefined: () => true,
    boolean: () => value === false,
    symbol: () => false,
    bigint: () => false,
    function: () => true,
  }[typeof value]()
}

export function notEmpty(value) {
  return !isEmpty(value)
}
