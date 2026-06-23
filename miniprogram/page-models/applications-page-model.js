const service = require('../services/application-service')
const { buildListViewModel } = require('../view-models/application-list-model')

async function loadApplicationsState(familyId, activeStatus = '') {
  const result = await service.listApplications({ familyId })
  if (!result.ok) return result

  return {
    ok: true,
    data: buildListViewModel(result.data.items, activeStatus),
    error: null
  }
}

module.exports = {
  loadApplicationsState
}
