import { grey, green, indigo } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? '#0b0f19' : '#f4f6f8',
    paper: darkMode ? '#111827' : '#ffffff',
  },
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || '#E8202E',
    contrastText: '#ffffff',
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || '#F87321',
    contrastText: '#ffffff',
  },
  neutral: {
    main: grey[500],
  },
  geometry: {
    main: '#3bb2d0',
  },
  alwaysDark: {
    main: grey[900],
  },
  sidebar: {
    main: '#ffffff',
    background: '#ffffff',
    text: '#424242',
    active: 'rgba(0, 0, 0, 0.08)',
    hover: 'rgba(0, 0, 0, 0.04)',
    activeText: '#424242',
  },
  gradients: {
    primary: 'linear-gradient(to right, #E8202E, #F87321)',
    secondary: 'linear-gradient(to right, #E8202E, #F87321)',
  }
});
