import React from 'react';
import {
  SignalCellular4Bar, SignalCellular3Bar, SignalCellular2Bar, SignalCellular1Bar, SignalCellular0Bar,
} from '@mui/icons-material';

const RssiIcon = ({ rssi }) => {
  if (rssi > -70) {
    return <SignalCellular4Bar style={{ color: '#4caf50' }} />;
  } if (rssi > -85) {
    return <SignalCellular3Bar style={{ color: '#8bc34a' }} />;
  } if (rssi > -100) {
    return <SignalCellular2Bar style={{ color: '#ffc107' }} />;
  } if (rssi > -110) {
    return <SignalCellular1Bar style={{ color: '#ff9800' }} />;
  }
  return <SignalCellular0Bar style={{ color: '#f44336' }} />;
};

export default RssiIcon;
