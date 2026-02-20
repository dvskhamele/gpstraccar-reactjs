import { useState } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  Link,
  Tooltip,
  Box,
  Chip,
} from '@mui/material';
import { makeStyles } from "tss-react/mui";
import CloseIcon from "@mui/icons-material/Close";
import RouteIcon from "@mui/icons-material/Route";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SpeedIcon from "@mui/icons-material/Speed";
import RoomIcon from "@mui/icons-material/Room";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ExploreIcon from "@mui/icons-material/Explore";
import PowerIcon from "@mui/icons-material/Power";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AvTimerIcon from "@mui/icons-material/AvTimer";
import AlarmIcon from "@mui/icons-material/Alarm";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CodeIcon from "@mui/icons-material/Code";
import TerrainIcon from "@mui/icons-material/Terrain";
import TuneIcon from "@mui/icons-material/Tune";

import { useTranslation } from "./LocalizationProvider";
import RemoveDialog from "./RemoveDialog";
import PositionValue from "./PositionValue";
import { useDeviceReadonly, useRestriction } from "../util/permissions";
import usePositionAttributes from "../attributes/usePositionAttributes";
import { devicesActions } from "../../store";
import { useCatch, useCatchCallback } from "../../reactHelper";
import { useAttributePreference } from "../util/preferences";
import fetchOrThrow from "../util/fetchOrThrow";
import VehicleNumberPlate from "./VehicleNumberPlate";
import { formatBoolean, formatDistance, formatVolume } from "../util/formatter";
import { speedFromKnots, speedUnitString } from '../util/converter';
import AddressValue from "./AddressValue";
import BatteryIcon from "./BatteryIcon";
import RssiIcon from "./RssiIcon";

