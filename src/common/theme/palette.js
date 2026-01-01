import { grey, green, indigo } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? '#0b0f19' : '#f4f6f8',
    paper: darkMode ? '#111827' : '#ffffff',
  },
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || (darkMode ? '#6366f1' : '#4f46e5'), // Indigo 500/600
    contrastText: '#ffffff',
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || (darkMode ? '#10b981' : '#059669'), // Emerald 500/600
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
    main: '#312e81',
    background: 'linear-gradient(to bottom, #4f46e5 0%, #4f46e5 50%, #4CB8D4 100%)', // Indigo Dominant -> Sky Blue
    text: '#e2e8f0',
    active: 'rgba(255, 255, 255, 0.12)',
    hover: 'rgba(255, 255, 255, 0.08)',
    activeText: '#ffffff',
  },
  gradients: {
    primary: 'linear-gradient(to right, #4f46e5, #6366f1)',
    secondary: 'linear-gradient(to right, #059669, #10b981)',
  }
});
