import React from 'react';
import { Box, keyframes } from '@mui/system';
import logo from '../../resources/images/maskable-icon-512x512.png';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const CustomLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 9999,
    }}
  >
    <img
      src={logo}
      alt="Loading..."
      style={{
        width: '150px',
        height: '150px',
        animation: `${pulse} 2s infinite ease-in-out`,
      }}
    />
  </Box>
);

export default CustomLoader;