const useStyles = makeStyles()((theme, { desktopPadding }) => ({
  card: {
    pointerEvents: "auto",
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "auto",
      maxWidth: 1700, // Increased width to fit more content
      minHeight: 220, // Reduced height for desktop
      maxHeight: 280, // Reduced max height for desktop
    },
    [theme.breakpoints.down("md")]: {
      width: "100%",
      maxWidth: "100%",
      minHeight: "25vh", // Further reduced height for mobile to accommodate scrollable content
      maxHeight: "35vh", // Reduced max height
      margin: 0,
      borderRadius: theme.spacing(3), // More rounded corners for premium look
      boxShadow: "0px -8px 24px rgba(0,0,0,0.15)", // Enhanced shadow for premium look
    },
    borderRadius: theme.spacing(2),
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // Ensure content doesn't overflow
  },
  header: {
    padding: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(2, 2, 0, 0), // Rounded top corners only
    [theme.breakpoints.down("md")]: {
      position: "sticky",
      top: 0,
      zIndex: 2,
      backgroundColor: theme.palette.background.paper,
    },
  },
  headerButton: {
    alignSelf: "flex-start",
    flexShrink: 0,
    zIndex: 3, // Ensure close button is above other content
  },
  headerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(0.5),
    flex: 1,
    minWidth: 0,
  },
  headerTopRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    width: "100%",
    flexWrap: "wrap", // Wrap items on small screens
  },
  deviceName: {
    fontWeight: 700,
    fontSize: "1rem",
    color: theme.palette.primary.main,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flexGrow: 1,
  },
  vehiclePlate: {
    flexShrink: 0,
  },
  statusChip: {
    height: 24,
    fontSize: "0.75rem",
    fontWeight: 600,
    flexShrink: 0,
  },
  addressContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    width: "100%",
    minWidth: 0, // Allows flex child to shrink below content size
    flexWrap: "wrap", // Allow wrapping on small screens
    wordBreak: "break-word", // Break long addresses
    fontSize: "0.75rem", // Smaller font size
    [theme.breakpoints.down("md")]: {
      flexWrap: "wrap",
      wordBreak: "break-word",
      fontSize: "0.75rem", // Smaller font on mobile
    },
  },
  content: {
    padding: theme.spacing(0.15),
    flex: 1,
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("md")]: {
      maxHeight: "calc(35vh - 120px)", // Adjust based on header and footer heights
      minHeight: "0",
      overflowY: "auto", // Enable vertical scrolling on mobile
      overflowX: "hidden", // Prevent horizontal scrolling
    },
    [theme.breakpoints.up("md")]: {
      overflowY: "auto", // Enable scrolling on desktop when content overflows
      minHeight: "80px", // Reduced minimum height for desktop content
    },
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: theme.spacing(1),
    width: "100%",
    height: "100%",
    [theme.breakpoints.down("md")]: {
      display: "flex",
      flexDirection: "column",
      height: "auto",
      overflowY: "auto", // Enable vertical scrolling on mobile
      overflowX: "hidden", // Prevent horizontal scrolling
    },
  },
  speedSection: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center", // Center items vertically
    justifyContent: "space-between",
    padding: theme.spacing(0.25),
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
    borderRadius: theme.spacing(2),
    margin: theme.spacing(0.25, 0),
    [theme.breakpoints.down("md")]: {
      display: "flex",
      flexDirection: "row", // Keep as row for side-by-side layout on mobile
      padding: theme.spacing(0.25), // Further reduced padding for mobile
      alignItems: "center", // Center items vertically
      flex: "0 0 auto", // Don't grow on mobile
      gap: theme.spacing(0.25), // Further reduced gap between elements
      width: "100%", // Ensure full width on mobile
      boxSizing: "border-box", // Ensure padding is included in width calculation
    },
  },
  speedGaugeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto", // Don't grow on mobile
    padding: theme.spacing(0.25),
    [theme.breakpoints.down("sm")]: {
      flex: "0 0 calc(45% - 8px)", // Take up to 45% minus some space for gap to prevent overflow
      alignItems: "center", // Center content in the allocated space
      justifyContent: "center",
      boxSizing: "border-box", // Ensure padding is included in width calculation
    },
    [theme.breakpoints.up("md")]: {
      flex: "0 0 40%", // On desktop, take up 40% of the space
    },
  },
  mobileDataBox: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
    borderRadius: theme.spacing(2),
    boxShadow:
      '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // Tailwind-inspired shadow
    width: 200, // Reduced width
  },
  speedGaugeBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
    borderRadius: theme.spacing(2),
    boxShadow:
      '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // Tailwind-inspired shadow
    width: 110,
  },
  mobileDataItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[700]
        : theme.palette.grey[100],
    flex: '1 1 calc(50% - 8px)', // Two items per row with a gap (2 * theme.spacing(1) for gap / 2 for each side)
    boxSizing: 'border-box', // Include padding in the width calculation
  },
  mobileDataValue: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: theme.palette.text.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  batteryRssiContainer: {
    display: "flex",
    gap: theme.spacing(0.5), // More compact gap
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      flex: "0 0 auto", // Don't grow on mobile
      gap: theme.spacing(0.5), // Compact gap on mobile
    },
  },
  dataGrid: {
    display: "grid",
    gridTemplateRows: "1fr 1fr",
    gap: theme.spacing(1),
    width: "100%",
    height: "100%",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexDirection: "column", // Column layout for vertical scrolling
      flex: "0 0 auto", // Don't grow on mobile
      width: "100%", // Full width
      padding: theme.spacing(1, 0), // Add some padding for spacing
      boxSizing: "border-box", // Ensure padding is included in width calculation
    },
    [theme.breakpoints.up("md")]: {
      display: "flex",
      flexDirection: "column", // Same as mobile
      flex: "0 0 auto", // Don't grow on desktop
      width: "100%", // Full width
      padding: theme.spacing(1, 0), // Add some padding for spacing
      boxSizing: "border-box", // Ensure padding is included in width calculation
    },
  },
  dataRow: {
    display: "flex",
    flexWrap: "wrap", // Allow items to wrap to next line
    gap: theme.spacing(0.5),
    width: "100%", // Ensure full width
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap", // Allow wrapping on mobile
      flexDirection: "row", // Keep as row for side-by-side layout
      paddingBottom: theme.spacing(0.5),
      width: "100%", // Use full width
      justifyContent: "flex-start", // Align items to start
    },
    [theme.breakpoints.up("md")]: {
      flexWrap: "wrap", // Allow wrapping on desktop too
      flexDirection: "row", // Same as mobile
      paddingBottom: theme.spacing(0.5),
      width: "100%", // Use full width
      justifyContent: "flex-start", // Align items to start
    },
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0.5),
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[50],
    borderRadius: theme.spacing(1.5),
    minWidth: 55, // Increased min width to better accommodate 3 columns
    height: 85, // Increased height for better appearance
    justifyContent: "center",
    flexDirection: "column", // Stack icon and text vertically on mobile
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)", // Subtle shadow for depth
    boxSizing: "border-box", // Ensure padding is included in width calculation
    overflow: "hidden", // Prevent content from overflowing
    [theme.breakpoints.down("sm")]: {
      flex: "0 0 calc(33.33% - 6px)", // Three items per row with reduced gap
      height: 85, // Increased height on mobile
      marginBottom: theme.spacing(0.5), // Increased space between items when wrapped
    },
    [theme.breakpoints.up("md")]: {
      flexDirection: "column", // Keep column layout on desktop too, like mobile
      justifyContent: "center",
      textAlign: "center",
      height: 85,
      minWidth: 70,
      padding: theme.spacing(0.5),
    },
  },
  statIcon: {
    marginRight: theme.spacing(1),
    fontSize: "1.5rem",
    minWidth: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
      marginBottom: theme.spacing(0.5),
    },
    [theme.breakpoints.up("md")]: {
      marginRight: 0, // Same as mobile
      marginBottom: theme.spacing(0.5), // Increased spacing
    },
  },
  statLabel: {
    fontSize: "0.65rem",
    color: theme.palette.text.secondary,
    whiteSpace: "nowrap",
    marginBottom: theme.spacing(0.2),
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  statValue: {
    fontWeight: 600,
    fontSize: "0.8rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  statContainer: {
    padding: theme.spacing(0.5),
    flex: "1 1 120px", // Allow flex-grow, flex-shrink, and set a basis
    minWidth: 120,
    boxSizing: "border-box", // Ensure padding is included in width calculation
    [theme.breakpoints.down("sm")]: {
      flex: "0 0 auto", // Don't grow on mobile
    },
    [theme.breakpoints.up("md")]: {
      flex: "0 0 auto", // Don't grow on desktop either, same as mobile
    },
  },
  actions: {
    justifyContent: "space-around", // Space out actions evenly on mobile
    padding: theme.spacing(0.15, 0.25),
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
    borderTop: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down("md")]: {
      position: "sticky",
      bottom: 0,
      zIndex: 2,
      backgroundColor: theme.palette.background.paper,
    },
  },
  root: {
    pointerEvents: "none",
    position: "fixed",
    zIndex: 5,
    left: "50%",
    transform: "translateX(-50%)",
    [theme.breakpoints.up("md")]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
      width: "auto",
    },
    [theme.breakpoints.down("md")]: {
      bottom: theme.spacing(10), // Increased margin from bottom to move component higher
      left: theme.spacing(1),
      right: theme.spacing(1),
      width: `calc(100% - ${theme.spacing(2)})`, // Account for left and right margins (1 unit each side = 2 units total)
      transform: "none",
      maxWidth: "none",
      borderRadius: theme.spacing(2), // Rounded all corners
      boxShadow: "0px -4px 12px rgba(0,0,0,0.1)", // Shadow facing upward
    },
  },
  batteryContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
}));

