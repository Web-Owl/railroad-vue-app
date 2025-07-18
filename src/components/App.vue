<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useMapStore } from '@/stores/mapStore';

import UiSpinner from '@/ui/Spinner/UiSpinner.vue';

const mapContainerRef = ref(null);
let currentMapInstance = null;

const mapStore = useMapStore();

onMounted(async () => {
  mapStore.setLoading(true);
  mapStore.setMessage('Загрузка карты...');
  mapStore.setProcessState('processing');

  const maplibregl = await import('maplibre-gl');

  const startPoint = mapStore.stations.find(s => s.name === 'Москва').coords;
  const finishPoint = mapStore.stations.find(s => s.name === 'Санкт-Петербург').coords;
  const initialCenter = [
    (startPoint[0] + finishPoint[0]) / 2,
    (startPoint[1] + finishPoint[1]) / 2,
  ];

  currentMapInstance = new maplibregl.Map({
    container: mapContainerRef.value,
    style: 'https://demotiles.maplibre.org/style.json',
    center: initialCenter,
    zoom: 5,
  });

  mapStore.setMapInstance(currentMapInstance);

  currentMapInstance.on('load', () => {
    mapStore.setLoading(false);
    mapStore.setMessage('Карта успешно загружена!');
    mapStore.setProcessState('success');

    mapStore.stations.forEach(({ name, coords }) => {
      new maplibregl.Marker()
        .setLngLat(coords)
        .setPopup(new maplibregl.Popup({ offset: 25 }).setText(name))
        .addTo(currentMapInstance);
    });

    const railwayCoordinates = mapStore.stations.map(s => s.coords);

    if (!currentMapInstance.getSource('railway')) {
      currentMapInstance.addSource('railway', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: railwayCoordinates,
          },
        },
      });
    }

    if (!currentMapInstance.getLayer('railroad-line')) {
      currentMapInstance.addLayer({
        id: 'railroad-line',
        type: 'line',
        source: 'railway',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#BF93E4',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });
    }

    const bounds = railwayCoordinates.reduce((b, coord) => {
      return b.extend(coord);
    }, new maplibregl.LngLatBounds(railwayCoordinates[0], railwayCoordinates[0]));

    currentMapInstance.fitBounds(bounds, { padding: 50 });
  });

  currentMapInstance.on('error', (e) => {
    mapStore.setLoading(false);
    mapStore.addError(e.error?.message || 'Неизвестная ошибка карты');
    mapStore.setMessage('Ошибка при загрузке карты: ' + mapStore.mapErrors.join(', '));
    mapStore.setProcessState('failed');
  });
});

onBeforeUnmount(() => {
  if (mapStore.mapInstance) {
    mapStore.mapInstance.remove();
    mapStore.setMapInstance(null);
  }
});
</script>

<template>
  <div class="map">
    <h1 class="map__heading">Интерактивная карта маршрута:</h1>
    <h2 class="map__subheading">Москва - Санкт-Петербург</h2>
    <div class="map__wrapper">
      <div class="map__message" v-if="mapStore.message">
        {{ mapStore.message }}
      </div>
      <div class="map__container" ref="mapContainerRef"></div>
      <UiSpinner v-if="mapStore.isLoading" />
    </div>
  </div>
</template>

<style scoped>
  .map__heading {
    font-size: 22px;
    font-weight: 700;
    line-height: 32px;
    margin: 0 0 20px;
  }
  @media (max-width: 768px) {
    .map__heading {
      font-size: 14px;
       margin: 0 0 10px;
    }
  }
  .map__subheading {
    color: #2946a0;
    font-family: "Open Sans",sans-serif;
    font-size: 36px;
    font-weight: 400;
    line-height: 1;
    margin: 0 0 24px;
    text-transform: uppercase;
  }
  @media (max-width: 768px) {
    .map__subheading {
      font-size: 20px;
       margin: 0 0 12px;
    }
  }
  .map__wrapper {
    height: 650px;
    width: 1200px;
    position: relative;
  }
  @media (max-width: 768px) {
    .map__wrapper {
      height: 450px;
      width: 100%;
    }
  }
  .map__message {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    background: white;
    padding: 8px;
    border-radius: 4px;
  }
  .map__container {
    width: 100%;
    height: 100%;
  }
</style>