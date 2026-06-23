const GENDERS = {
  MALE: 'male',
  FEMALE: 'female'
}

const ROLES = {
  APPLICANT: 'applicant',
  APPROVER: 'approver'
}

const GENDER_OPTIONS = [
  {
    value: GENDERS.MALE,
    label: '男生',
    themeLabel: '淡蓝主题',
    avatar: '/assets/avatars/male-applicant.jpg'
  },
  {
    value: GENDERS.FEMALE,
    label: '女生',
    themeLabel: '淡粉主题',
    avatar: '/assets/avatars/female-applicant.jpg'
  }
]

const ROLE_OPTIONS = [
  {
    value: ROLES.APPLICANT,
    label: '申请者',
    description: '发起想一起商量的共同花',
    applicantName: '申请方'
  },
  {
    value: ROLES.APPROVER,
    label: '审批者',
    description: '回应对方提交的共同资金申请',
    applicantName: '审批方'
  }
]

function getThemeClass(gender) {
  return gender === GENDERS.MALE ? 'theme-male' : 'theme-female'
}

function getGenderLabel(gender) {
  return gender === GENDERS.MALE ? '男生' : '女生'
}

function getRoleLabel(role) {
  return role === ROLES.APPROVER ? '审批者' : '申请者'
}

function getRoleAvatar(gender, role) {
  const genderKey = gender === GENDERS.MALE ? 'male' : 'female'
  const roleKey = role === ROLES.APPROVER ? 'approver' : 'applicant'
  return `/assets/avatars/${genderKey}-${roleKey}.jpg`
}

function buildUserFromPreference(preference) {
  const gender = preference.gender || GENDERS.FEMALE
  const role = preference.role || ROLES.APPROVER
  return {
    id: role === ROLES.APPROVER ? 'user_wife' : 'user_husband',
    name: getRoleLabel(role),
    role,
    gender,
    avatar: getRoleAvatar(gender, role)
  }
}

module.exports = {
  GENDERS,
  ROLES,
  GENDER_OPTIONS,
  ROLE_OPTIONS,
  getThemeClass,
  getGenderLabel,
  getRoleLabel,
  getRoleAvatar,
  buildUserFromPreference
}
