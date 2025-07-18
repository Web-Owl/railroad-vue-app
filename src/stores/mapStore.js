import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMapStore = defineStore('map', () => {
  const mapProcessState = ref('filling');
  const mapErrors = ref([]);
  const mapInstance = ref(null);
  const message = ref('');
  const isLoading = ref(false);

  const stations = ref([
    { name: 'Москва', coords: [37.385272, 55.584227] },
    { name: 'Клин', coords: [36.7278, 56.3281] },
    { name: 'Тверь', coords: [35.9167, 56.8580] },
    { name: 'Торжок', coords: [34.9735, 57.0560] },
    { name: 'Вышний Волочёк', coords: [33.1544, 57.5711] },
    { name: 'Валдай', coords: [33.2431, 57.9940] },
    { name: 'Великий Новгород', coords: [31.2790, 58.5247] },
    { name: 'Санкт-Петербург', coords: [30.092861, 59.940675] },
  ]);

  const isMapLoaded = computed(() => mapProcessState.value === 'success');
  const hasMapErrors = computed(() => mapErrors.value.length > 0);

  function setMapInstance(map) {
    mapInstance.value = map;
  }

  function setProcessState(state) {
    mapProcessState.value = state;
  }

  function addError(error) {
    mapErrors.value.push(error);
  }

  function clearErrors() {
    mapErrors.value = [];
  }

  function setMessage(msg) {
    message.value = msg;
  }

  function setLoading(status) {
    isLoading.value = status;
  }

  return {
    mapProcessState,
    mapErrors,
    mapInstance,
    message,
    isLoading,
    stations,
    isMapLoaded,
    hasMapErrors,
    setMapInstance,
    setProcessState,
    addError,
    clearErrors,
    setMessage,
    setLoading,
  };
});
