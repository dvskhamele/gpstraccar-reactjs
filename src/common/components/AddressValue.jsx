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
      if (!originalAddress) {
        const fetchAddress = async () => {
          try {
            // Using Nominatim directly for a much more detailed address
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`);
            const data = await response.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
            } else {
              // Fallback to backend geocode if Nominatim fails
              const query = new URLSearchParams({ latitude, longitude });
              const backendResponse = await fetchOrThrow(`/api/server/geocode?${query.toString()}`);
              setAddress(await backendResponse.text());
            }
          } catch (error) {
            // Final fallback to backend
            try {
              const query = new URLSearchParams({ latitude, longitude });
              const backendResponse = await fetchOrThrow(`/api/server/geocode?${query.toString()}`);
              setAddress(await backendResponse.text());
            } catch (e) {
              setAddress('Unknown Location');
            }
          }
        };
        fetchAddress();
      } else {
        setAddress(originalAddress);
      }
    } else {
      setAddress(originalAddress || 'Geocoding Disabled');
    }
  }, [addressEnabled, latitude, longitude, originalAddress]);

  return address || t('sharedLoading');
};

export default AddressValue;
