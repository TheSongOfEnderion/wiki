/*jshint esversion: 9 */

const toggle = {
    name: 'toggle',
    data() {
      return {
        checkValue: getSpoilerStorageValue(),
        tooltipText: "Show Spoilers!!"
      };
    },
    watch: {
      checkValue: {
        immediate: true,
        handler(value) {
          localStorage.theSongOfEnderion_isSpoiler = value;
          this.tooltipText = value ? "Hide Spoilers" : "Show Spoilers";
        }
      }
    },
    template: `
    <div class="tooltip">
      <input type="checkbox" aria-label="Toggle" class="toggle toggle-visual float-end" @change="$emit('toggled', checkValue)" v-model="checkValue" v-cloak>
      <span class="tooltiptext bg-primary" v-html="tooltipText">
      </span>
    </div>
  
    `
  };