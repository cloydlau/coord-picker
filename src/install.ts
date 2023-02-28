import 'uno.css'
import { resolveConfig } from 'vue-global-config'
import component from './component.vue'

const globalProps: Record<string, any> = {}

component.install = (app: any, options = {}) => {
  const { props } = resolveConfig(options, component.props)
  Object.assign(globalProps, props)
  app.component(component.name, component)
}

export default component
export { globalProps }
