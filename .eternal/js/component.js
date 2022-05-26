/*jshint esversion: 9 */
const initialJson = {
  Title: 'Ethan Morales',
  Image: {
    "Original Art": "assets/images/Ethan-Morales.png",
    "Uniform": "assets/images/Ethan Morales.png",
    "Hero Suit": "assets/images/Eltia Axolin.png"
  },
  Content: {
    'Desc': {
      'Full Name': 'Ethan R. Morales',
      'Alias': ['Tantan', 'Lunatic', 'Crazy Sociopath', 'The Unchained Predator']
    },
    'Biography': {
      'Race': 'Human',
      'Birthday': '15 June',
      'Age': '15',
      'Gender': 'Male',
      'Height': '168 cm',
      'Weight': '58 kg',
      'Hair Color': 'Orange-Red',
      'Skin Color': 'Light-Beige',
      'Blood Type': 'AB'
    },
    'Power': {
      'Rank': '6th Awakener',
      'Active': [
        'Candlefire',
        'Pyrokinesis',
        'Thermal Manipulation',
        'Kinetic Manipulation',
        'Molecular Binding',
        'Atomic Manipulation',
      ],
      'Passive': [
        'Fire Immunity',
        'Tough Skin',
        'Atomic Sense',
        'Enhanced Brain',
      ]
    },
    'Status': {
      'Status': 'Alive',
      'Birthplace': 'Desteria, Shanty Town',
      'Family': [
        'Madelyn Morales (Mother)',
        'Nathaniel Morales (Father)',
        'Isaac Morales (Little Brother)',
        'Graniel Morales (Grandfather)',
      ]
    }
  }
};



const btn = {
  name: 'btn',
  emits: ['btn-click'],
  props: {
    text: { type: String, default: 'Button Text' },
    btnId: { type: String },
  },
  template: `<button type='button' @click="$emit('btn-click')" :id="btnId" :class="['btn', 'btn-primary', 'btn--color-primary']">{{ text }}</button>`,
};

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

const header = {
  name: 'header-card',
  data() {
    return {
      buttons: "",
    };
  },
  props: {
    title: String,
    subtitle: String,
    btnList: Object,
  },
  emits: ['read-page'],
  components: ['btn'],
  computed: {
    getNavBtns() {
      if (!this.btnList) return [];
      return Object.keys(this.btnList);
    }
  },
  template: `
    <div class="center">
      <h1 class="project-title mx-0 mt-6 mb-1">{{ title }}</h1>
      <h2 class="project-subtitle mx-0 mt-2 mb-5">{{ subtitle }}</h2>

        <div class="d-flex flex-wrap justify-content-center btns-header">
          <div class="dropdown" v-for="(value, name) in btnList">
            <btn :text="name" class="btn--header font--medium" @btn-click="$emit('read-page', value._default)"/>
            <div v-if="Object.keys(value).length > 1" class="dropdown-content">
              <template v-for="(item, name) in value">
                <btn v-if="name !== '_default'" :text="name" class="font--small btn--header btn-nav" @btn-click="$emit('read-page', item)"/>
              </template>
            </div>
          </div>
        </div>
    </div>`,
};


