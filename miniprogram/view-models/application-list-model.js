const { APPLICATION_STATUS, STATUS_LABELS } = require('../utils/constants')
const { formatAmount } = require('../utils/format')

const FILTER_OPTIONS = [
  { label: '全部', value: '' },
  { label: STATUS_LABELS[APPLICATION_STATUS.PENDING], value: APPLICATION_STATUS.PENDING },
  { label: STATUS_LABELS[APPLICATION_STATUS.APPROVED], value: APPLICATION_STATUS.APPROVED },
  { label: STATUS_LABELS[APPLICATION_STATUS.REJECTED], value: APPLICATION_STATUS.REJECTED }
]

function summarizeApplications(items = []) {
  return {
    total: items.length,
    pending: items.filter((item) => item.status === APPLICATION_STATUS.PENDING).length,
    approved: items.filter((item) => item.status === APPLICATION_STATUS.APPROVED).length,
    rejected: items.filter((item) => item.status === APPLICATION_STATUS.REJECTED).length
  }
}

function decorateApplicationList(items = []) {
  return items.map((item) => ({
    ...item,
    statusLabel: STATUS_LABELS[item.status] || item.status,
    amountText: formatAmount(item.amount),
    isPending: item.status === APPLICATION_STATUS.PENDING
  }))
}

function filterApplications(items = [], status = '') {
  if (!status) return items
  return items.filter((item) => item.status === status)
}

function buildListViewModel(items = [], activeStatus = '') {
  const filteredItems = filterApplications(items, activeStatus)

  return {
    filters: FILTER_OPTIONS.map((filter) => ({
      ...filter,
      active: filter.value === activeStatus
    })),
    summary: summarizeApplications(items),
    items: decorateApplicationList(filteredItems),
    empty: filteredItems.length === 0
  }
}

module.exports = {
  FILTER_OPTIONS,
  summarizeApplications,
  decorateApplicationList,
  filterApplications,
  buildListViewModel
}