// Custom SpeedGauge Component
const SpeedGauge = ({ speed: rawSpeed, speedLimit: rawSpeedLimit }) => {
  const t = useTranslation();
  const speedUnit = useAttributePreference('speedUnit', 'kmh');

  const speed = speedFromKnots(rawSpeed, speedUnit);
  const speedLimit = rawSpeedLimit ? speedFromKnots(rawSpeedLimit, speedUnit) : null;
  const isOverSpeed = speedLimit && speed > speedLimit;

  const unit = speedUnitString(speedUnit, t);
  const maxSpeed = speedUnit === 'kmh' ? 120 : (speedUnit === 'mph' ? 80 : 65);

  const percentage = Math.min(((speed || 0) / maxSpeed) * 100, 100);
  const circumference = 2 * Math.PI * 35; // increased radius for larger display
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on speed and limit
  let color = '#4caf50'; // green
  if (isOverSpeed) {
    color = '#f44336'; // red
  } else {
    if (speed > maxSpeed * 0.7) color = '#ff9800'; // orange
    if (speed > maxSpeed * 0.9) color = '#f44336'; // red
  }

  return (
    <Box sx={{ position: 'relative', width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="5"
        />
        {/* Progress circle */}
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 'bold',
            transition: 'all 0.5s ease-in-out',
            color: isOverSpeed ? '#f44336' : 'inherit',
            lineHeight: 1,
          }}
        >
          {Math.round(speed || 0)}
        </Typography>
        <Typography
          variant="caption"
          component="div"
          sx={{
            color: isOverSpeed ? '#f44336' : 'inherit',
            fontSize: isOverSpeed ? '0.6rem' : '0.75rem',
            fontWeight: isOverSpeed ? 'bold' : 'normal',
            textAlign: 'center',
          }}
        >
          {isOverSpeed ? t('attributeSpeedLimit').toUpperCase() : unit}
        </Typography>
      </Box>
    </Box>
  );
};

