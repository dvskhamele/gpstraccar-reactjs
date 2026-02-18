import React from 'react';
import {
  BatteryFull, Battery60, Battery30, Battery20, BatteryAlert,
} from '@mui/icons-material';

const BatteryIcon = ({ batteryLevel }) => {
  if (batteryLevel > 90) {
    return <BatteryFull style={{ color: '#4caf50' }} />;
  } if (batteryLevel > 60) {
    return <BatteryFull style={{ color: '#8bc34a' }} />;
  } if (batteryLevel > 30) {
    return <Battery60 style={{ color: '#ffc107' }} />;
  } if (batteryLevel > 20) {
    return <Battery30 style={{ color: '#ff9800' }} />;
  } if (batteryLevel > 0) {
    return <Battery20 style={{ color: '#f44336' }} />;
  }
  return <BatteryAlert style={{ color: '#f44336' }} />;
};

export default BatteryIcon;
