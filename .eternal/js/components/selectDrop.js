/*jshint esversion: 9 */

const selectDrop = {
    name: 'select-drop',
    data() {
      return {
        selectedArea: "Non-Spoiler",
        tabList: [],
      };
    },
    props: {
      data: { type: Object, required: true },
      createSpoilers: { type: Boolean }
    },
    emits: ['changedSelect'],
    methods: {
      onChange(event) {
        for (const tabId in this.data) {
          if (tabId !== event.target.value) continue;
          this.selectedArea = this.data[tabId].type === 'nonspoiler' ? 'Non-Spoiler' : 'Spoiler';
        }
        this.$emit('changedSelect', event.target.value);
      }
    },
    watch: {
      createSpoilers: {
        immediate: true,
        handler(newVal) {
          if (newVal == null) return;
          if (Object.keys(this.data).length == 0) return;
  
          let selectedKey = '';
          for (const key of Object.keys(this.data)) {
            if (key.includes("nonspoiler")) {
              selectedKey = key;
              break;
            }
          }
  
          let select = document.getElementById('areaTab');
          select.value = selectedKey;
          select.dispatchEvent(new Event('change'));
        }
      }
    },
    template: `
      <label for="areaTab" class="me-1"> {{ selectedArea }} Tab: </label>
      <select name="areaTab" id="areaTab" @change="onChange($event)"> 
  
        <optgroup id="editorSelectDropNonSpoiler" label="Non-Spoiler">
          <template v-for="(value, id, index) in data">
            <option v-if="value.type === 'nonspoiler'" :value="id" >{{ value.name }}</option>
          </template>
        </optgroup>
          
        <optgroup id="editorSelectDropSpoiler"  label="Spoiler" v-show="createSpoilers == true">
          <template v-for="(value, id, index) in data">
            <option v-if="value.type === 'spoiler'" :value="id" >{{ value.name }}</option>
          </template>
        </optgroup>
  
      </select>
  
      `
  };