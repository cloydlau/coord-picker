let apiKey, city, precision, addressComponent

export const init = (opts = {}) => {
    apiKey = opts.apiKey || ''
    city = opts.city || ''
    precision = opts.precision || null
    addressComponent = opts.addressComponent || null
}

export {apiKey, city, precision, addressComponent}
