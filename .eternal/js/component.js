/*jshint esversion: 9 */

const btn = {
  name: 'btn',
  props: {
    text: { type: String, default: 'Button Text', }
  },
  methods: {
    onClick() {
      this.$emit('btn-click');
    }
  },
  template: `<button @click="onClick()" class="btn btn-primary font--medium">{{ text }}</button>`,

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
          <btn :text="item" v-for="item in getNavBtns" class="btn--transparent font--dark font--w-bold"/>
        </div>

    </div>`,
};


const card = {
  name: 'card',
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
    dir: { type: Object, default: {} }
  },
  components: ['tab', 'toggle', 'breadcrumbs'],
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
  mounted() {
    this.openArea(getSpoilerStorageValue());
  },
  template: `
    <div v-cloak>
      <breadcrumbs :parent="pageData.parent" :page-title="pageData.title" :dir="dir"/>
      <toggle v-if="pageData.createSpoilers === true" @toggled="openArea"/>

      <div id="nonspoiler" class="content-area">
        <!-- Create Non-Spoiler Buttons -->
        <div class="page-tab-btns"  v-show="html.nonspoiler.length > 1">
            <button v-for="(html, index) in html.nonspoiler" :id="html.id + '-btn'" :class="['btn', 'btn-secondary', 'btn--color-secondary', 'btn--color-tab', index == 0 ? 'btn--active' : '']" @click="selectedTab('nonspoiler', html.pageid)">{{ html.name }}</button>
        </div>
        <!-- Create Non-Spoiler Content Area -->
        <tab v-for="(html, index) in html.nonspoiler" :html="html.html" :id="html.pageid"  :class="{hide: index != 0}"/>
      </div>


      <div id="spoiler" class="content-area" v-show="html.spoiler.length > 1">
        <!-- Create Spoiler Buttons -->
        <div class="page-tab-btns" v-show="html.spoiler.length > 1">
            <button v-for="(html, index) in html.spoiler" :id="html.id + '-btn'" :class="['btn', 'btn-secondary', 'btn--color-secondary', 'btn--color-tab', index == 0 ? 'btn--active' : '']" @click="selectedTab('spoiler', html.pageid)">{{ html.name }}</button>
        </div>
        <!-- Create Spoiler Content Area -->
        <tab v-for="(html, index) in html.spoiler" :html="html.html" :id="html.pageid" :class="{hide: index != 0}"/>
      </div>
    </div>`
};

const tab = {
  name: 'tab',
  props: {
    html: { type: String, required: false },
    id: { type: String, required: false },
  },
  template: `
      <div v-html="html" :id="id"></div>
  `,
};


const toggle = {
  name: 'toggle',
  data() {
    return {
      checkValue: getSpoilerStorageValue(),
    };
  },
  watch: {
    checkValue: {
      immediate: true,
      handler(value) {
        localStorage.theSongOfEnderion_isSpoiler = value;
      }
    }
  },
  template: `
  <input type="checkbox" aria-label="Toggle" class="toggle toggle-visual float-end" @change="$emit('toggled', checkValue)" v-model="checkValue">
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
          this.breadcrumbs.push({
            title: this.dir[name].title,
            path: this.dir[name].path,
            type: "link"
          });
          this.breadcrumbs.push({
            title: "  »  ",
            path: null,
            type: "arrow"
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
        type: "link"
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