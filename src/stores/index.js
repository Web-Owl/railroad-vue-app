import { createPinia } from 'pinia';

const debug = import.meta.env.MODE !== 'production';

export default createPinia({
  strict: debug,
});