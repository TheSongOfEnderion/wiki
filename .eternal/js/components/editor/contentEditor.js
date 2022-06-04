/*jshint esversion: 9 */

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