const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const requiredFiles = [
  'project.config.json',
  'miniprogram/app.js',
  'miniprogram/app.json',
  'miniprogram/app.wxss',
  'miniprogram/config/runtime-config.js',
  'miniprogram/services/application-service.js',
  'miniprogram/services/file-service.js',
  'miniprogram/services/runtime-service.js',
  'miniprogram/utils/mock-store.js',
  'miniprogram/utils/application-rules.js',
  'miniprogram/view-models/application-form-model.js',
  'miniprogram/view-models/application-list-model.js',
  'miniprogram/view-models/application-detail-model.js',
  'miniprogram/page-models/home-page-model.js',
  'miniprogram/page-models/apply-page-model.js',
  'miniprogram/page-models/applications-page-model.js',
  'miniprogram/page-models/detail-page-model.js',
  'miniprogram/page-models/profile-page-model.js',
  'cloudfunctions/createApplication/index.js',
  'cloudfunctions/listApplications/index.js',
  'cloudfunctions/getApplicationDetail/index.js',
  'cloudfunctions/approveApplication/index.js'
]

const pages = [
  'onboarding/gender',
  'onboarding/role',
  'home',
  'apply',
  'applications',
  'detail',
  'profile'
]

requiredFiles.forEach((file) => {
  assert.ok(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`)
})

pages.forEach((page) => {
  const pageName = page.split('/').pop()
  const base = path.join(root, 'miniprogram', 'pages', page, pageName)
  assert.ok(fs.existsSync(`${base}.js`), `Missing page controller: ${base}.js`)
  assert.ok(fs.existsSync(`${base}.json`), `Missing page config: ${base}.json`)
  assert.ok(fs.existsSync(`${base}.wxml`), `Missing page template: ${base}.wxml`)
  assert.ok(fs.existsSync(`${base}.wxss`), `Missing page style: ${base}.wxss`)
})

const missingVisualFiles = []
pages.forEach((page) => {
  const pageName = page.split('/').pop()
  const base = path.join(root, 'miniprogram', 'pages', page, pageName)
  if (!fs.existsSync(`${base}.wxml`)) missingVisualFiles.push(`miniprogram/pages/${page}/${page}.wxml`)
  if (!fs.existsSync(`${base}.wxss`)) missingVisualFiles.push(`miniprogram/pages/${page}/${page}.wxss`)
})

assert.strictEqual(
  missingVisualFiles.length,
  0,
  'All visual page files should exist after visual direction selection'
)

console.log('project-structure verification passed')
console.log('visual files ready')
