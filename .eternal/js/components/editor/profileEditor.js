/*jshint esversion: 9 */

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