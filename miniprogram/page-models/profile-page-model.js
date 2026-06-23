const {
  getGenderLabel,
  getRoleLabel,
  getRoleAvatar,
  getThemeClass
} = require('../utils/theme')
const { getRoleScene } = require('../utils/cartoon-assets')

function buildProfileState(globalData) {
  const gender = globalData.gender || 'female'
  const role = globalData.role || 'approver'
  const currentUser = globalData.currentUser || {}

  return {
    familyId: globalData.currentFamilyId,
    gender,
    role,
    themeClass: globalData.themeClass || getThemeClass(gender),
    currentUser: {
      ...currentUser,
      avatar: currentUser.avatar || getRoleAvatar(gender, role)
    },
    sceneImage: getRoleScene(gender, role),
    roleLabel: getRoleLabel(role),
    genderLabel: getGenderLabel(gender)
  }
}

module.exports = {
  buildProfileState
}
