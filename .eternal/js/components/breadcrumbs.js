/*jshint esversion: 9 */

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