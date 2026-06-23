const assert = require('assert')
const fileService = require('../miniprogram/services/file-service')

async function run() {
  fileService.setFileDataSource('mock')
  assert.strictEqual(fileService.getFileDataSource(), 'mock')

  assert.strictEqual(
    fileService.getFileName('C:\\temp\\coffee machine.jpg'),
    'coffee machine.jpg'
  )

  const cloudPath = fileService.buildCloudPath({
    familyId: 'family_001',
    applicationId: 'app_001',
    filePath: 'C:\\temp\\coffee machine.jpg',
    timestamp: 123
  })
  assert.strictEqual(
    cloudPath,
    'families/family_001/applications/app_001/123-coffee-machine.jpg'
  )

  const validImages = fileService.validateImagePaths([
    'temp://one.jpg',
    'temp://two.jpg',
    'temp://three.jpg'
  ])
  assert.strictEqual(validImages.ok, true)

  const tooManyImages = fileService.validateImagePaths([
    '1.jpg',
    '2.jpg',
    '3.jpg',
    '4.jpg'
  ])
  assert.strictEqual(tooManyImages.ok, false)
  assert.strictEqual(tooManyImages.error.code, 'VALIDATION_ERROR')

  const uploaded = await fileService.uploadApplicationImages(
    ['temp://coffee-machine.jpg'],
    { familyId: 'family_001', applicationId: 'draft' }
  )
  assert.strictEqual(uploaded.ok, true)
  assert.deepStrictEqual(uploaded.data, ['temp://coffee-machine.jpg'])

  const invalidSource = fileService.setFileDataSource('disk')
  assert.strictEqual(invalidSource.ok, false)
  assert.strictEqual(fileService.getFileDataSource(), 'mock')

  console.log('file-service verification passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
