/*jshint esversion: 9 */

const btntoggle = {
    name: 'btnToggle',
    data() {
      return {
        isToggledVal: false
      };
    },
    emits: ['toggle-click'],
    props: {
      text: { type: String, default: 'Button Text' },
      btnId: { type: String },
      isToggled: { type: Boolean, default: false },
    },
    watch: {
      isToggled: {
        immediate: true,
        handler(newVal) {
          this.isToggledVal = newVal;
        }
      }
    },
    methods: {
      onClick() {
        this.isToggledVal = !this.isToggledVal;
        this.$emit('toggle-click', this.isToggledVal);
      }
    },
    template: `<button type='button' @click="onClick()" :id="btnId" :class="['btn', 'btn-primary', 'btn--color-primary', isToggledVal === true ? 'btn--active2' : '']">{{ text }}</button>`,
  };