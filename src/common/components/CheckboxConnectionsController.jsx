import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Skeleton,
} from '@mui/material';
import { useState } from 'react';
import { useCatchCallback, useEffectAsync } from '../../reactHelper';
import { useTranslation } from './LocalizationProvider';
import fetchOrThrow from '../util/fetchOrThrow';

const CheckboxConnectionsController = ({
  endpointAll,
  endpointLinked,
  baseId,
  keyBase,
  keyLink,
  keyGetter = (item) => item.id,
  titleGetter = (item) => item.name,
}) => {
  const t = useTranslation();

  const [items, setItems] = useState();
  const [linkedIds, setLinkedIds] = useState();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const [itemsResponse, linkedResponse] = await Promise.all([
        fetchOrThrow(endpointAll),
        fetchOrThrow(endpointLinked),
      ]);
      const itemsData = await itemsResponse.json();
      const linkedData = await linkedResponse.json();
      setItems(itemsData);
      setLinkedIds(new Set(linkedData.map(keyGetter)));
    } finally {
      setLoading(false);
    }
  }, []);

  const createBody = (linkId) => {
    const body = {};
    body[keyBase] = baseId;
    body[keyLink] = linkId;
    return body;
  };

  const handleToggle = useCatchCallback(async (checked, itemId) => {
    if (checked) {
      await fetchOrThrow('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createBody(itemId)),
      });
      setLinkedIds((prev) => new Set(prev).add(itemId));
    } else {
      await fetchOrThrow('/api/permissions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createBody(itemId)),
      });
      setLinkedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, [setLinkedIds]);

  const filteredItems = items?.filter((item) => titleGetter(item).toLowerCase().includes(keyword.toLowerCase()));

  return (
    <>
      <TextField
        label={t('sharedSearch')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        fullWidth
        variant="filled"
        margin="normal"
      />
      {loading || !items || !linkedIds ? (
        <List>
          {[...Array(3)].map((_, i) => (
            <ListItem key={i}>
              <ListItemIcon>
                <Skeleton variant="rectangular" width={24} height={24} />
              </ListItemIcon>
              <ListItemText>
                <Skeleton width="100%" />
              </ListItemText>
            </ListItem>
          ))}
        </List>
      ) : (
        <List sx={{
          width: '100%', bgcolor: 'background.paper', overflow: 'auto', maxHeight: 300,
        }}
        >
          {filteredItems.map((item) => {
            const itemId = keyGetter(item);
            const isLinked = linkedIds.has(itemId);
            return (
              <ListItem key={itemId} dense button onClick={() => handleToggle(!isLinked, itemId)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={isLinked}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={titleGetter(item)} />
              </ListItem>
            );
          })}
        </List>
      )}
    </>
  );
};

export default CheckboxConnectionsController;
