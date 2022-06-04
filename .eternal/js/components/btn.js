/*jshint esversion: 9 */

const btn = {
    name: 'btn',
    emits: ['btn-click'],
    props: {
      text: { type: String, default: 'Button Text' },
      btnId: { type: String },
    },
    template: `<button type='button' @click="$emit('btn-click')" :id="btnId" :class="['btn', 'btn-primary', 'btn--color-primary']">{{ text }}</button>`,
  };
  