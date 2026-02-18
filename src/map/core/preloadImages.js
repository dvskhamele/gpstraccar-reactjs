import { grey } from '@mui/material/colors';
import { createTheme } from '@mui/material';
import { loadImage, prepareIcon } from './mapUtil';

import directionSvg from '../../resources/images/direction.svg';
import backgroundSvg from '../../resources/images/background.svg';
import plateSvg from '../../resources/images/plate.svg';

import startSvg from '../../resources/images/icon/start.svg';
import finishSvg from '../../resources/images/icon/finish.svg';
import defaultSvg from '../../resources/images/icon/default.svg';
import personSvg from '../../resources/images/icon/person.svg';
import planeSvg from '../../resources/images/icon/plane.svg';
import trainSvg from '../../resources/images/icon/train.svg';
import tramSvg from '../../resources/images/icon/tram.svg';

import ambulancePng from '../../resources/images/icons/ambulance.png';
import bicyclePng from '../../resources/images/icons/bicycle.png';
import bikePng from '../../resources/images/icons/bike.png';
import bulldozerPng from '../../resources/images/icons/bulldozer.png';
import busPng from '../../resources/images/icons/bus.png';
import camperPng from '../../resources/images/icons/camper.png';
import carPng from '../../resources/images/icons/car.png';
import cranePng from '../../resources/images/icons/crane.png';
import dumperPng from '../../resources/images/icons/dumper.png';
import eBikePng from '../../resources/images/icons/e-bike.png';
import eBusPng from '../../resources/images/icons/e-bus.png';
import eCarPng from '../../resources/images/icons/e-car.png';
import eRickshawPng from '../../resources/images/icons/e-rickshaw.png';
import eScooterPng from '../../resources/images/icons/e-scooter.png';
import eTaxiPng from '../../resources/images/icons/e-taxi.png';
import firetruckPng from '../../resources/images/icons/firetruck.png';
import garbagetruckPng from '../../resources/images/icons/garbagetruck.png';
import harvesterPng from '../../resources/images/icons/harvester.png';
import helicopterPng from '../../resources/images/icons/helicopter.png';
import jcbPng from '../../resources/images/icons/jcb.png';
import jeepPng from '../../resources/images/icons/jeep.png';
import loadingPng from '../../resources/images/icons/loading.png';
import mixertruckPng from '../../resources/images/icons/mixertruck.png';
import petPng from '../../resources/images/icons/pet.png';
import poclainPng from '../../resources/images/icons/poclain.png';
import rickshawPng from '../../resources/images/icons/rickshaw.png';
import roadrollerPng from '../../resources/images/icons/roadroller.png';
import schoolbusPng from '../../resources/images/icons/schoolbus.png';
import schoolvanPng from '../../resources/images/icons/schoolvan.png';
import scooterPng from '../../resources/images/icons/scooter.png';
import shipPng from '../../resources/images/icons/ship.png';
import suvPng from '../../resources/images/icons/suv.png';
import tankertruckPng from '../../resources/images/icons/tankertruck.png';
import taxiPng from '../../resources/images/icons/taxi.png';
import tractorPng from '../../resources/images/icons/tractor.png';
import truckPng from '../../resources/images/icons/truck.png';

export const mapIcons = {
  animal: petPng,
  bicycle: bicyclePng,
  boat: shipPng,
  bus: busPng,
  car: carPng,
  camper: camperPng,
  crane: cranePng,
  default: defaultSvg,
  finish: finishSvg,
  helicopter: helicopterPng,
  motorcycle: bikePng,
  person: personSvg,
  plane: planeSvg,
  scooter: scooterPng,
  ship: shipPng,
  start: startSvg,
  tractor: tractorPng,
  trailer: truckPng,
  train: trainSvg,
  tram: tramSvg,
  truck: truckPng,
  van: suvPng,
  
  ambulance: ambulancePng,
  bike: bikePng,
  bulldozer: bulldozerPng,
  dumper: dumperPng,
  'e-bike': eBikePng,
  'e-bus': eBusPng,
  'e-car': eCarPng,
  'e-rickshaw': eRickshawPng,
  'e-scooter': eScooterPng,
  'e-taxi': eTaxiPng,
  firetruck: firetruckPng,
  garbagetruck: garbagetruckPng,
  harvester: harvesterPng,
  jcb: jcbPng,
  jeep: jeepPng,
  loading: loadingPng,
  mixertruck: mixertruckPng,
  pet: petPng,
  poclain: poclainPng,
  rickshaw: rickshawPng,
  roadroller: roadrollerPng,
  schoolbus: schoolbusPng,
  schoolvan: schoolvanPng,
  scooter: scooterPng,
  ship: shipPng,
  suv: suvPng,
  tankertruck: tankertruckPng,
  taxi: taxiPng,
};

export const mapIconKey = (category) => {
  switch (category) {
    case 'offroad':
    case 'pickup':
      return 'car';
    case 'trolleybus':
      return 'bus';
    default:
      return mapIcons.hasOwnProperty(category) ? category : 'default';
  }
};

export const mapImages = {};

const theme = createTheme({
  palette: {
    neutral: { main: grey[500] },
  },
});

export default async () => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = await prepareIcon(background);

  const directionImage = await loadImage(directionSvg);
  const canvas = document.createElement('canvas');
  const size = background.width * devicePixelRatio;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const arrowHeight = size * 0.9;
  const arrowWidth = directionImage.width * (arrowHeight / directionImage.height);
  const yOffset = 0;
  context.drawImage(directionImage, (size - arrowWidth) / 2, yOffset, arrowWidth, arrowHeight);
  mapImages.direction = context.getImageData(0, 0, size, size);

  mapImages.plate = await prepareIcon(await loadImage(plateSvg));
  await Promise.all(Object.keys(mapIcons).map(async (category) => {
    const results = [];
    ['info', 'success', 'error', 'neutral'].forEach((color) => {
      results.push(loadImage(mapIcons[category]).then((icon) => {
        mapImages[`${category}-${color}`] = prepareIcon(background, icon, theme.palette[color].main);
      }));
    });
    await Promise.all(results);
  }));
};
