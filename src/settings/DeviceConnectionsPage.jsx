import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Tab, Tabs, Box,
} from '@mui/material';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { formatNotificationTitle } from '../common/util/formatter';
import PageLayout from '../common/components/PageLayout';
import CheckboxConnectionsController from '../common/components/CheckboxConnectionsController';
import useFeatures from '../common/util/useFeatures';

const TabPanel = (props) => {
  const {
    children, value, index, ...other
  } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const DeviceConnectionsPage = () => {
  const t = useTranslation();
  const { id } = useParams();
  const features = useFeatures();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const allConnectionConfigs = [
    {
      label: t('sharedGeofences'),
      endpointAll: '/api/geofences',
      endpointLinked: `/api/geofences?deviceId=${id}`,
      keyLink: 'geofenceId',
    },
    {
      label: t('settingsGroups'),
      endpointAll: '/api/groups',
      endpointLinked: `/api/groups?deviceId=${id}`,
      keyLink: 'groupId',
      titleGetter: (it) => it.name || `Group #${it.id}`,
      feature: !features.disableGroups,
    },
    {
      label: t('sharedNotifications'),
      endpointAll: '/api/notifications',
      endpointLinked: `/api/notifications?deviceId=${id}`,
      keyLink: 'notificationId',
      titleGetter: (it) => formatNotificationTitle(t, it),
    },
    {
      label: t('sharedDrivers'),
      endpointAll: '/api/drivers',
      endpointLinked: `/api/drivers?deviceId=${id}`,
      keyLink: 'driverId',
      titleGetter: (it) => `${it.name} (${it.uniqueId})`,
      feature: !features.disableDrivers,
    },
    {
      label: t('sharedComputedAttributes'),
      endpointAll: '/api/attributes/computed',
      endpointLinked: `/api/attributes/computed?deviceId=${id}`,
      keyLink: 'attributeId',
      titleGetter: (it) => it.description,
      feature: !features.disableComputedAttributes,
    },
    {
      label: t('sharedSavedCommands'),
      endpointAll: '/api/commands',
      endpointLinked: `/api/commands?deviceId=${id}`,
      keyLink: 'commandId',
      titleGetter: (it) => it.description,
      feature: !features.disableSavedCommands,
    },
    {
      label: t('sharedMaintenance'),
      endpointAll: '/api/maintenance',
      endpointLinked: `/api/maintenance?deviceId=${id}`,
      keyLink: 'maintenanceId',
      feature: !features.disableMaintenance,
    },
  ];

  const connectionConfigs = allConnectionConfigs.filter((c) => c.feature !== false);

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice', 'sharedConnections']}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
          {connectionConfigs.map((config) => <Tab label={config.label} key={config.label} />)}
        </Tabs>
      </Box>
      {connectionConfigs.map((config, index) => (
        <TabPanel value={value} index={index} key={config.label}>
          <CheckboxConnectionsController
            baseId={id}
            keyBase="deviceId"
            endpointAll={config.endpointAll}
            endpointLinked={config.endpointLinked}
            keyLink={config.keyLink}
            titleGetter={config.titleGetter}
          />
        </TabPanel>
      ))}
    </PageLayout>
  );
};

export default DeviceConnectionsPage;
