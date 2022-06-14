/*jshint esversion: 9 */

const dropdown = {
    name: `dropdown`,
    emits: ['update:modelValue', 'template-change'],
    props: {
      id: { type: String, required: true },
      name: { type: String, default: "" },
      placeHolder: { type: String, default: "" },
      modelValue: { type: String, default: "" },
      autocompleteData: { type: Object, default: ['test 1', 'test 2'] }
    },
    computed: {
      value: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit('update:modelValue', value);
        }
      }
    },
    template: `
      <div>
        <select :name="name" :id="id" v-model="value" class="dropdown-select dropdown-select--visual">
          <option value="" selected>No Selected Template</option>
          <option v-for="value in autocompleteData" :value="value">{{'- ' + value }}</option>
        </select>
      </div>
  
    `
  };