const pageContent = {
  name: 'page-content',
  data() {
    return {
      tabList: {
        spoiler: [],
        nonspoiler: []
      }
    };
  },
  emits: ['read-page'],
  props: {
    pageContents: { type: Object, default: { nonspoiler: [], spoiler: [] }, required: true },
    pageData: { type: Object, default: {} },
    dir: { type: Object, default: {} },
    areaToggle: { type: Boolean, default: false }
  },
  components: ['tab', 'breadcrumbs'],
  methods: {
    selectedTab(area, pageid) {

      for (let tab of this.pageContents[area]) {
        let tabDiv = document.getElementById(tab.pageid);
        let btn = document.getElementById(tab.pageid.replace('-page', '-btn'));

        if (tab.pageid === pageid) {
          tabDiv.classList.remove('hide');
          btn.classList.add('btn--active');
          continue;
        }
        tabDiv.classList.add('hide');
        btn.classList.remove('btn--active');

      }

    },
    openArea(checked) {
      if (this.pageData.createSpoilers === false) {
        checked = false;
      }
      switch (checked) {
        case true:
          document.getElementById('spoiler').classList.remove('hide');
          document.getElementById('nonspoiler').classList.add('hide');
          return;
        case false:
          document.getElementById('spoiler').classList.add('hide');
          document.getElementById('nonspoiler').classList.remove('hide');
          return;
      }
    },
    readPage(value) {
      this.$emit('read-page', value);
    }
  },
  watch: {
    areaToggle: {
      handler(newVal) {
        this.openArea(newVal);
      }
    }
  },
  mounted() {
    this.openArea(getSpoilerStorageValue());
  },
  template: `
    <div v-cloak>
      
      <breadcrumbs :parent="pageData.parent" :page-title="pageData.title" :dir="dir" @read-page="readPage"/>
      
      <div id="nonspoiler" :class="['content-area', pageData.createSpoilers === false ? '' : 'hide']" v-cloak>

        <!-- Create Non-Spoiler Buttons -->
        <div class="page-tab-btns"  v-show="pageContents.nonspoiler.length > 1">
            <button v-for="(html, index) in pageContents.nonspoiler" :id="html.id + '-btn'" :class="['btn', 'btn-primary', 'btn--color-secondary', 'btn--color-tab', index == 0 ? 'btn--active' : '']" @click="selectedTab('nonspoiler', html.pageid)">{{ html.name }}</button>
        </div>
        <!-- Create Non-Spoiler Content Area -->
        <tab v-for="(html, index) in pageContents.nonspoiler" :html="html.html" :id="html.pageid" :profile-data="html.profileBox" :class="{hide: index != 0}"/>

      </div>


      <div id="spoiler" class="content-area" v-show="pageData.createSpoilers === true" v-cloak> 

        <!-- Create Spoiler Buttons -->
        <div class="page-tab-btns" v-show="pageContents.spoiler.length > 1">
            <button v-for="(html, index) in pageContents.spoiler" :id="html.id + '-btn'" :class="['btn', 'btn-primary', 'btn--color-secondary', 'btn--color-tab', index == 0 ? 'btn--active' : '']" @click="selectedTab('spoiler', html.pageid)">{{ html.name }}</button>
        </div>
        <!-- Create Spoiler Content Area -->
        <tab v-for="(html, index) in pageContents.spoiler" :html="html.html" :id="html.pageid" :profile-data="html.profileBox" :class="{hide: index != 0}"/>

      </div>
    </div>`
};

const tabs = {
  name: 'tabs',
  props: {
    html: {
      type: Object,
      required: true
    },
  },
  methods: {
    selectedTab(area, id) {
      for (let tab of this.html[area]) {
        let tabDiv = document.getElementById(tab.pageid);
        let btn = document.getElementById(tab.pageid.replace('-page', '-btn'));

        if (tab.pageid === id) {
          tabDiv.classList.remove('hide');
          btn.classList.add('btn--active');
          continue;
        }
        tabDiv.classList.add('hide');
        btn.classList.remove('btn--active');
      }
    },
  },
  template: `
    <!-- Create Spoiler Buttons -->
    <div class="page-tab-btns">
      <button v-for="(html, index) in html" :id="html.id + '-btn'" :class="['btn', 'btn-primary', 'btn--color-secondary', 'btn--color-tab', index == 0 ? 'btn--active' : '']" @click="selectedTab('spoiler', html.id)">{{ html.name }}</button>
    </div>

    <!-- Create Spoiler Content Area -->
    <tab v-for="(html, index) in html" :html="html.html" :id="html.id" :class="{hide: index != 0}"/>

  `
};

