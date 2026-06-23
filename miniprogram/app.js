const { getRuntimeConfig } = require('./config/runtime-config')
const { initializeRuntime } = require('./services/runtime-service')

App({
  onLaunch() {
    const runtime = initializeRuntime()
    if (!runtime.ok) {
      this.globalData.runtimeError = runtime.error.message
    }
  },

  globalData: {
    ...getRuntimeConfig(),
    runtimeError: ''
  }
})
