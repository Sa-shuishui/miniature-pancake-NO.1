const assert = require('assert')
const {
  createDefaultForm,
  updateFormField,
  addImage,
  removeImage,
  getFormState
} = require('../miniprogram/view-models/application-form-model')
const {
  buildListViewModel
} = require('../miniprogram/view-models/application-list-model')
const {
  buildDetailViewModel
} = require('../miniprogram/view-models/application-detail-model')
const { APPLICATION_STATUS } = require('../miniprogram/utils/constants')

let form = createDefaultForm()
form = updateFormField(form, 'title', '购买咖啡机')
form = updateFormField(form, 'amount', '1299')
form = updateFormField(form, 'category', '家电')
form = updateFormField(
  form,
  'reason',
  '家里每天都喝咖啡，长期看比外卖咖啡更省钱。'
)
form = updateFormField(form, 'productLink', 'https://example.com/coffee-machine')
form = addImage(form, 'temp://coffee-machine.jpg')

const formState = getFormState(form, 'family_001')
assert.strictEqual(formState.ok, true)
assert.strictEqual(formState.data.canSubmit, true)
assert.strictEqual(formState.data.payload.title, '购买咖啡机')
assert.strictEqual(formState.data.payload.images.length, 1)

const removedImageForm = removeImage(form, 'temp://coffee-machine.jpg')
assert.strictEqual(removedImageForm.images.length, 0)

const invalidFormState = getFormState(
  createDefaultForm({
    title: 'A',
    amount: 0,
    reason: '太短',
    productLink: 'abc123'
  }),
  'family_001'
)
assert.strictEqual(invalidFormState.data.canSubmit, false)
assert.strictEqual(invalidFormState.data.fieldErrors.amount, '申请金额必须大于 0')
assert.strictEqual(invalidFormState.data.fieldErrors.productLink, undefined)

const listView = buildListViewModel(
  [
    { id: '1', title: '咖啡机', amount: 1299, status: APPLICATION_STATUS.PENDING },
    { id: '2', title: '聚餐', amount: 420, status: APPLICATION_STATUS.APPROVED },
    { id: '3', title: '游戏主机', amount: 2999, status: APPLICATION_STATUS.REJECTED }
  ],
  APPLICATION_STATUS.PENDING
)
assert.strictEqual(listView.summary.total, 3)
assert.strictEqual(listView.summary.pending, 1)
assert.strictEqual(listView.items.length, 1)
assert.strictEqual(listView.items[0].statusLabel, '待审批')
assert.strictEqual(listView.items[0].amountText, '¥1299.00')

const detailView = buildDetailViewModel(
  {
    id: 'app_001',
    title: '购买咖啡机',
    amount: 1299,
    status: APPLICATION_STATUS.PENDING,
    approverId: 'user_wife',
    images: ['temp://coffee-machine.jpg'],
    productLink: 'https://example.com/coffee-machine',
    events: []
  },
  { id: 'user_wife', name: '审批方', role: 'approver' }
)
assert.strictEqual(detailView.exists, true)
assert.strictEqual(detailView.canApprove, true)
assert.strictEqual(detailView.application.hasImages, true)
assert.strictEqual(detailView.application.hasProductLink, true)

const cloudDetailView = buildDetailViewModel(
  {
    id: 'cloud_app_001',
    title: '购买PS5',
    amount: 4398,
    status: APPLICATION_STATUS.PENDING,
    approverOpenId: '',
    images: [],
    productLink: '复制淘宝口令',
    events: []
  },
  { id: 'user_wife', name: '审批方', role: 'approver' }
)
assert.strictEqual(cloudDetailView.canApprove, true)

const applicantDetailView = buildDetailViewModel(
  {
    id: 'cloud_app_002',
    title: '购买PS5',
    amount: 4398,
    status: APPLICATION_STATUS.PENDING,
    images: [],
    events: []
  },
  { id: 'user_husband', name: '申请方', role: 'applicant' }
)
assert.strictEqual(applicantDetailView.canApprove, false)

console.log('view-models verification passed')
