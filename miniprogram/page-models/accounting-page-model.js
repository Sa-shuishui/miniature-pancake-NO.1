const service = require('../services/application-service')

const DEFAULT_ACCOUNTING_FORM = {
  purpose: '',
  amount: '',
  note: ''
}

function createDefaultAccountingForm(overrides = {}) {
  return {
    ...DEFAULT_ACCOUNTING_FORM,
    ...overrides
  }
}

function updateAccountingField(form, field, value) {
  if (!Object.prototype.hasOwnProperty.call(DEFAULT_ACCOUNTING_FORM, field)) {
    return form
  }

  return {
    ...form,
    [field]: value
  }
}

function getAccountingErrors(form) {
  const errors = {}
  const amount = Number(form.amount)

  if (!form.purpose || form.purpose.trim().length < 2) {
    errors.purpose = '用途至少需要 2 个字'
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = '金额必须大于 0'
  }

  return errors
}

function buildAccountingFormState(form) {
  const errors = getAccountingErrors(form)
  const firstError = errors.purpose || errors.amount || ''
  return {
    form,
    errors,
    canSubmit: !firstError,
    firstError
  }
}

function buildAccountingSummary(records) {
  const totalAmount = records.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  return {
    count: records.length,
    totalAmount,
    totalAmountText: `￥${totalAmount.toFixed(2)}`
  }
}

async function loadAccountingState(familyId) {
  const result = await service.listLedgerRecords({ familyId })
  if (!result.ok) return result

  const records = result.data.items || []
  return {
    ok: true,
    data: {
      formState: buildAccountingFormState(createDefaultAccountingForm()),
      records,
      summary: buildAccountingSummary(records)
    },
    error: null
  }
}

async function submitAccountingRecord(formState, familyId, currentUser) {
  const nextState = buildAccountingFormState(formState.form)
  if (!nextState.canSubmit) {
    return {
      ok: false,
      data: nextState,
      error: {
        code: 'VALIDATION_ERROR',
        message: nextState.firstError
      }
    }
  }

  return service.createLedgerRecord(
    {
      familyId,
      purpose: nextState.form.purpose,
      amount: nextState.form.amount,
      note: nextState.form.note
    },
    currentUser
  )
}

module.exports = {
  createDefaultAccountingForm,
  updateAccountingField,
  buildAccountingFormState,
  loadAccountingState,
  submitAccountingRecord
}
