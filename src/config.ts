let apiKey, city, precision

export const init = (opts = {}) => {
    apiKey = opts.apiKey || ''
    city = opts.city || ''
    precision = opts.precision || null
}

export {apiKey, city, precision}
