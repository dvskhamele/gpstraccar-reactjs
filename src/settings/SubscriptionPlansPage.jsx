import { useState } from 'react';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Switch,
  TableFooter,
  FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffectAsync } from '../reactHelper';
import { formatNumber, formatDateWithMonthText } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import { useManager } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#333',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: 'background-color 0.2s ease-in-out',
}));

const SubscriptionPlansPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const manager = useManager();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/subscriptionPlans');
      const allItems = await response.json();
      console.log('Subscription plans response:', allItems); // Debug log

      if (showInactive) {
        setItems(allItems);
      } else {
        setItems(allItems.filter(item => Boolean(item.active)));
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      setItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [timestamp, showInactive]);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsSubscriptionPlans']}>
      <Table className={classes.table} stickyHeader>
        <TableHead className={classes.tableHead}>
          <TableRow>
            <TableCell className={classes.tableHeadCell}>{t('sharedName')}</TableCell>
            <TableCell className={classes.tableHeadCell}>{t('subscriptionDurationDays')}</TableCell>
            <TableCell className={classes.tableHeadCell}>{t('subscriptionPrice')}</TableCell>
            <TableCell className={classes.tableHeadCell}>{t('sharedStatus')}</TableCell>
            <TableCell className={classes.tableHeadCell}>{t('sharedDate')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && items ? items.map((item) => (
            <StyledTableRow key={item.id ? item.id : Math.random()}>
              <TableCell style={{ padding: '12px 16px' }}>{item.name || 'N/A'}</TableCell>
              <TableCell style={{ padding: '12px 16px' }}>{item.duration_days || item.durationDays || 'N/A'}</TableCell>
              <TableCell style={{ padding: '12px 16px' }}>₹{formatNumber(item.price || 0)}</TableCell>
              <TableCell style={{ padding: '12px 16px' }}>
                {(() => {
                  const isActive = Boolean(item.active);
                  const statusText = isActive ? t('sharedActive') : t('sharedInactive');
                  const bgColor = isActive ? '#e8f5e9' : '#ffebee';
                  const textColor = isActive ? '#2e7d32' : '#c62828';
                  return (
                    <div
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        height: '24px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 12px',
                        fontSize: '0.8rem'
                      }}
                    >
                      {statusText}
                    </div>
                  );
                })()}
              </TableCell>
              <TableCell style={{ padding: '12px 16px' }}>
                {item.created_at ? formatDateWithMonthText(item.created_at) : 'N/A'}
              </TableCell>
              <TableCell className={classes.columnAction} padding="none" style={{ padding: '12px 16px' }}>
                <CollectionActions
                  itemId={item.id}
                  editPath="/settings/subscription-plan"
                  endpoint="subscriptionPlans"
                  setTimestamp={setTimestamp}
                  customActions={[]}
                />
              </TableCell>
            </StyledTableRow>
          )) : (<TableShimmer columns={6} endAction />)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} align="right">
              <FormControlLabel
                control={
                  <Switch
                    value={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    size="small"
                  />
                }
                label={t('subscriptionShowInactive')}
                labelPlacement="start"
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      {manager && <CollectionFab editPath="/settings/subscription-plan" />}
    </PageLayout>
  );
};

export default SubscriptionPlansPage;