const {
  buildRoleState,
  buildPreference
} = require('../../../page-models/onboarding-page-model')

Page({
  data: {
    gender: '',
    state: null
  },

  onLoad(options) {
    const gender = options.gender || 'female'
    this.setData({
      gender,
      state: buildRoleState(gender, '')
    })
  },

  selectRole(event) {
    const { role } = event.currentTarget.dataset
    this.setData({
      state: buildRoleState(this.data.gender, role)
    })
  },

  finish() {
    if (!this.data.state.canContinue) {
      wx.showToast({ title: '请选择你的角色', icon: 'none' })
      return
    }

    const preference = buildPreference(this.data.gender, this.data.state.selectedRole)
    const app = getApp()
    app.globalData.gender = preference.gender
    app.globalData.role = preference.role
    app.globalData.themeClass = preference.themeClass
    app.globalData.currentUser = preference.currentUser

    wx.switchTab({ url: '/pages/home/home' })
  }
})
