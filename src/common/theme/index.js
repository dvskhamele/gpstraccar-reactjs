import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import dimensions from './dimensions';
import components from './components';

export default (server, darkMode, direction) => useMemo(() => createTheme({
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif",
    fontSize: 13,
    h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '2rem' },
    h2: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '1.75rem' },
    h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '1.5rem' },
    h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '1rem' },
    button: { fontFamily: "'Inter', sans-serif", fontWeight: 600 },
  },
  palette: palette(server, darkMode),
  direction,
  dimensions,
  components,
}), [server, darkMode, direction]);
