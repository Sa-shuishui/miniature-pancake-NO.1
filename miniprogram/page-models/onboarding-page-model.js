const {
  GENDER_OPTIONS,
  ROLE_OPTIONS,
  getThemeClass,
  getGenderLabel,
  getRoleAvatar,
  buildUserFromPreference
} = require('../utils/theme')

function buildGenderState(selectedGender = '') {
  return {
    appName: '共同花',
    selectedGender,
    options: GENDER_OPTIONS.map((option) => ({
      ...option,
      active: option.value === selectedGender
    })),
    canContinue: Boolean(selectedGender)
  }
}

function buildRoleState(gender, selectedRole = '') {
  const genderKey = gender === 'male' ? 'male' : 'female'

  return {
    appName: '共同花',
    gender,
    themeClass: getThemeClass(gender),
    genderLabel: getGenderLabel(gender),
    headerImage: `/assets/illustrations/role-${genderKey}-header.jpg`,
    selectedRole,
    options: ROLE_OPTIONS.map((option) => ({
      ...option,
      avatar: getRoleAvatar(gender, option.value),
      cardImage: `/assets/illustrations/role-${genderKey}-${option.value}.jpg`,
      active: option.value === selectedRole
    })),
    canContinue: Boolean(gender && selectedRole)
  }
}

function buildPreference(gender, role) {
  return {
    gender,
    role,
    themeClass: getThemeClass(gender),
    currentUser: buildUserFromPreference({ gender, role })
  }
}

module.exports = {
  buildGenderState,
  buildRoleState,
  buildPreference
}