const tab = {
  name: 'tab',
  props: {
    html: { type: String, required: false },
    id: { type: String, required: false },
    profileData: { type: Object, default: {} }
  },
  components: ['profilebox'],
  template: `
    <div :id="id">
      <profilebox v-if="Object.keys(profileData).length !== 0" :profile-data="profileData"/>
      <div v-html="html"></div>
    </div>
  `,
};

const profilebox = {
  name: 'profilebox',
  data() {
    return {
      imageData: {},
    };
  },
  props: {
    profileData: { type: Object, default: {} }
  },
  methods: {
    selectedTab(id) {

      for (let tab in this.imageData) {

        let tabDiv = document.getElementById(tab);

        let btn = document.getElementById(tab + '-btn');
        if (tab === id) {
          tabDiv.classList.remove('hide');
          btn.classList.add('btn--active');
          continue;
        }
        tabDiv.classList.add('hide');
        btn.classList.remove('btn--active');
      }
    },
  },
  watch: {
    profileData: {
      immediate: true,
      handler(newVal) {
        if (Object.keys(newVal) === 0) return;
        this.imageData = {};
        for (const img in newVal.Image) {
          this.imageData[img.trim().replace(/\s/, '-').toLowerCase() + "-" + makeid(8)] = {
            name: img,
            path: newVal.Image[img]
          };
        }
        // this.$forceUpdate();
      }
    }
  },
  template: `
    <div class="profile-box profile-box--visual float-end">
      <div class="profile-title"> {{ profileData.Title }}</div>

      <div class="profile-image" v-if="Object.keys(imageData).length !== 0">
        <template v-for="(value, name, index) in imageData">
            <button @click="selectedTab(name)" :id="name + '-btn'" 
              :class="['btn', 'btn-primary', 'btn--color-tertiary', 'btn--color-tab', 'font--smaller', index == 0 ? 'btn--active' : '' ]"> 
              {{ value.name }}
            </button>
        </template>

        <template v-for="(value, name, index) in imageData">
            <img :src="value.path" :alt="value.name" :id="name" :class="['profile-image', index != 0 ? 'hide' : '']" />
        </template>
      </div>

      <table>
        <tbody>

          <template v-for="(category, name) in profileData.Content">
            <tr v-if="name !== 'Desc'"  class="category"> 
              <td colspan="2">{{name}}</td>
            </tr>
            <tr v-for="(value, type) in category">
              <td class="type"><b> {{ type }} </b></td>
              <td v-if="!Array.isArray(value)"> {{ value }} </td>
              <td v-if="Array.isArray(value)"> 
                <template v-for="itemName in value"> 
                • {{ itemName }} <br>
                </template>  
              </td>
            </tr>
          </template>

        </tbody>
      </table>
    </div>
  `
};

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

