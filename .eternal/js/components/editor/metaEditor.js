/*jshint esversion: 9 */


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
  
        tempPageData: {},
      };
    },
    emits: ['editor-changed', 'send-data'],
    props: {
      editorData: { type: Object, required: true },
      urlpaths: { type: Array, default: [] },
      parentsList: { type: Array, default: [] },
      orderFromParent: { type: String },
      // dir:
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
  
          // this.parentsList = this.dir
        }
      },
      orderFromParent: {
        immediate: true,
        handler(newVal) {
          if (!newVal) return;
          switch (newVal) {
            case "sendData":
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
            <textinput id="pageTitle" name="Path" place-holder="page file name" v-model="urlPath" @editor-changed="$emit('editor-changed')" :autocomplete-data="urlpaths"/> </tr>
          <tr class="input-text input-text--visual">
            <textinput id="pageParent" name="Parent" place-holder="Parent page for breadcrumbs" v-model="parentVal" @editor-changed="$emit('editor-changed')" :autocomplete-data="parentsList"/> </tr>
          <tr class="input-text input-text--visual">
            <textinput id="Tags" name="Tags" place-holder="TagA TagB TagC" v-model="tagsVal" @editor-changed="$emit('editor-changed')"/> </tr>
            <tr class="input-text input-text--visual">
            <textinput id="Tags" name="Description" place-holder="Page Description" v-model="descVal" @editor-changed="$emit('editor-changed')"/> </tr>
        </tbody>
      </table>`
  };
  