/*jshint esversion: 9 */

const textInput = {
    name: `textinput`,
    emits: ['editor-changed', 'update:modelValue'],
    props: {
      id: { type: String, required: true },
      name: { type: String, default: "" },
      placeHolder: { type: String, default: "" },
      modelValue: { type: String, default: "" },
      autocompleteData: { type: Array, default: [] }
    },
    computed: {
      value: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit('update:modelValue', value);
          this.$emit('editor-changed');
        }
      }
    },
    template: `
      <td class="textinput-label" ><label :for="id" v-if="name !== ''"> {{ name }}: </label></td>
      <td class="textinput-input" >
        <input v-if="autocompleteData.length == 0" type="text" :id="id" :name="name" class="outline-primary" :placeHolder="placeHolder" v-model="value" />
        <input v-else type="text" :id="id" :list="id + '-list'" :name="name" class="outline-primary" :placeHolder="placeHolder" v-model="value" />
        <template>
          <datalist v-if="autocompleteData.length !== 0" :id="id + '-list'">
            <option v-for="value in autocompleteData">{{value}}</option>
          </datalist>
        </template>
      </td>
    `
  };