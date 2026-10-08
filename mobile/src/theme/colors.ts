export const colors = {
  background: '#F4F9F8',
  backgroundSoft: '#EDF6F4',

  surface: '#FFFFFF',
  surfaceSoft: '#F8FCFB',
  surfaceMuted: '#F1F6F5',

  primary: '#23796B',
  primaryDark: '#165C51',
  primaryLight: '#E4F4F0',
  primarySoft: '#EEF8F6',

  secondary: '#3A8FA3',
  secondaryLight: '#E8F5F8',

  text: '#102F35',
  textStrong: '#082A31',
  textMuted: '#6E8186',
  textSoft: '#8A999D',
  textInverse: '#FFFFFF',

  border: '#DCEAE7',
  borderStrong: '#C8DEDA',

  success: '#24966E',
  successLight: '#E5F6EF',
  successBorder: '#BFE4D5',

  warning: '#C48724',
  warningLight: '#FFF6E4',
  warningBorder: '#F0D9A8',

  danger: '#B85454',
  dangerLight: '#FCEDED',
  dangerBorder: '#EBC8C8',

  info: '#397E9A',
  infoLight: '#EAF5F9',

  live: '#20A875',
  offline: '#9AA9AC',

  shadow: '#183D3A',

  heart: '#D85C6A',
  oxygen: '#4D91C7',
  temperature: '#C77B3B',
  steps: '#3A9B7C',
  sleep: '#766EB5',
  water: '#4C91C5',
  calories: '#D27A3F',
  activity: '#368D77',
} as const;

export type AppColor =
  (typeof colors)[keyof typeof colors];