import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import {
  IconButton, Tooltip, ListItemButton,
  Typography, Box, Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import ErrorIcon from '@mui/icons-material/Error';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm, formatBoolean, formatPercentage, formatStatus, getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg?react';
import { useAttributePreference } from '../common/util/preferences';
import VehicleNumberPlate from '../common/components/VehicleNumberPlate';

dayjs.extend(relativeTime);

const pngIcons = import.meta.glob('../resources/images/icons/*.png', { eager: true });

const getDeviceIconUrl = (category) => {
  const path = `../resources/images/icons/${category}.png`;
  return pngIcons[path]?.default || mapIcons[mapIconKey(category)];
};

const isPngIcon = (category) => {
  const path = `../resources/images/icons/${category}.png`;
  return !!pngIcons[path];
};

const useStyles = makeStyles()((theme) => ({
  icon: {
    width: '28px',
    height: '28px',
    objectFit: 'contain',
  },
  batteryText: {
    fontSize: '0.75rem',
    fontWeight: 'normal',
    lineHeight: '0.875rem',
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  neutral: {
    color: theme.palette.neutral.main,
  },
  listItem: {
    margin: theme.spacing(0.75, 1),
    width: `calc(100% - ${theme.spacing(2)})`,
    height: 94, // Fixed height for the card itself
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease-in-out',
    padding: theme.spacing(1, 2),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.02),
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[3],
      borderColor: alpha(theme.palette.primary.main, 0.2),
    },
  },
  selected: {
    backgroundColor: `${alpha(theme.palette.primary.main, 0.08)} !important`,
    borderColor: theme.palette.primary.main,
    borderLeftWidth: '5px',
    boxShadow: theme.shadows[2],
  },
}));

const DeviceRow = ({ devices, index, style }) => {
  const theme = useTheme();
  const { classes, cx } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = devices[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');

  const isSelected = selectedDeviceId === item.id;

  const getStatusInfo = () => {
    let statusText;
    if (item.status === 'online' || !item.lastUpdate) {
      statusText = formatStatus(item.status, t);
    } else {
      statusText = dayjs(item.lastUpdate).fromNow();
    }
    const colorKey = getStatusColor(item.status);
    return { text: statusText, color: theme.palette[colorKey].main };
  };

  const status = getStatusInfo();

  return (
    <div style={style}>
      <ListItemButton
        key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        selected={isSelected}
        className={cx(classes.listItem, isSelected && classes.selected)}
        disableGutters
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', gap: 2 }}>
          {/* Left: Icon */}
          <Box sx={{
            width: 50,
            height: 50,
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.action.disabled, 0.08),
            flexShrink: 0,
          }}>
            <img
              className={classes.icon}
              src={getDeviceIconUrl(item.category)}
              alt=""
              style={{
                filter: isPngIcon(item.category) ? undefined : (theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'brightness(0)'),
                transform: 'scale(1.4)',
              }}
            />
          </Box>

          {/* Middle: Content */}
          <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.2 }}>
            <Typography variant="body1" fontWeight={800} color={isSelected ? 'primary.main' : 'text.primary'} noWrap sx={{ fontSize: '0.95rem', lineHeight: 1.2 }}>
              {item[devicePrimary]}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {item.vehicle_number && (
                <Box sx={{ mt: 0.2 }}>
                  <VehicleNumberPlate number={item.vehicle_number} small />
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={status.text}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    backgroundColor: alpha(status.color, 0.12),
                    color: status.color,
                    border: `1px solid ${alpha(status.color, 0.25)}`,
                    borderRadius: '4px',
                    '& .MuiChip-label': { px: 0.8 },
                  }}
                />
                {deviceSecondary && item[deviceSecondary] && (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                    {item[deviceSecondary]}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Right: Icons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
              {position && position.attributes.hasOwnProperty('alarm') && (
                <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                  <IconButton size="small" sx={{ p: 0.3 }}>
                    <ErrorIcon fontSize="small" className={classes.error} sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {position && position.attributes.hasOwnProperty('ignition') && (
                <Tooltip title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}>
                  <IconButton size="small" sx={{ p: 0.3 }}>
                    {position.attributes.ignition ? (
                      <EngineIcon width={18} height={18} className={classes.success} />
                    ) : (
                      <EngineIcon width={18} height={18} className={classes.neutral} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {position && position.attributes.hasOwnProperty('batteryLevel') && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}>
                  {formatPercentage(position.attributes.batteryLevel)}
                </Typography>
                {(position.attributes.batteryLevel > 70 && (
                  position.attributes.charge
                    ? (<BatteryChargingFullIcon sx={{ fontSize: 16 }} className={classes.success} />)
                    : (<BatteryFullIcon sx={{ fontSize: 16 }} className={classes.success} />)
                )) || (position.attributes.batteryLevel > 30 && (
                  position.attributes.charge
                    ? (<BatteryCharging60Icon sx={{ fontSize: 16 }} className={classes.warning} />)
                    : (<Battery60Icon sx={{ fontSize: 16 }} className={classes.warning} />)
                )) || (
                  position.attributes.charge
                    ? (<BatteryCharging20Icon sx={{ fontSize: 16 }} className={classes.error} />)
                    : (<Battery20Icon sx={{ fontSize: 16 }} className={classes.error} />)
                )}
              </Box>
            )}
          </Box>
        </Box>
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
