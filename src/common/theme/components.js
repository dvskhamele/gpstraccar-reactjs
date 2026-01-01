export default {
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      'html, body, *': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'} transparent`,
        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
          width: '3px !important',
          height: '3px !important',
        },
        '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
          backgroundColor: 'transparent !important',
        },
        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
          borderRadius: '10px !important',
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
          },
        },
        '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
          backgroundColor: 'transparent !important',
        },
      },
    }),
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        background: theme.palette.sidebar.background,
        color: theme.palette.sidebar.text,
        borderRight: 'none',
        '& .MuiListItemIcon-root': {
          color: theme.palette.sidebar.text,
        },
        '& .MuiDivider-root': {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      }),
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        margin: '2px 6px',
        '&.Mui-selected': {
          backgroundColor: theme.palette.sidebar.active,
          color: theme.palette.sidebar.activeText,
          '& .MuiListItemIcon-root': {
            color: theme.palette.sidebar.activeText,
          },
          '&:hover': {
            backgroundColor: theme.palette.sidebar.hover,
          },
        },
        '&:hover': {
          backgroundColor: theme.palette.sidebar.hover,
        },
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      rounded: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        backgroundColor: theme.palette.background.default,
        '& fieldset': {
          borderColor: theme.palette.divider,
        },
        '&:hover fieldset': {
          borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
          borderWidth: 2,
        },
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        padding: '6px 16px',
      },
      contained: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
        },
      },
      sizeMedium: {
        height: '36px',
      },
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: 'small',
      fullWidth: true,
    },
    styleOverrides: {
      root: {
        width: '100%',
      },
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      root: {
        width: '100%',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      size: 'small',
      fullWidth: true,
      variant: 'outlined',
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      enterDelay: 500,
      enterNextDelay: 500,
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: '10px 12px',
        fontSize: '0.85rem',
        '@media print': {
          color: theme.palette.alwaysDark.main,
        },
      }),
      head: ({ theme }) => ({
        fontWeight: 600,
        backgroundColor: theme.palette.primary.main,
        color: '#ffffff',
      }),
    },
  },
};
