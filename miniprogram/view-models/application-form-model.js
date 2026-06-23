const {
  validateApplicationPayload,
  success
} = require('../utils/application-rules')

const DEFAULT_FORM = {
  title: '',
  amount: '',
  category: '',
  reason: '',
  images: [],
  productLink: '',
  expectedPurchaseDate: '',
  note: ''
}

const CATEGORY_OPTIONS = [
  '家电',
  '餐饮',
  '学习',
  '旅行',
  '维修',
  '娱乐',
  '其他'
]

function createDefaultForm(overrides = {}) {
  return {
    ...DEFAULT_FORM,
    ...overrides,
    images: overrides.images || []
  }
}

function updateFormField(form, field, value) {
  if (!Object.prototype.hasOwnProperty.call(DEFAULT_FORM, field)) {
    return form
  }

  return {
    ...form,
    [field]: value
  }
}

function addImage(form, imagePath) {
  const images = form.images || []
  if (!imagePath || images.length >= 3) {
    return form
  }

  return {
    ...form,
    images: images.concat(imagePath)
  }
}

function removeImage(form, imagePath) {
  return {
    ...form,
    images: (form.images || []).filter((item) => item !== imagePath)
  }
}

function buildApplicationPayload(form, familyId) {
  return {
    familyId,
    title: form.title,
    amount: form.amount,
    category: form.category,
    reason: form.reason,
    images: form.images || [],
    productLink: form.productLink,
    expectedPurchaseDate: form.expectedPurchaseDate,
    note: form.note
  }
}

function validateForm(form, familyId) {
  const payload = buildApplicationPayload(form, familyId)
  return validateApplicationPayload(payload)
}

function getFieldErrors(form, familyId) {
  const errors = {}

  if (!familyId) errors.familyId = '家庭 ID 不能为空'
  if (!form.title || form.title.trim().length < 2) errors.title = '用途标题至少需要 2 个字'
  if (form.title && form.title.trim().length > 30) errors.title = '用途标题不能超过 30 个字'

  const amount = Number(form.amount)
  if (!Number.isFinite(amount) || amount <= 0) errors.amount = '申请金额必须大于 0'

  if (!form.reason || form.reason.trim().length < 10) {
    errors.reason = '必要性说明至少需要 10 个字'
  }

  if (form.images && form.images.length > 3) {
    errors.images = '产品照片最多上传 3 张'
  }

  return errors
}

function getFormState(form, familyId) {
  const validation = validateForm(form, familyId)
  const fieldErrors = getFieldErrors(form, familyId)

  return success({
    form,
    categoryOptions: CATEGORY_OPTIONS,
    payload: buildApplicationPayload(form, familyId),
    canSubmit: validation.ok,
    fieldErrors,
    firstError: validation.ok ? '' : validation.error.message
  })
}

module.exports = {
  CATEGORY_OPTIONS,
  createDefaultForm,
  updateFormField,
  addImage,
  removeImage,
  buildApplicationPayload,
  validateForm,
  getFieldErrors,
  getFormState
}
