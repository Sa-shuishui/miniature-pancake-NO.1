const { ROLES } = require('./theme')

function isApproverRole(role) {
  return role !== ROLES.APPLICANT
}

function configureRoleTabBar(role) {
  if (typeof wx === 'undefined' || !wx.setTabBarItem) return

  if (isApproverRole(role)) {
    wx.setTabBarItem({
      index: 1,
      text: '待审批'
    })
    return
  }

  wx.setTabBarItem({
    index: 1,
    text: '申请'
  })
}

function syncCustomTabBar(page, selectedKey, role, gender) {
  if (!page || !page.getTabBar) return
  const tabBar = page.getTabBar()
  if (!tabBar || !tabBar.sync) return
  tabBar.sync({ selectedKey, role, gender })
}

module.exports = {
  isApproverRole,
  configureRoleTabBar,
  syncCustomTabBar
}
