export const COFFEE_PALETTE = {
  primary: "#F15F2C",
  secondary: "#C7A17A",
  background: "#0C243E",
  cardBg: "#FFFFFF",
  success: "#2E7D32",
  error: "#C62828",
  warning: "#F57C00",
  textPrimary: "#3E2723",
  textSecondary: "#795548",
  border: "#D7CCC8",
  warningBg: "#FFF8E1",
} as const;

export const COFFEE_THEME = {
  colors: COFFEE_PALETTE,

  nav: {
    borderColor: COFFEE_PALETTE.border,
    backgroundColor: COFFEE_PALETTE.cardBg,
  },

  card: {
    backgroundColor: COFFEE_PALETTE.cardBg,
    borderColor: COFFEE_PALETTE.border,
  },

  button: {
    primary: {
      backgroundColor: COFFEE_PALETTE.primary,
      color: "#FFFFFF",
    },
    secondary: {
      borderColor: COFFEE_PALETTE.primary,
      color: COFFEE_PALETTE.primary,
      backgroundColor: "transparent",
    },
  },

  status: {
    online: COFFEE_PALETTE.success,
    offline: COFFEE_PALETTE.error,
    warning: COFFEE_PALETTE.warning,
  },
} as const;

export type CoffeePalette = typeof COFFEE_PALETTE;
export type CoffeeTheme = typeof COFFEE_THEME;
