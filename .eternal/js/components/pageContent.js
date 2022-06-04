/*jshint esversion: 9 */

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
              <button v-for="(html, index) in pageContents.nonspoiler" :id="html.id + '-btn'" :class="['btn', 'btn-primary', 'btn--color-tertiary', 'btn--color-tab', index == 0 ? 'btn--active' : '']" @click="selectedTab('nonspoiler', html.pageid)">{{ html.name }}</button>
          </div>
          <!-- Create Non-Spoiler Content Area -->
          <tab v-for="(html, index) in pageContents.nonspoiler" :html="html.html" :id="html.pageid" :profile-data="html.profileBox" :class="{hide: index != 0}"/>
  
        </div>
  
  
        <div id="spoiler" class="content-area" v-show="pageData.createSpoilers === true" v-cloak> 
  
          <!-- Create Spoiler Buttons -->
          <div class="page-tab-btns" v-show="pageContents.spoiler.length > 1">
              <button v-for="(html, index) in pageContents.spoiler" :id="html.id + '-btn'" :class="['btn', 'btn-primary', 'btn--color-tertiary', 'btn--color-tab', index == 0 ? 'btn--active' : '']" @click="selectedTab('spoiler', html.pageid)">{{ html.name }}</button>
          </div>
          <!-- Create Spoiler Content Area -->
          <tab v-for="(html, index) in pageContents.spoiler" :html="html.html" :id="html.pageid" :profile-data="html.profileBox" :class="{hide: index != 0}"/>
  
        </div>
      </div>`
  };