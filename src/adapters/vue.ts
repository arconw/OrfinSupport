import { defineComponent, onBeforeUnmount, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import { createOrfin } from '../index';
import type { OrfinController, OrfinOptions } from '../index';

export const OrfinSupport = defineComponent({
  name: 'OrfinSupport',
  props: { options: { type: Object as PropType<OrfinOptions>, required: true } },
  emits: { ready: (_controller: OrfinController) => true },
  setup(props, { emit, expose }) {
    let controller: OrfinController | undefined;
    onMounted(() => {
      controller = createOrfin(props.options);
      emit('ready', controller);
    });
    watch(
      () => props.options,
      (options) => controller?.updateSettings(options),
      { deep: true },
    );
    onBeforeUnmount(() => controller?.destroy());
    expose({ getController: () => controller });
    return () => null;
  },
});
