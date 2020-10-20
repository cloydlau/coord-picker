let apiKey, city, precision, addressComponent, boundaryFormatter

export const init = (opts: {
  apiKey?: string
  city?: string
  precision?: number
  addressComponent?: object
  boundaryFormatter?: () => {}
} = {}) => {
  apiKey = opts.apiKey
  city = opts.city
  precision = opts.precision
  addressComponent = opts.addressComponent
  boundaryFormatter = opts.boundaryFormatter
}

export { apiKey, city, precision, addressComponent, boundaryFormatter }
