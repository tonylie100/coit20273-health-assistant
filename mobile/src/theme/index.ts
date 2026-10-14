export { colors } from './colors';
export type { AppColor } from './colors';

export { spacing } from './spacing';

export { typography } from './typography';

export { radii } from './radii';

export const shadows = {
  card: {
    shadowColor: '#183D3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  elevated: {
    shadowColor: '#183D3A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
  },
} as const;