const StatusCard = ({
  deviceId,
  position,
  onClose,
  disableActions,
  desktopPadding = 0,
}) => {
  const { classes } = useStyles({ desktopPadding });
  const distanceUnit = useAttributePreference("distanceUnit");

  const attributeIcons = {
    fixTime: <AccessTimeIcon fontSize="small" style={{ color: "#2196f3" }} />,
    deviceTime: (
      <AccessTimeIcon fontSize="small" style={{ color: "#2196f3" }} />
    ),
    serverTime: (
      <AccessTimeIcon fontSize="small" style={{ color: "#2196f3" }} />
    ),
    address: <RoomIcon fontSize="small" style={{ color: "#4caf50" }} />,
    speed: <SpeedIcon fontSize="small" style={{ color: "#4caf50" }} />,
    todayDistance: (
      <DirectionsCarIcon fontSize="small" style={{ color: "#8bc34a" }} />
    ),
    todayStartTime: (
      <AccessTimeIcon fontSize="small" style={{ color: "#2196f3" }} />
    ),
    totalDistance: (
      <DirectionsCarIcon fontSize="small" style={{ color: "#8bc34a" }} />
    ),
    latitude: <MyLocationIcon fontSize="small" style={{ color: "#009688" }} />,
    longitude: <MyLocationIcon fontSize="small" style={{ color: "#009688" }} />,
    altitude: <TerrainIcon fontSize="small" style={{ color: "#795548" }} />,
    course: <ExploreIcon fontSize="small" style={{ color: "#3f51b5" }} />,
    ignition: <VpnKeyIcon fontSize="small" style={{ color: "#ffc107" }} />,
    motion: <DirectionsCarIcon fontSize="small" style={{ color: "#9c27b0" }} />,
    odometer: <AvTimerIcon fontSize="small" style={{ color: "#673ab7" }} />,
    geofenceIds: <RoomIcon fontSize="small" style={{ color: "#e91e63" }} />,
    sat: <LocationSearchingIcon fontSize="small" style={{ color: "#03a9f4" }} />,
    fuel: <LocalGasStationIcon fontSize="small" style={{ color: "#ff9800" }} />,
    fuelUsed: <LocalGasStationIcon fontSize="small" style={{ color: "#ff9800" }} />,
    fuelConsumption: <LocalGasStationIcon fontSize="small" style={{ color: "#ff9800" }} />,
    charge: <PowerIcon fontSize="small" style={{ color: "#ffc107" }} />,
    operator: <InfoOutlinedIcon fontSize="small" style={{ color: "#00bcd4" }} />,
    alarm: <AlarmIcon fontSize="small" style={{ color: "#f44336" }} />,
    status: <InfoOutlinedIcon fontSize="small" style={{ color: "#4caf50" }} />,
    protocol: <CodeIcon fontSize="small" style={{ color: "#607d8b" }} />,
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction("readonly");
  const deviceReadonly = useDeviceReadonly();

  const shareDisabled = useSelector(
    (state) => state.session.server.attributes.disableShare,
  );
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference(
    "positionItems",
    "fixTime,totalDistance,course,ignition,motion,odometer,todayStartTime",
  );
  const volumeUnit = useAttributePreference('volumeUnit');

  const navigationAppLink = useAttributePreference("navigationAppLink");
  const navigationAppTitle = useAttributePreference("navigationAppTitle");

  const [anchorEl, setAnchorEl] = useState(null);

  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow("/api/devices");
      dispatch(devicesActions.refresh(await response.json()));
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t("sharedGeofence"),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetchOrThrow("/api/geofences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    const item = await response.json();
    await fetchOrThrow("/api/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: position.deviceId,
        geofenceId: item.id,
      }),
    });
    navigate(`/settings/geofence/${item.id}`);
  }, [navigate, position]);

  // Determine device status for chip and handle stale data
  const isLatest = position && device && position.id === device.positionId;
  const isStale = isLatest && (device.status !== 'online' || dayjs().diff(dayjs(position.fixTime), 'minutes') > 2);
  
  const rawMotion = position?.attributes.hasOwnProperty('motion') ? position.attributes.motion : position?.speed > 0;
  const effectiveMotion = isStale ? false : rawMotion;

  const getStatusColor = (device, position) => {
    if (!position) return "default";
    if (isStale) return "warning";
    if (position.attributes.ignition === true) return "success";
    if (effectiveMotion) return "info";
    return "warning";
  };

  const statusColor = position ? getStatusColor(device, position) : "default";
  const statusText = position
    ? isStale 
      ? (device.status === 'offline' ? t("deviceOffline") : t("deviceStopped"))
      : position.attributes.ignition === true
        ? t("deviceEngineOn")
        : effectiveMotion
          ? t("deviceMoving")
          : t("deviceStopped")
    : t("deviceOffline");

  const effectiveSpeed = position && (isStale ? 0 : (position.attributes.motion === false ? 0 : position.speed));

  return (
    <>
      <div className={classes.root}>
        {device && (
          <Rnd
            default={{ x: 0, y: 0, width: "auto", height: "auto" }}
            enableResizing={false}
            dragHandleClassName="draggable-header"
            cancel=".MuiIconButton-root" /* Prevent dragging when clicking the close button */
            style={{ position: "relative" }}
          >
            <Card elevation={3} className={classes.card}>
              <div className={`${classes.header} draggable-header`}>
                <Box className={classes.headerContent}>
                  <Box className={classes.headerTopRow}>
                    <Typography variant="h6" className={classes.deviceName}>
                      {device.name}
                    </Typography>
                    {device.vehicle_number && (
                      <div className={classes.vehiclePlate}>
                        <VehicleNumberPlate number={device.vehicle_number} />
                      </div>
                    )}
                    <Chip
                      label={statusText}
                      size="small"
                      className={classes.statusChip}
                      color={statusColor}
                      variant="filled"
                    />
                  </Box>
                  <div className={classes.addressContainer}>
                    <RoomIcon
                      fontSize="small"
                      style={{ color: "#4caf50", fontSize: "1rem" }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap={false}
                      style={{ wordBreak: "break-word" }}
                    >
                      <AddressValue
                        latitude={position?.latitude}
                        longitude={position?.longitude}
                        originalAddress={position?.address}
                      />
                    </Typography>
                  </div>
                </Box>
                <IconButton
                  size="small"
                  onClick={onClose}
                  className={classes.headerButton}
                  edge="end"
                >
                  <CloseIcon />
                </IconButton>
              </div>
              {position && (
                <>
                  <CardContent className={classes.content}>
                    <Box
                      sx={() => ({
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        padding: 1,
                        gap: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        "&::-webkit-scrollbar": {
                          display: "none",
                        },
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      })}
                    >
                      {/* Speed Gauge on Left */}
                      <Box className={classes.speedGaugeBox}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                                                      <SpeedGauge
                                                        speed={effectiveSpeed || 0}
                                                        speedLimit={device.attributes.speedLimit}
                                                      />                          <Typography
                            variant="caption"
                            className={classes.statLabel}
                            sx={{ mt: 0.5 }}
                          >
                            {t('positionSpeed')}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Mobile Data Box - Battery, RSSI, Distance, and Time */}
                      <div className={classes.mobileDataBox}>
                        {/* Battery Level */}
                        <div className={classes.mobileDataItem}>
                          <BatteryIcon
                            batteryLevel={position.attributes.batteryLevel}
                            style={{ fontSize: '1rem', color: '#4caf50' }}
                          />
                          <Typography
                            variant="caption"
                            className={classes.mobileDataValue}
                          >
                            {position.attributes.batteryLevel !== undefined
                              ? `${position.attributes.batteryLevel}%`
                              : '-'}
                          </Typography>
                        </div>

                        {/* RSSI */}
                        <div className={classes.mobileDataItem}>
                          <RssiIcon
                            rssi={position.attributes.rssi}
                            style={{ fontSize: '1rem', color: '#ff9800' }}
                          />
                          <Typography
                            variant="caption"
                            className={classes.mobileDataValue}
                          >
                            {position.attributes.rssi !== undefined
                              ? `${position.attributes.rssi} dBm`
                              : '-'}
                          </Typography>
                        </div>

                        {/* Today Distance */}
                        {device.todayDistance !== undefined && (
                          <div className={classes.mobileDataItem}>
                            <DirectionsCarIcon
                              fontSize="small"
                              style={{ fontSize: '1rem', color: '#4caf50' }}
                            />
                            <Typography
                              variant="caption"
                              className={classes.mobileDataValue}
                            >
                              {formatDistance(
                                device.todayDistance,
                                distanceUnit,
                                t,
                              )}
                            </Typography>
                          </div>
                        )}

                                                  {/* Fuel Used Today */}
                                                  {device.attributes.fuelConsumption !== undefined && device.todayDistance !== undefined && (
                                                    <div className={classes.mobileDataItem}>
                                                      <LocalGasStationIcon
                                                        fontSize="small"
                                                        style={{ fontSize: '1rem', color: '#f44336' }}
                                                      />
                                                      <Typography variant="caption" className={classes.mobileDataValue}>
                                                        {formatVolume(
                                                          (device.todayDistance / 1000) / (device.attributes.fuelConsumption || 1),
                                                          volumeUnit,
                                                          t,
                                                        )}
                                                      </Typography>
                                                    </div>
                                                  )}
                        {/* Fuel Level */}
                        {position.attributes.fuel !== undefined && (
                          <div className={classes.mobileDataItem}>
                            <LocalGasStationIcon
                              fontSize="small"
                              style={{ fontSize: '1rem', color: '#ff9800' }}
                            />
                            <Typography
                              variant="caption"
                              className={classes.mobileDataValue}
                            >
                              {`${position.attributes.fuel.toFixed(2)} %`}
                            </Typography>
                          </div>
                        )}

                        {/* Fuel Used */}
                        {position.attributes.fuelUsed !== undefined && (
                          <div className={classes.mobileDataItem}>
                            <LocalGasStationIcon
                              fontSize="small"
                              style={{ fontSize: '1rem', color: '#ff9800' }}
                            />
                            <Typography
                              variant="caption"
                              className={classes.mobileDataValue}
                            >
                              {formatVolume(position.attributes.fuelUsed, volumeUnit, t)}
                            </Typography>
                          </div>
                        )}

                        {/* Fuel Consumption - Alternative/Fallback */}
                        {position.attributes.fuelConsumption !== undefined && position.attributes.fuelUsed === undefined && (
                          <div className={classes.mobileDataItem}>
                            <LocalGasStationIcon
                              fontSize="small"
                              style={{ fontSize: '1rem', color: '#ff9800' }}
                            />
                            <Typography
                              variant="caption"
                              className={classes.mobileDataValue}
                            >
                              {formatVolume(position.attributes.fuelConsumption, volumeUnit, t)}
                            </Typography>
                          </div>
                        )}

                        {/* Today Start Time */}
                        {device.todayStartTime !== undefined && (
                          <div className={classes.mobileDataItem}>
                            <AccessTimeIcon
                              fontSize="small"
                              style={{ fontSize: '1rem', color: '#2196f3' }}
                            />
                                                          <Typography
                                                            variant="caption"
                                                            className={classes.mobileDataValue}
                                                          >
                                                            {device.todayStartTime
                                                              ? dayjs(device.todayStartTime).format('hh:mm A')
                                                              : '0'}
                                                          </Typography>                          </div>
                                                )}
                                              </div>
                        
                                              {/* Odometer Box */}
                                              <div className={classes.statContainer}>
                                                <div className={classes.statItem}>
                                                  <div className={classes.statIcon}>
                                                    {attributeIcons.odometer}
                                                  </div>
                                                  <Box>
                                                    <Typography variant="caption" className={classes.statLabel}>
                                                      {positionAttributes.odometer?.name || t('positionOdometer')}
                                                    </Typography>
                                                    <Typography variant="body2" className={classes.statValue}>
                                                      {formatDistance(
                                                        (device.attributes.odometer || 0) + (position.attributes.totalDistance || 0),
                                                        distanceUnit,
                                                        t,
                                                      )}
                                                    </Typography>
                                                  </Box>
                                                </div>
                                              </div>
                        
                                              {/* Motion Box */}
                                              {(position.attributes.hasOwnProperty('motion') || position.speed !== undefined) && (
                                                <div className={classes.statContainer}>
                                                  <div className={classes.statItem}>
                                                    <div className={classes.statIcon}>
                                                      {attributeIcons.motion}
                                                    </div>
                                                    <Box>
                                                      <Typography variant="caption" className={classes.statLabel}>
                                                        {positionAttributes.motion?.name || t('positionMotion')}
                                                      </Typography>
                                                      <Typography variant="body2" className={classes.statValue}>
                                                        {formatBoolean(effectiveMotion, t)}
                                                      </Typography>
                                                    </Box>
                                                  </div>
                                                </div>
                                              )}
                        
                                              {/* Map stat items directly here for continuous wrapping */}
                                              {positionItems.split(',').map((key) => {
                                                const trimmedKey = key.trim();
                                                if (
                                                  trimmedKey === 'address'
                                                  || trimmedKey === 'speed'
                                                  || trimmedKey === 'batteryLevel'
                                                  || trimmedKey === 'rssi'
                                                  || trimmedKey === 'todayDistance'
                                                  || trimmedKey === 'todayStartTime'
                                                  || trimmedKey === 'fuel'
                                                  || trimmedKey === 'fuelUsed'
                                                  || trimmedKey === 'fuelConsumption'
                                                  || trimmedKey === 'odometer'
                                                  || trimmedKey === 'motion'
                                                ) {
                                                  return null;
                                                }
                        
                                                if (
                                                  !position.hasOwnProperty(trimmedKey)
                                                  && !position.attributes.hasOwnProperty(trimmedKey)
                                                ) {
                                                  return null;
                                                }

                        return (
                          <div
                            key={trimmedKey}
                            className={classes.statContainer}
                          >
                            <div className={classes.statItem}>
                              {attributeIcons[trimmedKey] && (
                                <div className={classes.statIcon}>
                                  {attributeIcons[trimmedKey]}
                                </div>
                              )}
                              <Box>
                                <Typography
                                  variant="caption"
                                  className={classes.statLabel}
                                >
                                  {positionAttributes[trimmedKey]?.name || trimmedKey}
                                </Typography>
                                {(() => {
                                  if (
                                    trimmedKey === 'fixTime'
                                    || trimmedKey === 'deviceTime'
                                    || trimmedKey === 'serverTime'
                                  ) {
                                    return (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          flexDirection: 'column',
                                          width: '100%',
                                          mt: 0.2,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            backgroundColor: '#e3f2fd', // Light Blue
                                            color: '#1e88e5', // Darker Blue Text
                                            padding: '1px 2px',
                                            borderRadius: '3px',
                                            textAlign: 'center',
                                            fontSize: '0.6rem',
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              display: 'block',
                                              fontWeight: 'bold',
                                              fontSize: '0.6rem',
                                            }}
                                          >
                                            {dayjs(position[trimmedKey]).format(
                                              'DD/MMM/YYYY',
                                            )}
                                          </Typography>
                                        </Box>
                                        <Box
                                          sx={{
                                            backgroundColor: '#90caf9', // Medium Blue
                                            color: '#0d47a1', // Darkest Blue Text
                                            padding: '1px 2px',
                                            borderRadius: '3px',
                                            textAlign: 'center',
                                            fontSize: '0.6rem',
                                            mt: 0.1,
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              display: 'block',
                                              fontWeight: 'bold',
                                              fontSize: '0.6rem',
                                            }}
                                          >
                                            {dayjs(position[trimmedKey]).format(
                                              'hh:mm A',
                                            )}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    );
                                  }
                                  return (
                                    <Typography
                                      variant="body2"
                                      className={classes.statValue}
                                      sx={{
                                        fontSize:
                                          trimmedKey === 'fixTime'
                                          || trimmedKey === 'deviceTime'
                                          || trimmedKey === 'serverTime'
                                            ? '0.6rem'
                                            : '0.8rem',
                                      }}
                                    >
                                      <PositionValue
                                        position={position}
                                        property={
                                          position.hasOwnProperty(trimmedKey)
                                            ? trimmedKey
                                            : null
                                        }
                                        attribute={
                                          position.hasOwnProperty(trimmedKey)
                                            ? null
                                            : trimmedKey
                                        }
                                      />
                                    </Typography>
                                  );
                                })()}
                              </Box>
                            </div>
                          </div>
                        );
                      })}
                    </Box>
                  </CardContent>
                  <Box
                    sx={{
                      py: 0.5,
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
                      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Link
                      component={RouterLink}
                      underline="hover"
                      to={`/position/${position.id}`}
                      variant="caption"
                      color="primary"
                    >
                      {t("sharedShowDetails")}
                    </Link>
                  </Box>
                </>
              )}
              <CardActions classes={{ root: classes.actions }} disableSpacing>
                <Tooltip title={t("mapOptions")}>
                  <IconButton
                    size="small"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    disabled={!position}
                  >
                    <TuneIcon style={{ color: "#2196f3" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("reportReplay")}>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
                    disabled={disableActions || !position}
                  >
                    <RouteIcon style={{ color: "#4caf50" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("commandTitle")}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      navigate(`/settings/device/${deviceId}/command`)
                    }
                    disabled={disableActions}
                  >
                    <SendIcon style={{ color: "#ff9800" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("sharedEdit")}>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/settings/device/${deviceId}`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <EditIcon style={{ color: "#9c27b0" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("sharedRemove")}>
                  <IconButton
                    size="small"
                    onClick={() => setRemoving(true)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <DeleteIcon style={{ color: "#f44336" }} />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Rnd>
        )}
      </div>
      {position && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {!readonly && (
            <MenuItem onClick={handleGeofence}>
              {t("sharedCreateGeofence")}
            </MenuItem>
          )}
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
          >
            {t("linkGoogleMaps")}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
          >
            {t("linkAppleMaps")}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
          >
            {t("linkStreetView")}
          </MenuItem>
          {navigationAppTitle && (
            <MenuItem
              component="a"
              target="_blank"
              href={navigationAppLink
                .replace("{latitude}", position.latitude)
                .replace("{longitude}", position.longitude)}
            >
              {navigationAppTitle}
            </MenuItem>
          )}
          {!shareDisabled && !user.temporary && (
            <MenuItem
              onClick={() => navigate(`/settings/device/${deviceId}/share`)}
            >
              <Typography color="secondary">{t("deviceShare")}</Typography>
            </MenuItem>
          )}
        </Menu>
      )}
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </>
  );
};

export default StatusCard;
