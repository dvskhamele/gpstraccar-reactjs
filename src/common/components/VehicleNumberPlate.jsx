import { Box, Typography } from '@mui/material';

const VehicleNumberPlate = ({ number, small }) => {
  if (!number) return null;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1.5px solid #000',
        borderRadius: '4px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        height: small ? '18px' : '28px',
        verticalAlign: 'middle',
        width: 'fit-content',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#0033aa',
          color: '#fff',
          px: small ? 0.3 : 0.5,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: small ? '0.45rem' : '0.6rem',
          fontWeight: 'bold',
          borderRight: '1px solid #000',
        }}
      >
        IND
      </Box>
      <Typography
        sx={{
          px: small ? 0.5 : 1,
          color: '#000',
          fontWeight: 900,
          fontSize: small ? '0.65rem' : '0.8rem',
          letterSpacing: '0.2px',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          lineHeight: 1,
        }}
      >
        {number.toUpperCase()}
      </Typography>
    </Box>
  );
};

export default VehicleNumberPlate;
