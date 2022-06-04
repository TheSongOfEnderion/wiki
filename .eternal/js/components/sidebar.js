/*jshint esversion: 9 */

const sideBar = {
    name: 'sidebar',
    emits: ['delete-page', 'hide-page', 'update-project', 'new-page', 'set-page-as-template'],
    components: ['dropdown'],
    data() {
      return {
        template: '',
      };
    },
    props: {
      templateList: { type: Array, default: [] },
    },
    methods: {
      closeSidebar() {
        document.getElementById('sidebar').classList.add('hide');
      },
      deletePage() {
        // if (!window.confirm('Do you really want to delete this page?')) return;
        this.$emit('delete-page');
        this.closeSidebar();
      },
      newPage() {
        this.$emit('new-page', this.template);
      }
    },
    template: `
      <div id="sidebar" class='sidebar hide'>
  
        <btn class="font--medium float-end" text="✕" @btn-click="closeSidebar"/>
        <h2 class='mb-3'>Side Menu</h2>
  
        <btn class="font--medium btn--color-secondary" text="Update Project" @btn-click="$emit('update-project')"/>
  
        <br>
        <btn class="font--medium btn--color-secondary" text="New Page" @btn-click="newPage"/>
        <btn class="font--medium btn--color-secondary" text="Delete Page" @btn-click="deletePage"/>
        <br>
        <dropdown id="templateInput" place-holder="Template" v-model="template" :autocomplete-data="templateList"/>
        <br>
        <btn class="font--medium btn--color-secondary" text="Set page as Template" @btn-click="$emit('set-page-as-template')"/>
        <!-- <btn class="font--medium btn--color-secondary" text="Hide Page" @btn-click="$emit('hide-page')"/> -->
        <!-- :autocomplete-data="urlpaths" -->
        
      </div>
    `
  };