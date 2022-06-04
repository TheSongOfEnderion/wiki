/*jshint esversion: 9 */

const tabEditor = {
    name: 'tab-editor',
    data() {
      return {
        createSpoilers: false,
  
        tabName: "",
        selectedTabId: '',
        selectData: {},
        deletedTab: []
      };
    },
    emits: ['editor-changed', 'send-data', 'changedSelect'],
    props: {
      editorData: { type: Object, required: true },
      orderFromParent: { type: String }
    },
    watch: {
      editorData: {
        immediate: true,
        handler(newVal) {
          if (Object.keys(newVal).length === 0) return;
          this.generateSelectData();
          this.createSpoilers = this.editorData.pageData.createSpoilers;
        }
      },
      orderFromParent: {
        immediate: true,
        handler(newVal) {
          if (newVal === '') return;
          switch (newVal) {
            case "refresh":
              this.generateSelectData();
              return;
  
            case "createSpoilersFalse":
              this.createSpoilers = false;
              this.tabName = "";
              return;
  
            case "createSpoilersTrue":
              this.createSpoilers = true;
              this.tabName = "";
              return;
          }
        }
      }
    },
    methods: {
      generateSelectData() {
        this.selectData = {};
        this.deletedTab = [];
        for (const area in this.editorData.contentData) {
          for (const item of this.editorData.contentData[area]) {
            this.selectData[item.id] = {
              name: item.name,
              area: area
            };
          }
        }
      },
      onChange(event) {
        this.tabName = this.selectData[event.target.value].name;
        this.selectedTabId = event.target.value;
      },
      tabClear() {
        this.tabName = '';
        this.selectedTabId = '';
  
        this.sendData();
      },
      tabRename() {
        if (this.selectedTabId === '') return;
  
        const area = this.selectData[this.selectedTabId].area;
        const id = area + "-" + this.tabName.replace(/\s/g, '-').trim().toLowerCase();
  
        delete this.selectData[this.selectedTabId];
  
        this.selectData[id] = {
          name: this.tabName,
          area: area,
          originalId: this.selectedTabId,
        };
  
        this.selectedTabId = id;
        this.sendData();
      },
      tabAdd(area) {
        if (this.tabName === '') return;
        const id = area + "-" + this.tabName.replace(/\s/g, '-').trim().toLowerCase();
        if (this.selectData.hasOwnProperty(id)) return;
        this.selectData[id] = {
          name: this.tabName,
          area: area
        };
  
        this.sendData();
      },
      tabDelete() {
        if (this.selectedTabId === '') return;
        if (!this.selectData.hasOwnProperty(this.selectedTabId)) return;
        delete this.selectData[this.selectedTabId];
  
        this.deletedTab.push(this.selectedTabId);
        this.selectedTabId = "";
        this.tabName = "";
        this.sendData();
      },
      sendData() {
        this.$emit('changedSelect', { tabs: this.selectData, deletedTabs: this.deletedTab });
      }
    },
    template: `
    <div class="container m-0 p-0">
      <div class="row">
  
        <div class="col-3">
          <select class="width-100" name="Tabs" size="11" id="managetab-contentarea-list" @change="onChange($event)">
            <optgroup id="editorTabGroupNonSpoiler" label="Non-Spoiler">
              <template v-for="(value, id, index) in selectData">
                <option v-if="value.area === 'nonspoiler'" :value="id" >{{ value.name }}</option>
              </template>
            </optgroup>
              
            <optgroup id="editorTabGroupSpoiler"  label="Spoiler" v-show="createSpoilers == true">
              <template v-for="(value, id, index) in selectData">
                <option v-if="value.area === 'spoiler'" :value="id" >{{ value.name }}</option>
              </template>
            </optgroup>
          </select>
        </div>
  
        <div class="col-9">
  
          <table class="editor-table me-5 width-100">
            <tbody>
              <tr class="input-text input-text--visual">
                <p class="m-0 text-left">Tab Name:</p>
                <textinput id="tabName" place-holder="Place a name here" v-model="tabName" @editor-changed="$emit('editor-changed')"/> </tr>
              <tr class="ps-5">
                <btn class="font--small" text="Rename" @btn-click="tabRename"/>
                <btn class="font--small" text="Delete" @btn-click="tabDelete"/>
                <btn class="font--small" text="Clear" @btn-click="tabClear"/>
                <btn class="font--small" text="Add (Non-Spoilers)" @btn-click="tabAdd('nonspoiler')"/>
                <btn class="font--small" text="Add (Spoilers)" @btn-click="tabAdd('spoiler')" v-show="createSpoilers == true"/>
  
              </tr>
                
            </tbody>
          </table>
    
        
        </div>
  
      </div>
    </div>
  
    `
  };