import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  toValue,
  watch,
} from 'vue';
import type { MaybeRefOrGetter, PropType } from 'vue';
import { createOrfin } from '../index';
import { resolveSettings } from '../core/settings';
import type { Locale, SettingsInput } from '../core/types';
import type { OrfinController, OrfinOptions } from '../browser/controller';

export function useOrfin(options: MaybeRefOrGetter<OrfinOptions>) {
  const controller = shallowRef<OrfinController | null>(null);
  const settings = shallowRef(resolveSettings(toValue(options)));
  let unsubscribe: (() => void) | undefined;
  const updateSettings = (input: SettingsInput) => {
    settings.value = resolveSettings(input, settings.value);
    controller.value?.updateSettings(input);
  };
  const setLocale = (locale: Locale) => updateSettings({ locale });
  const locale = computed({ get: () => settings.value.locale, set: setLocale });
  onMounted(() => {
    const instance = createOrfin({ ...toValue(options), ...settings.value });
    controller.value = instance;
    unsubscribe = instance.subscribe(() => {
      settings.value = instance.settings;
    });
  });
  watch(() => toValue(options), updateSettings, { deep: true });
  onBeforeUnmount(() => {
    unsubscribe?.();
    controller.value?.destroy();
    controller.value = null;
  });
  return {
    controller,
    settings: computed(() => settings.value),
    locale,
    setLocale,
    updateSettings,
  };
}

export const OrfinSupport = defineComponent({
  name: 'OrfinSupport',
  props: { options: { type: Object as PropType<OrfinOptions>, required: true } },
  emits: { ready: (_controller: OrfinController) => true },
  setup(props, { emit, expose }) {
    const api = useOrfin(() => props.options);
    watch(
      api.controller,
      (controller) => {
        if (controller) emit('ready', controller);
      },
      { flush: 'sync' },
    );
    expose({ ...api, getController: () => api.controller.value });
    return () => null;
  },
});
