import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@mui/material';
import { useTranslation } from './LocalizationProvider';
import { useCatch } from '../../reactHelper';
import fetchOrThrow from '../util/fetchOrThrow';

const AddressValue = ({ latitude, longitude, originalAddress }) => {
  const t = useTranslation();

  const addressEnabled = useSelector((state) => state.session.server.geocoderEnabled);

  const [address, setAddress] = useState(originalAddress);

  useEffect(() => {
    if (addressEnabled && latitude && longitude) {
      setAddress(null); // Clear previous address to force new fetch
      const fetchAddress = async () => {
        try {
          const query = new URLSearchParams({ latitude, longitude });
          const response = await fetchOrThrow(`/api/server/geocode?${query.toString()}`);
          setAddress(await response.text());
        } catch (error) {
          // ignore errors
        }
      };
      fetchAddress();
    } else {
      setAddress(originalAddress); // If geocoding disabled or coordinates missing, use original (now null)
    }
  }, [addressEnabled, latitude, longitude, originalAddress]);

  return address || t('sharedLoading');
};

export default AddressValue;
