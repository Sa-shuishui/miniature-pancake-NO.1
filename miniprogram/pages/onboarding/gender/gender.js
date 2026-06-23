const { buildGenderState } = require('../../../page-models/onboarding-page-model')
const { getTrustIcons } = require('../../../utils/cartoon-assets')

Page({
  data: {
    state: buildGenderState(''),
    trustIcons: getTrustIcons()
  },

  selectGender(event) {
    const { gender } = event.currentTarget.dataset
    this.setData({ state: buildGenderState(gender) })
  },

  continue() {
    if (!this.data.state.canContinue) {
      wx.showToast({ title: '先选择你的性别主题', icon: 'none' })
      return
    }

    wx.navigateTo({
      url: `/pages/onboarding/role/role?gender=${this.data.state.selectedGender}`
    })
  }
})
