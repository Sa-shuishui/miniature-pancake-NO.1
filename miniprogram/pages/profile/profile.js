const { buildProfileState } = require('../../page-models/profile-page-model')
const { syncCustomTabBar } = require('../../utils/role-ui')

Page({
  data: {
    themeClass: 'theme-female',
    profile: null
  },

  onShow() {
    const app = getApp()
    const profile = buildProfileState(app.globalData)
    syncCustomTabBar(this, 'profile', app.globalData.role, app.globalData.gender)
    this.setData({
      themeClass: profile.themeClass,
      profile
    })
  }
})
