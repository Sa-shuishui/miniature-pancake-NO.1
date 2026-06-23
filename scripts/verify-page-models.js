const assert = require('assert')
const service = require('../miniprogram/services/application-service')
const { APPLICATION_STATUS } = require('../miniprogram/utils/constants')
const { loadHomeState } = require('../miniprogram/page-models/home-page-model')
const {
  initApplyState,
  updateApplyField,
  addApplyImage,
  submitApplication
} = require('../miniprogram/page-models/apply-page-model')
const { loadApplicationsState } = require('../miniprogram/page-models/applications-page-model')
const {
  loadDetailState,
  approveDetailApplication
} = require('../miniprogram/page-models/detail-page-model')
const { buildProfileState } = require('../miniprogram/page-models/profile-page-model')
const {
  buildGenderState,
  buildRoleState,
  buildPreference
} = require('../miniprogram/page-models/onboarding-page-model')

async function run() {
  service.setDataSource('mock')
  service.resetLocalData()

  const familyId = 'family_001'
  const applicant = { id: 'user_husband', name: '申请方', role: 'applicant' }
  const approver = { id: 'user_wife', name: '审批方', role: 'approver' }

  const genderState = buildGenderState('male')
  assert.strictEqual(genderState.canContinue, true)
  assert.strictEqual(genderState.options.find((item) => item.value === 'male').active, true)

  const roleState = buildRoleState('male', 'applicant')
  assert.strictEqual(roleState.canContinue, true)
  assert.strictEqual(roleState.themeClass, 'theme-male')
  assert.strictEqual(roleState.options.length, 2)
  assert.strictEqual(roleState.options[0].avatar, '/assets/avatars/male-applicant.jpg')

  const preference = buildPreference('female', 'approver')
  assert.strictEqual(preference.themeClass, 'theme-female')
  assert.strictEqual(preference.currentUser.avatar, '/assets/avatars/female-approver.jpg')

  const homeBefore = await loadHomeState(familyId)
  assert.strictEqual(homeBefore.ok, true)
  assert.strictEqual(homeBefore.data.pendingCount, 1)
  assert.strictEqual(homeBefore.data.recentApplications.length, 3)

  let applyState = initApplyState(familyId)
  applyState = updateApplyField(applyState, 'title', '购买咖啡机', familyId)
  applyState = updateApplyField(applyState, 'amount', '1299', familyId)
  applyState = updateApplyField(applyState, 'category', '家电', familyId)
  applyState = updateApplyField(
    applyState,
    'reason',
    '家里每天都喝咖啡，长期看比外卖咖啡更省钱。',
    familyId
  )
  applyState = updateApplyField(
    applyState,
    'productLink',
    'https://example.com/coffee-machine-new',
    familyId
  )
  applyState = addApplyImage(applyState, 'temp://coffee-machine-new.jpg', familyId)

  assert.strictEqual(applyState.canSubmit, true)

  const created = await submitApplication(applyState, familyId, applicant)
  assert.strictEqual(created.ok, true)

  const pendingList = await loadApplicationsState(familyId, APPLICATION_STATUS.PENDING)
  assert.strictEqual(pendingList.ok, true)
  assert.strictEqual(pendingList.data.summary.pending, 2)
  assert.strictEqual(pendingList.data.items.length, 2)

  const detail = await loadDetailState(created.data.id, approver)
  assert.strictEqual(detail.ok, true)
  assert.strictEqual(detail.data.canApprove, true)
  assert.strictEqual(detail.data.application.hasImages, true)
  assert.strictEqual(detail.data.application.hasProductLink, true)

  const approved = await approveDetailApplication(
    created.data.id,
    APPLICATION_STATUS.APPROVED,
    '可以买，控制在预算内。',
    approver
  )
  assert.strictEqual(approved.ok, true)
  assert.strictEqual(approved.data.status, APPLICATION_STATUS.APPROVED)

  const homeAfter = await loadHomeState(familyId)
  assert.strictEqual(homeAfter.ok, true)
  assert.strictEqual(homeAfter.data.pendingCount, 1)

  const profile = buildProfileState({
    currentFamilyId: familyId,
    gender: 'female',
    role: 'approver',
    themeClass: 'theme-female',
    currentUser: approver
  })
  assert.strictEqual(profile.familyId, familyId)
  assert.strictEqual(profile.roleLabel, '审批者')
  assert.strictEqual(profile.genderLabel, '女生')

  console.log('page-models verification passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
