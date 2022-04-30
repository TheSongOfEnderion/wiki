/*jshint esversion: 9 */

const btn = {
  name: 'btn',
  props: {
    text: { type: String, default: 'Button Text', },
    btnId: { type: String },
  },
  methods: {
    onClick() {
      this.$emit('btn-click');
    }
  },
  template: `<button type='button' @click="onClick()" :id="btnId" :class="['btn', 'btn-primary', 'btn--color-primary']">{{ text }}</button>`,

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
          <btn :text="item" v-for="item in getNavBtns" class="btn--header"/>
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
  props: {
    html: { type: Object, default: { nonspoiler: [], spoiler: [] }, required: true },
    pageData: { type: Object, default: {} },
    dir: { type: Object, default: {} },
    areaToggle: { type: Boolean, default: false }
  },
  components: ['tab', 'breadcrumbs'],
  methods: {
    selectedTab(area, pageid) {
      for (let tab of this.html[area]) {
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
      
      <breadcrumbs :parent="pageData.parent" :page-title="pageData.title" :dir="dir"/>
      
      <div id="nonspoiler" :class="['content-area', pageData.createSpoilers === false ? '' : 'hide']" v-cloak>

        <!-- Create Non-Spoiler Buttons -->
        <div class="page-tab-btns"  v-show="html.nonspoiler.length > 1">
            <button v-for="(html, index) in html.nonspoiler" :id="html.id + '-btn'" :class="['btn', 'btn-primary', 'btn--color-secondary', 'btn--color-tab', index == 0 ? 'btn--active' : '']" @click="selectedTab('nonspoiler', html.pageid)">{{ html.name }}</button>
        </div>
        <!-- Create Non-Spoiler Content Area -->
        <tab v-for="(html, index) in html.nonspoiler" :html="html.html" :id="html.pageid" :profile-data="html.profileBox" :class="{hide: index != 0}"/>

      </div>


      <div id="spoiler" class="content-area" v-show="html.spoiler.length > 1 && pageData.createSpoilers === true" v-cloak> 

        <!-- Create Spoiler Buttons -->
        <div class="page-tab-btns" v-show="html.spoiler.length > 1">
            <button v-for="(html, index) in html.spoiler" :id="html.id + '-btn'" :class="['btn', 'btn-primary', 'btn--color-secondary', 'btn--color-tab', index == 0 ? 'btn--active' : '']" @click="selectedTab('spoiler', html.pageid)">{{ html.name }}</button>
        </div>
        <!-- Create Spoiler Content Area -->
        <tab v-for="(html, index) in html.spoiler" :html="html.html" :id="html.pageid" :profile-data="html.profileBox" :class="{hide: index != 0}"/>

      </div>
    </div>`
};

const tabs = {
  name: 'tabs',
  props: {
    html: { type: Object, required: true },
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
        for (const img in newVal.Image) {
          this.imageData[img.trim().replace(/\s/, '-').toLowerCase() + "-" + makeid(8)] = { name: img, path: newVal.Image[img] };
        }
      }
    }
  },
  template: `
    <div class="profile-box profile-box--visual float-end">
      <div class="profile-title"> {{ profileData.Title }}</div>

      <div class="profile-image">
        <template v-for="(value, name, index) in imageData">
            <button @click="selectedTab(name)" :id="name + '-btn'" 
              :class="['btn', 'btn-primary', 'btn--color-secondary', 'btn--color-tab', 'font--smaller', index == 0 ? 'btn--active' : '' ]"> 
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
  props: {
    parent: { type: String, default: null },
    pageTitle: { type: String, default: null },
    dir: { type: Object, default: {} }
  },
  methods: {
    updateCrumbs() {
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
            path: this.dir[name].path,
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
        path: null,
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
        <a v-if="crumb.type == 'link'" :href="crumb.path">{{ crumb.title }} </a>
        <span v-if="crumb.type === 'arrow'">{{ crumb.title }} </span>
      </template>
    </div>  
  `
};


const editor = {
  name: 'editor',
  props: {
    editorData: { type: Object, required: true }
  },
  components: ['textinput', 'markdown', 'btn', 'content-editor'],
  methods: {
    hidePageContent() {
      document.getElementById('page-content').classList.toggle("hide");

      document.getElementById('editor').classList.toggle("hide");

    },
    saveContent() {
      this.$emit('save-page');
    },
    openEditorTab(tabName) {
      const tabList = ['content-editor', 'manage-tab'];
      for (let tab of tabList) {
        if (tab === tabName) {
          document.getElementById(tabName).classList.remove("hide");
          continue;
        }
        document.getElementById(tab).classList.add("hide");
      }
    }
  },
  template: `
  <btn @btn-click="hidePageContent" text="Open Editor"/>
  <div id="editor" class="container hide">
    <div id="editor-menu" class="row card card--visual mt-1 mb-4">
      <h1 class="font--25 mb-2 ps-1">Editor</h1>

      <div class="container px-0 pb-3">
        <div class="row">
          <table class="editor-table me-5">
            <tbody>
              <tr class="input-text input-text--visual">
                <textinput id="pageTitle" name="Page Title" place-holder="Awesome page title!" /> </tr>
              <tr class="input-text input-text--visual">
                <textinput id="pageParent" name="Parent" place-holder="Parent page for breadcrumbs" /> </tr>
              <tr class="input-text input-text--visual">
                <textinput id="Tags" name="Tags" place-holder="TagA TagB TagC" /> </tr>
            </tbody>
          </table>
        </div>

        <div class="row mt-2 ">
          <div class="col">
            <div class="d-flex justify-content-start">
              <btn class="font--small" text="Edit Contents" @btn-click="openEditorTab('content-editor')"/>
              <btn class="font--small" text="Manage Tabs" @btn-click="openEditorTab('manage-tab')"/>
              <btn class="font--small" text="Script" />
            </div>
          </div>

          <div class="col">
            <div class="d-flex justify-content-end">
              <btn class="font--small" text="Save" @btn-click="saveContent" />
              <btn class="font--small" text="Close" />
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="row card card--visual mb-5">

      <div id="content-editor">
        <h1 class="page-title d-flex justify-content-between" v-cloak>Content Editor</h1>
        <content-editor :editor-data="editorData" />
      </div>

      <div id="manage-tab" class="hide">
        <h1 class="page-title d-flex justify-content-between" v-cloak>Manage Tab</h1>

      </div>

    </div>


    
    

  </div>
  `
};

const contentEditor = {
  name: 'content-editor',
  props: {
    editorData: { type: Object, required: true }
  },
  methods: {
    selectedTab(area, tabId) {

      for (let item of this.editorData.contentData[area]) {
        const id = item.id;
        let tabDiv = document.getElementById(id + '-editor');
        if (!tabDiv) continue;
        let btn = document.getElementById(id + '-editor-btn');
        // console.log(id + '-btn');
        if (id === tabId) {
          tabDiv.classList.remove('hide');

          btn.classList.add('btn--active');
          console.log(btn.classList);
          continue;
        }
        tabDiv.classList.add('hide');
        btn.classList.remove('btn--active');
      }
    },
    openArea(area) {
      let btnSpoiler = document.getElementById('nonspoiler-editor-area-btn');
      let btnNonSpoiler = document.getElementById('spoiler-editor-area-btn');

      let divSpoiler = document.getElementById('spoiler-editor');
      let divNonSpoiler = document.getElementById('nonspoiler-editor');

      btnSpoiler.classList.toggle('btn--active2');
      btnNonSpoiler.classList.toggle('btn--active2');

      switch (area) {
        case 'spoiler':
          divSpoiler.classList.remove('hide');
          divNonSpoiler.classList.add('hide');
          return;
        case 'nonspoiler':
          divSpoiler.classList.add('hide');
          divNonSpoiler.classList.remove('hide');
          return;
      }
    }
  },
  components: ['markdown', 'btn'],
  template: `

    <div>
      <btn @btn-click="openArea('nonspoiler')" text="Non-Spoiler" btn-id="nonspoiler-editor-area-btn" class="btn--active2"/>
      <btn @btn-click="openArea('spoiler')" text="Spoiler" btn-id="spoiler-editor-area-btn"/>
    </div>


    <template v-for="(area, areaName, areaIndex) in editorData.contentData">
      <!-- Areas -->
      <div :id="areaName + '-editor'" :class="[ areaName !== 'nonspoiler' ? 'hide' : '']">
        <!-- Buttons -->
        <template v-for="(content, contentIndex) in area">
          <button @click="selectedTab(areaName, content.id)" :id="content.id + '-editor-btn'"  
            :class="['btn', 'btn-primary', 'btn--color-secondary', 'btn--color-tab', 'font--smaller', contentIndex == 0 ? 'btn--active' : '' ]"> 
            {{ content.name }}
          </button>
        </template>

        <!-- Page Contents -->
        <template v-for="(content, contentIndex) in area">
          <div :class="[ contentIndex == 0 ? '' : 'hide']" :id="content.id + '-editor'">
            <markdown  :text-id="content.id + '-md'" :content="content.html"/>
          </div>
        </template>
      </div>

    </template>
    `
};



const markdown = {
  name: 'markdown',
  props: {
    textId: { type: String, required: true },
    content: { type: String, default: " " }
  },
  methods: {
    generateMDEditor(textarea, initialValue) {
      const md = new EasyMDE({
        element: textarea,
        initialValue: initialValue,
        autofocus: true,
        hideIcons: [
          "guide",
          "side-by-side",
          "preview"
        ],
        forceSync: true,
      });
      md.value(this.content);
    }
  },
  mounted() {
    let ta = document.getElementById(this.textId);
    this.generateMDEditor(ta, ``);
  },
  template: `
  <div>
    <textarea :id="textId"></textarea>
  </div>
  `
};

const textInput = {
  name: `textinput`,
  props: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    placeHolder: { type: String, default: "" },
    classBorderUp: { type: String, default: "" },
    classBorderDown: { type: String, default: "" },
  },
  template: `
    <td class="textinput-label"><label :for="id" > {{ name }}: </label></td>
    <td class="textinput-input"><input type="text" :id="id" :name="name" class="outline-primary" :placeHolder="placeHolder"/></td>
  `
};