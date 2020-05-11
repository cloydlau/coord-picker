let apiKey, city

export const init = (opts = {}) => {
    apiKey = opts.apiKey || ''
    city = opts.city || ''
}

export {apiKey, city}