const breadcrumbs = {
  name: 'breadcrumbs',
  data() {
    return {
      breadcrumbs: [],
      show: false,
    };
  },
  emits: ['read-page'],
  components: ['btn'],
  props: {
    parent: { type: String, default: null },
    pageTitle: { type: String, default: null },
    dir: { type: Object, default: {} }
  },
  methods: {
    updateCrumbs() {
      this.breadcrumbs = [];
      let target = this.parent;
      let isFound = false;
      while (true) {
        isFound = false;
        if (target == null) break;
        for (let name in this.dir) {
          if (name != target) continue;

          // Checks for chain parent
          if (this.dir[name].parent != "") target = this.dir[name].parent;
          else target = null;

          // Adds to crumbs
          this.breadcrumbs.unshift({
            title: "  »  ",
            path: null,
            type: "arrow"
          });
          this.breadcrumbs.unshift({
            title: this.dir[name].title,
            urlName: name,
            type: "link"
          });
          isFound = true;
          break;
        }
        if (!isFound) break;
      }
      this.show = true;
      if (this.breadcrumbs.length === 0) {
        return;
      }
      this.breadcrumbs.push({
        title: this.pageTitle,
        urlName: null,
        type: "arrow"
      });
    },
  },
  watch: {
    parent: {
      immediate: true,
      handler(newVal) {
        if (this.parent == null) return;
        if (Object.keys(this.dir).length === 0) return;

        this.updateCrumbs();
      }
    }
  },
  template: `
    <div class="page-breadcrumbs" v-if="this.breadcrumbs.length !== 0">
      <template v-for="crumb in breadcrumbs">
        <btn v-if="crumb.type == 'link'" class="m-0" @btn-click="$emit('read-page', crumb.urlName)" :text="crumb.title"/>
        <button v-if="crumb.type === 'arrow'" class="btn m-0 clear">{{ crumb.title }}</button>
      </template>
    </div>  
  `
};

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
  },
  emits: ['save-content', 'delete-page', 'update-project', 'new-page', 'history-previous'],
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
      console.log(document.getElementById('sidebar'));
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
          console.log(obj);
        }
      }

      this.sendToChild = "refresh";
      await this.$nextTick();
      this.sendToChild = "";
      console.log(this.editorData);
    }
  },
  computed: {
    getSpoilerStorageValue() {
      if (Object.keys(this.editorData).length === 0) return;
      return this.tempCreateSpoilers;
    }
  },
  template: `
    <sidebar @delete-page="$emit('delete-page')" @update-project="$emit('update-project')" @new-page="$emit('new-page')"/> 

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
            <meta-editor :editor-data="editorData" @editor-changed="editorChanged" :order-from-parent="sendToChild" @send-data="(data) => tempPageData = data"/>
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

const sideBar = {
  name: 'sidebar',
  emits: ['delete-page', 'hide-page', 'update-project', 'new-page'],
  methods: {
    closeSidebar() {
      document.getElementById('sidebar').classList.add('hide');
    },
    deletePage() {
      if (!confirm('Do you really want to delete this page?')) return;
      this.$emit('delete-page');
      this.closeSidebar();
    }
  },
  template: `
    <div id="sidebar" class='sidebar hide'>
      <btn class="font--medium float-end" text="✕" @btn-click="closeSidebar"/>
      <h2 class='mb-3'>Side Menu</h2>
      
      <btn class="font--medium btn--color-secondary" text="New Page" @btn-click="$emit('new-page')"/>
      <btn class="font--medium btn--color-secondary" text="Delete Page" @btn-click="deletePage"/>
      <!-- <btn class="font--medium btn--color-secondary" text="Hide Page" @btn-click="$emit('hide-page')"/> -->
      <btn class="font--medium btn--color-secondary" text="Update Project" @btn-click="$emit('update-project')"/>
      
    </div>
  `
};

const profileEditor = {
  name: 'profile-editor',
  data() {
    return {
      profileData: {},
      tempProfileData: {},
      selectedTabId: "",

      selectDropData: {},

      // Spoilers
      createSpoilers: false,
    };
  },
  emits: ['editor-changed', 'send-data'],
  props: {
    editorData: { type: Object, required: true, default: {} },
    orderFromParent: { type: String }
  },
  watch: {
    orderFromParent: {
      immediate: true,
      handler(newVal) {
        if (!newVal) return;
        switch (newVal) {
          case "sendData":
            this.$emit('send-data', this.tempProfileData);
            return;
          case "refresh":
            this.profileData = this.editorData.profileData;
            this.generateSelectDropData();
            this.tempProfileData = JSON.parse(JSON.stringify(this.profileData));
            this.changeProfileBox(this.selectedTabId);
            this.createSpoilers = this.editorData.pageData.createSpoilers;
            return;
          case "createSpoilersFalse":
            this.createSpoilers = false;
            return;
          case "createSpoilersTrue":
            this.createSpoilers = true;
            return;
        }
      }
    },
    editorData: {
      immediate: true,
      handler(newVal) {
        if (Object.keys(newVal).length === 0) return;

        this.profileData = this.editorData.profileData;

        // Get Default opened
        let nonspoilerKeys = Object.keys(this.profileData);
        if (nonspoilerKeys.length !== 0) {
          this.selectedTabId = nonspoilerKeys[0];
        }

        this.generateSelectDropData();
        this.tempProfileData = JSON.parse(JSON.stringify(this.profileData));
        this.changeProfileBox(this.selectedTabId);

        // Spoilers
        // this.createSpoilers = this.editorData.pageData.createSpoilers;
      }
    }
  },
  methods: {
    generateSelectDropData() {
      this.selectDropData = {};
      for (const area in this.editorData.contentData) {
        for (const item of this.editorData.contentData[area]) {
          this.selectDropData[item.id] = {
            name: item.name,
            data: this.editorData.profileData[item.id],
            type: area
          };
        }
      }
    },
    changeProfileBox(id) {
      if (id === "") return;
      this.selectedTabId = id;

      const data = this.tempProfileData[id];
      if (data === undefined) {
        this.jsonEditor.set({});
        return;
      }
      this.jsonEditor.set(data);
    },
    tempSaveProfile() {
      let data = {};
      try {
        data = this.jsonEditor.get();
      } catch (error) {
        console.log("Not Proper JSON");
        return;
      }
      this.$emit('editor-changed');
      this.tempProfileData[this.selectedTabId] = data;
    },
  },
  mounted() {
    const container = document.getElementById("jsoneditor-div");
    const options = {
      mode: 'code',
      onChange: this.tempSaveProfile
    };
    this.jsonEditor = new JSONEditor(container, options);
  },
  template: `
    <select-drop :data="selectDropData" @changed-select="changeProfileBox" :createSpoilers="createSpoilers"/>
    <div id="jsoneditor-div" style="height: 500px;"></div>
    `
};

const contentEditor = {
  name: 'content-editor',
  emits: ['editor-changed', 'send-data'],
  components: ['btn'],
  data() {
    return {
      tempContentData: "",

      selectedTabId: {},
      selectedContent: "",

      spoilerSelectedTab: "",
      nonspoilerSelectedTab: "",

      // Spoiler
      createSpoilers: false,
    };
  },
  props: {
    editorData: { type: Object, required: true, default: {} },
    orderFromParent: { type: String }
  },
  watch: {
    orderFromParent: {
      immediate: true,
      handler(newVal) {
        if (newVal === '') return;
        switch (newVal) {
          case "sendData":
            this.$emit('send-data', this.tempContentData);
            return;
          case "refresh":
            for (const item of this.editorData.contentData[this.selectedTabId.area]) {
              if (item.id != this.selectedTabId.id) continue;
              this.md.value(item.html);
              break;
            }
            this.tempContentData = JSON.parse(JSON.stringify(this.editorData.contentData));
            this.createSpoilers = this.editorData.pageData.createSpoilers;
            return;
          case "createSpoilersFalse":
            this.openArea('nonspoiler');
            this.createSpoilers = false;

            return;
          case "createSpoilersTrue":
            this.createSpoilers = true;
            return;
        }
      }
    },
    editorData: {
      immediate: true,
      handler(newVal) {
        if (Object.keys(newVal).length === 0) return;
        const contentData = this.editorData.contentData;
        this.selectedContent = contentData.nonspoiler[0].html;

        if (contentData.spoiler.length != 0) {
          this.spoilerSelectedTab = contentData.spoiler[0].id;
        }

        if (contentData.nonspoiler.length != 0) {
          this.nonspoilerSelectedTab = contentData.nonspoiler[0].id;
        }
        this.selectedTabId = { area: 'nonspoiler', id: this.nonspoilerSelectedTab };

        this.tempContentData = JSON.parse(JSON.stringify(contentData));
      }
    },
    selectedContent: {
      immediate: true,
      handler(newVal) {
        if (!newVal) return;
        this.md.value(this.selectedContent);
      }
    }
  },
  methods: {
    selectedTab(area, tabId) {
      this.selectedTabId = { area: area, id: tabId };
      for (let item of this.tempContentData[area]) {
        let btn = document.getElementById(item.id + '-editor-btn');
        if (!btn) continue;
        if (item.id === tabId) {
          this.selectedContent = item.html;
          btn.classList.add('btn--active');
          continue;
        } else {
          btn.classList.remove('btn--active');
        }
      }
      switch (area) {
        case 'spoiler':
          this.spoilerSelectedTab = tabId;
          return;
        case 'nonspoiler':
          this.nonspoilerSelectedTab = tabId;
          return;
      }
    },
    openArea(area) {
      let btnSpoiler = document.getElementById('nonspoiler-editor-area-btn');
      let btnNonSpoiler = document.getElementById('spoiler-editor-area-btn');

      let divSpoiler = document.getElementById('spoiler-editor');
      let divNonSpoiler = document.getElementById('nonspoiler-editor');

      switch (area) {
        case 'spoiler':
          this.selectedTab('spoiler', this.spoilerSelectedTab);
          divSpoiler.classList.remove('hide');
          divNonSpoiler.classList.add('hide');

          btnSpoiler.classList.remove('btn--active2');
          btnNonSpoiler.classList.add('btn--active2');
          return;

        case 'nonspoiler':
          this.selectedTab('nonspoiler', this.nonspoilerSelectedTab);
          divSpoiler.classList.add('hide');
          divNonSpoiler.classList.remove('hide');

          btnSpoiler.classList.add('btn--active2');
          btnNonSpoiler.classList.remove('btn--active2');
          return;
      }
    },
    generateMDEditor(textarea) {
      this.md = new EasyMDE({
        element: textarea,
        initialValue: '',
        autofocus: true,
        hideIcons: [
          "guide",
          "side-by-side",
          "preview"
        ],
        forceSync: true,
      });

      this.md.value('');
      this.md.codemirror.on("change", () => {
        for (const item of this.tempContentData[this.selectedTabId.area]) {
          if (item.id == this.selectedTabId.id) {
            item.html = this.md.value();
            return;
          }
        }
      });
    }
  },
  mounted() {
    let textarea = document.getElementById('content-textarea-editor');
    this.generateMDEditor(textarea);
  },
  template: `

    <div>
      <btn @btn-click="openArea('nonspoiler')" text="Non-Spoiler" btn-id="nonspoiler-editor-area-btn" class="btn--active2"/>
      <btn @btn-click="openArea('spoiler')" text="Spoiler" btn-id="spoiler-editor-area-btn" v-show="createSpoilers == true"/>
    </div>
    <!-- v-show="areaName == 'nonspoiler' || (areaName == 'spoiler' && createSpoilers == true)" -->
    <template v-for="(area, areaName, areaIndex) in editorData.contentData">
      <!-- Areas -->
      <div :id="areaName + '-editor'" :class="[ areaName !== 'nonspoiler' ? 'hide' : '']">

        <!-- Buttons -->
          <button v-for="(content, contentIndex) in area" @click="selectedTab(areaName, content.id)" :id="content.id + '-editor-btn'"  
            :class="['btn', 'btn-primary', 'btn--color-secondary', 'btn--color-tab', 'font--smaller', contentIndex == 0 ? 'btn--active' : '' ]"> 
            {{ content.name }}
          </button>

      </div>

    </template>

    <!-- Page Contents -->
    <div id="content-markdown-editor">
      <textarea id="content-textarea-editor"></textarea>
    </div>

    `
};

const metaEditor = {
  name: 'meta-editor',
  data() {
    return {
      titleVal: "",
      parentVal: "",
      tagsVal: "",
      urlName: "",
      urlPath: "",
      descVal: "",
      
      tempPageData: {}
    };
  },
  emits: ['editor-changed', 'send-data'],
  props: {
    editorData: { type: Object, required: true },
    orderFromParent: { type: String }
  },
  components: ['textinput'],
  watch: {
    editorData: {
      immediate: true,
      handler(newVal) {
        if (Object.keys(newVal).length === 0) return;

        this.tempPageData = JSON.parse(JSON.stringify(this.editorData.pageData));

        this.titleVal = this.editorData.pageData.title;
        this.urlName = this.editorData.pageData.urlName;
        this.urlPath = this.editorData.pageData.urlPath;
        this.parentVal = this.editorData.pageData.parent;
        this.tagsVal = this.editorData.pageData.tags;
        this.descVal = this.editorData.pageData.description;

        if (this.urlPath.charAt(this.urlPath.length - 1) != '/') {
          this.urlPath += '/';
        }
      }
    },
    orderFromParent: {
      immediate: true,
      handler(newVal) {
        if (!newVal) return;
        switch (newVal) {
          case "sendData":
            const urlNameSplit = this.urlName.split("/");

            this.tempPageData.title = this.titleVal.trim();
            this.tempPageData.parent = this.parentVal.trim();
            this.tempPageData.tags = this.tagsVal.trim();
            this.tempPageData.urlPath = this.urlPath.trim();
            this.tempPageData.urlName = this.urlName.trim();
            this.tempPageData.description = this.descVal.trim();

            this.$emit('send-data', this.tempPageData);
            return;
          case "refresh":
            this.titleVal = this.tempPageData.title;
            this.parentVal = this.tempPageData.parent;
            this.tagsVal = this.tempPageData.tags;
            this.urlPath = this.tempPageData.urlPath;
            this.urlName = this.tempPageData.urlName;
            this.descVal = this.tempPageData.description;
            return;
        }
      }
    },
  },
  template: `
    <table class="editor-table me-5">
      <tbody>
        <tr class="input-text input-text--visual">
          <textinput id="pageTitle" name="Page Title" place-holder="Awesome page title!" v-model="titleVal" @editor-changed="$emit('editor-changed')"/> </tr>
        <tr class="input-text input-text--visual">
          <textinput id="pageTitle" name="Url Name" place-holder="page file name" v-model="urlName" @editor-changed="$emit('editor-changed')"/> </tr>
        <tr class="input-text input-text--visual">
          <textinput id="pageTitle" name="Path" place-holder="page file name" v-model="urlPath" @editor-changed="$emit('editor-changed')"/> </tr>
        <tr class="input-text input-text--visual">
          <textinput id="pageParent" name="Parent" place-holder="Parent page for breadcrumbs" v-model="parentVal" @editor-changed="$emit('editor-changed')"/> </tr>
        <tr class="input-text input-text--visual">
          <textinput id="Tags" name="Tags" place-holder="TagA TagB TagC" v-model="tagsVal" @editor-changed="$emit('editor-changed')"/> </tr>
          <tr class="input-text input-text--visual">
          <textinput id="Tags" name="Description" place-holder="Page Description" v-model="descVal" @editor-changed="$emit('editor-changed')"/> </tr>
      </tbody>
    </table>`
};

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
      console.log(this.tabName);
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
              <textinput id="tabName"  name="Tab Name" :no-name='true' place-holder="Place a name here" v-model="tabName" @editor-changed="$emit('editor-changed')"/> </tr>
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

const textInput = {
  name: `textinput`,
  emits: ['editor-changed', 'update:modelValue'],
  props: {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    placeHolder: { type: String, default: "" },
    modelValue: { type: String, default: "" },
    noName: { type: Boolean, default: false },
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
    <td class="textinput-label" ><label :for="id" v-if="noName == false"> {{ name }}: </label></td>
    <td class="textinput-input" ><input type="text" :id="id" :name="name" class="outline-primary" :placeHolder="placeHolder" v-model="value" /></td>
  `
};

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

// const sideButton = {
//   name: `side-btn`,
//   components: 
//   template: ``
// };