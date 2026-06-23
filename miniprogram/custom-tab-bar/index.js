const { ROLES, getThemeClass } = require('../utils/theme')

function buildItems(role) {
  const isApprover = role !== ROLES.APPLICANT
  return [
    {
      key: 'home',
      text: '首页',
      path: '/pages/home/home'
    },
    {
      key: isApprover ? 'pending' : 'apply',
      text: isApprover ? '待审批' : '申请',
      path: isApprover ? '/pages/applications/applications' : '/pages/apply/apply'
    },
    {
      key: 'applications',
      text: '列表',
      path: '/pages/applications/applications'
    },
    {
      key: 'profile',
      text: '我的',
      path: '/pages/profile/profile'
    }
  ]
}

Component({
  data: {
    selectedKey: 'home',
    themeClass: 'theme-female',
    items: buildItems(ROLES.APPROVER)
  },

  methods: {
    sync(options = {}) {
      const app = getApp()
      const role = options.role || app.globalData.role || ROLES.APPROVER
      const gender = options.gender || app.globalData.gender
      this.setData({
        selectedKey: options.selectedKey || 'home',
        themeClass: app.globalData.themeClass || getThemeClass(gender),
        items: buildItems(role)
      })
    },

    switchTab(event) {
      const { key, path } = event.currentTarget.dataset
      const app = getApp()

      if (key === 'pending') {
        app.globalData.applicationStatusFilter = 'pending'
        app.globalData.activeTabKey = 'pending'
      } else if (key === 'applications') {
        app.globalData.applicationStatusFilter = 'all'
        app.globalData.activeTabKey = 'applications'
      } else {
        app.globalData.activeTabKey = key
      }

      wx.switchTab({ url: path })
    }
  }
})
