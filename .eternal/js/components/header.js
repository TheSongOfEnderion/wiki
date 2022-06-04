/*jshint esversion: 9 */

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
  