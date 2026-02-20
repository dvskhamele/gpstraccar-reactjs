import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme, useMediaQuery } from '@mui/material';
import dayjs from 'dayjs';
import { map } from '../core/MapView';
import fetchOrThrow from '../../common/util/fetchOrThrow';
import MapRoutePath from '../MapRoutePath';
import MapCamera from '../MapCamera';
import { useCatch } from '../../reactHelper';
import { findFonts } from '../core/mapUtil';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAttributePreference } from '../../common/util/preferences';

class TodayRouteControl {
  constructor(eventHandler, title) {
    this.eventHandler = eventHandler;
    this.title = title;
  }

  onAdd() {
    this.button = document.createElement('button');
    this.button.className = 'maplibregl-ctrl-icon maplibre-ctrl-today-route';
    this.button.type = 'button';
    this.button.title = this.title;
    this.button.onclick = () => this.eventHandler();

    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl-group maplibregl-ctrl';
    this.container.appendChild(this.button);

    return this.container;
  }

  onRemove() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  setActive(active) {
    if (this.button) {
      if (active) {
        this.button.classList.add('active');
      } else {
        this.button.classList.remove('active');
      }
    }
  }
}

const MapTodayRoute = () => {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const iconScale = useAttributePreference('iconScale', desktop ? 0.4 : 0.5);
  const t = useTranslation();
  const [active, setActive] = useState(false);
  const [positions, setPositions] = useState([]);
  const [stops, setStops] = useState([]);
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const fetchRouteData = useCatch(async () => {
    if (selectedDeviceId) {
      const from = dayjs().startOf('day').toISOString();
      const to = dayjs().endOf('day').toISOString();
      const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
      
      const [posResponse, stopsResponse] = await Promise.all([
        fetchOrThrow(`/api/positions?${query.toString()}`),
        fetchOrThrow(`/api/reports/stops?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        })
      ]);

      setPositions(await posResponse.json());
      setStops(await stopsResponse.json());
    }
  });

  const onClick = () => {
    setActive((prev) => {
      if (!prev) {
        fetchRouteData();
      } else {
        setPositions([]);
        setStops([]);
      }
      return !prev;
    });
  };

  const control = useMemo(() => new TodayRouteControl(onClick, t('reportToday')), [selectedDeviceId, t]);

  useEffect(() => {
    const position = theme.direction === 'rtl' ? 'top-left' : 'top-right';
    map.addControl(control, position);
    
    // Add stops source and layer
    if (!map.getSource('today-stops')) {
      map.addSource('today-stops', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

                                          map.addLayer({
                                            id: 'today-stops-layer',
                                            type: 'symbol',
                                            source: 'today-stops',
                                            layout: {
                                              'icon-image': 'parkingicon',
                                              'icon-size': iconScale * 2.5,
                                              'icon-allow-overlap': true,
                                            }
                                          });
                                        }
                                    
                                        // Add endpoints source and layer
                                        if (!map.getSource('today-endpoints')) {
                                          map.addSource('today-endpoints', {
                                            type: 'geojson',
                                            data: { type: 'FeatureCollection', features: [] },
                                          });
                                    
                                          map.addLayer({
                                            id: 'today-endpoints-layer',
                                            type: 'symbol',
                                            source: 'today-endpoints',
                                            layout: {
                                              'icon-image': '{category}',
                                              'icon-size': iconScale * 3.5,
                                              'icon-allow-overlap': true,
                                            }
                                          });
                                        }
    return () => {
      map.removeControl(control);
      if (map.getLayer('today-stops-layer')) map.removeLayer('today-stops-layer');
      if (map.getSource('today-stops')) map.removeSource('today-stops');
      if (map.getLayer('today-endpoints-layer')) map.removeLayer('today-endpoints-layer');
      if (map.getSource('today-endpoints')) map.removeSource('today-endpoints');
    };
  }, [control, theme.direction]);

  useEffect(() => {
    control.setActive(active);
  }, [active, control]);

  useEffect(() => {
    if (active) {
      if (selectedDeviceId) {
        fetchRouteData();
      } else {
        setPositions([]);
        setStops([]);
      }
    }
  }, [selectedDeviceId, active]);

  useEffect(() => {
    const source = map.getSource('today-stops');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: stops.map((stop) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [stop.longitude, stop.latitude],
          },
          properties: {
            title: 'Stop',
          },
        })),
      });
    }
  }, [stops]);

  useEffect(() => {
    const source = map.getSource('today-endpoints');
    if (source) {
      if (positions.length > 0) {
        const features = [];
        const first = positions[0];
        const last = positions[positions.length - 1];
        
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [first.longitude, first.latitude],
          },
          properties: { category: 'startpoint' },
        });

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [last.longitude, last.latitude],
          },
          properties: { category: 'endpoint' },
        });

        source.setData({ type: 'FeatureCollection', features });
      } else {
        source.setData({ type: 'FeatureCollection', features: [] });
      }
    }
  }, [positions]);

  return (
    <>
      {active && positions.length > 0 && (
        <>
          <MapRoutePath positions={positions} />
          <MapCamera positions={positions} />
        </>
      )}
    </>
  );
};

export default MapTodayRoute;
