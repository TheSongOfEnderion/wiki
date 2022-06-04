/*jshint esversion: 9 */

const editor = {
    name: 'editor',
    data() {
      return {
  
        selectedTabId: '',
        tempProfileData: {},
        tempContentData: {},
        tempPageData: {},
        tempCreateSpoilers: false,
  
        isEditorChanged: false, // Checks if the user changed/edited the editor
  
        sendToChild: "",
  
        // Misc
        spoilertoggletext: "Spoilers Enabled",
  
        // Essential
        editorData: {},
        editorDataBackup: {},
      };
    },
    props: {
      passedEditorData: { type: Object, required: true },
      urlpaths: { type: Array, default: [] },
      parentsList: { type: Array, default: [] },
      templateList: { type: Array, default: [] },
      isNewPage: { type: Boolean, default: false },
      dir: { type: Object, required: true },
    },
    emits: ['save-content', 'delete-page', 'update-project', 'new-page', 'history-previous', 'set-page-as-template'],
    components: ['markdown', 'btn', 'content-editor', 'profile-editor', 'meta-editor', 'tab-editor', 'select-drop', 'btnToggle', 'sidebar'],
    watch: {
      passedEditorData: {
        immediate: true,
        async handler(newVal) {
          if (Object.keys(newVal).length === 0) return;
          this.editorData = newVal;
          this.editorDataBackup = JSON.parse(JSON.stringify(newVal));
          this.tempCreateSpoilers = this.editorData.pageData.createSpoilers;
          await this.$nextTick();
          await this.toggleSpoiler(this.tempCreateSpoilers);
        }
      }
    },
    methods: {
      toggleEditorView() {
        document.getElementById('page-content').classList.toggle("hide");
        document.getElementById('editor').classList.toggle("hide");
      },
      toggleSideBar() {
        document.getElementById('sidebar').classList.toggle("hide");
      },
      openEditorTab(tabName) {
        const tabList = ['content-editor', 'manage-tab', 'profile-box', 'scripts-tab'];
        for (let tab of tabList) {
          if (tab === tabName) {
            document.getElementById(tabName).classList.remove("hide");
            continue;
          }
          document.getElementById(tab).classList.add("hide");
        }
      },
      editorChanged() {
        if (!this.isEditorChanged) this.isEditorChanged = true;
      },
      async saveEditor() {
        this.sendToChild = "sendData";
        await this.$nextTick();
        this.sendToChild = "";
  
        if (this.tempPageData.urlPath.toLowerCase().includes('.html')) {
          this.$emit('send-data', null);
          return;
        }
  
        if (this.isNewPage === true && this.dir.hasOwnProperty(this.tempPageData.urlName)) {
          console.log("Page Name already exists!");
          return;
        }
  
        let content = '';
        for (const area in this.tempContentData) {
          content += `<div id="${area}">\n`;
          for (const item of this.tempContentData[area]) {
            content += `<div id="${item.id}" class="page-tab">\n${item.html.trim()}\n</div>\n`;
          }
          content += `</div>\n`;
        }
  
        this.tempPageData.createSpoilers = this.tempCreateSpoilers;
        this.tempPageData.tabs = this.editorData.pageData.tabs;
  
        this.$emit('save-content', {
          contentData: content,
          profileData: this.tempProfileData,
          pageData: this.tempPageData
        });
      },
      async closeEditor() {
        this.editorData = JSON.parse(JSON.stringify(this.editorDataBackup));
        await this.toggleSpoiler(this.editorData.pageData.createSpoilers);
        this.sendToChild = "refresh";
        await this.$nextTick();
        this.sendToChild = "";
      },
      async toggleSpoiler(value) {
        this.spoilertoggletext = value === false ? 'Spoilers Disabled' : 'Spoilers Enabled';
        this.tempCreateSpoilers = value;
  
        this.sendToChild = value === false ? "createSpoilersFalse" : "createSpoilersTrue";
        await this.$nextTick();
        this.sendToChild = "";
      },
  
      async tempChangeEditorData(value) {
        const skipIds = [];
  
        // Exclude Already Existing Ids
        this.editorData.pageData.tabs = JSON.parse(JSON.stringify(value.tabs));
  
        // Get list of native tabs
        for (const area in this.editorData.contentData) {
          for (let tab of this.editorData.contentData[area]) {
            skipIds.push(tab.id);
          }
        }
  
        // Delete tabs
        for (const area in this.editorData.contentData) {
          for (let tab of this.editorData.contentData[area]) {
            if (!value.deletedTabs.includes(tab.id)) continue;
            const index = this.editorData.contentData[area].indexOf(tab);
            this.editorData.contentData[area].splice(index, 1);
          }
        }
  
        // Add new stuff
        for (const tab in value.tabs) {
          if (skipIds.includes(tab)) continue;
          const area = value.tabs[tab].area;
  
          // Rename
          if (value.tabs[tab].hasOwnProperty('originalId')) {
            let orig = value.tabs[tab].originalId;
  
            for (const area in this.editorData.contentData) {
              for (const tabItem of this.editorData.contentData[area]) {
                if (tabItem.id == orig) {
                  tabItem.id = tab;
                  tabItem.name = value.tabs[tab].name;
                  tabItem.pageid = tab + "-page";
                }
              }
            }
            continue;
  
            // Add New
          } else {
            let obj = {
              html: " ",
              id: tab,
              name: value.tabs[tab].name,
              pageid: tab + "-page",
            };
            this.editorData.contentData[area].push(obj);
          }
        }
  
        this.sendToChild = "refresh";
        await this.$nextTick();
        this.sendToChild = "";
      },
      newPage(value) {
        this.$emit('new-page', value);
      },
    },
    computed: {
      getSpoilerStorageValue() {
        if (Object.keys(this.editorData).length === 0) return;
        return this.tempCreateSpoilers;
      }
    },
    template: `
      <sidebar @delete-page="$emit('delete-page')" @update-project="$emit('update-project')" @new-page="newPage" @set-page-as-template="$emit('set-page-as-template')" :template-list="templateList"/> 
  
      <div class="d-flex flex-column btn-div">
        <btn class="font--medium btn-side" text="≡" @btn-click="toggleSideBar"/>
        <btn class="font--medium btn-side" text="⚙" @btn-click="toggleEditorView"/>
        <btn class="font--medium btn-side" text="🡄" @btn-click="$emit('history-previous')"/>
      </div>
  
      <div id="editor" class="container hide">
        <div id="editor-menu" class="row card card--visual mt-1 mb-4">
          <h1 class="font--25 mb-2 ps-1">Editor</h1>
  
          <div class="container px-0 pb-3">
            <div class="row">
              <meta-editor :editor-data="editorData" :urlpaths="urlpaths" :parents-list='parentsList' @editor-changed="editorChanged" :order-from-parent="sendToChild" @send-data="(data) => tempPageData = data"/>
            </div>
  
            <div class="row mt-2 ">
              <div class="col">
                <div class="d-flex justify-content-start">
                  <btn class="font--small" text="Edit Contents" @btn-click="openEditorTab('content-editor')"/>
                  <btn class="font--small" text="Manage Tabs" @btn-click="openEditorTab('manage-tab')"/>
                  <btn class="font--small" text="Profile Box" @btn-click="openEditorTab('profile-box')"/>
                  <!-- <btn class="font--small" text="Script" @btn-click="openEditorTab('scripts-tab')"/> -->
                  <btnToggle class="font--small" :text="spoilertoggletext" @toggle-click="toggleSpoiler" :isToggled="getSpoilerStorageValue"/>
                  
                </div>
              </div>
  
              <div class="col">
                <div class="d-flex justify-content-end">
                  <btn class="font--small" text="Save" @btn-click="saveEditor" />
                  <btn class="font--small" text="Reset" @btn-click="closeEditor"/>
                </div>
              </div>
            </div>
  
          </div>
        </div>
  
        <div class="row card card--visual card--editor mb-5">
  
          <!-- Content Editor -->
          <div id="content-editor" class="">
            <h1 class="page-title d-flex justify-content-between" v-cloak>Content Editor</h1>
            <content-editor :editor-data="editorData" @editor-changed="editorChanged" :order-from-parent="sendToChild" @send-data="(data) => tempContentData = data"/>
          </div>
  
          <!-- Manage Tab Editor -->
          <div id="manage-tab" class="hide">
            <h1 class="page-title d-flex justify-content-between" v-cloak>Manage Tab</h1>
            <tab-editor :editor-data="editorData" @editor-changed="editorChanged" :order-from-parent="sendToChild" @changed-select="tempChangeEditorData"/>
          </div>
  
          <!-- Profile Editor -->
          <div id="profile-box" class="hide">
            <h1 class="page-title d-flex justify-content-between" v-cloak>Profile Box</h1>
            <profile-editor :editor-data="editorData"  @editor-changed="editorChanged" :order-from-parent="sendToChild" @send-data="(data) => tempProfileData = data"/>
          </div>
  
          <div id="scripts-tab" class="hide">
            <h1 class="page-title d-flex justify-content-between" v-cloak>Scripts</h1>
          </div>
  
        </div>
      </div>`
  };