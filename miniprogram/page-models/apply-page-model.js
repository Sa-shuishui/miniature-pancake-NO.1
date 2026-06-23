const service = require('../services/application-service')
const {
  createDefaultForm,
  updateFormField,
  addImage,
  removeImage,
  getFormState
} = require('../view-models/application-form-model')

function initApplyState(familyId) {
  const form = createDefaultForm()
  return getFormState(form, familyId).data
}

function updateApplyField(state, field, value, familyId) {
  const form = updateFormField(state.form, field, value)
  return getFormState(form, familyId).data
}

function addApplyImage(state, imagePath, familyId) {
  const form = addImage(state.form, imagePath)
  return getFormState(form, familyId).data
}

function removeApplyImage(state, imagePath, familyId) {
  const form = removeImage(state.form, imagePath)
  return getFormState(form, familyId).data
}

async function submitApplication(state, familyId, currentUser) {
  const formState = getFormState(state.form, familyId).data
  if (!formState.canSubmit) {
    return {
      ok: false,
      data: formState,
      error: {
        code: 'VALIDATION_ERROR',
        message: formState.firstError
      }
    }
  }

  return service.createApplication(formState.payload, currentUser)
}

module.exports = {
  initApplyState,
  updateApplyField,
  addApplyImage,
  removeApplyImage,
  submitApplication
}
