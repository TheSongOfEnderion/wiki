/*jshint esversion: 9 */

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
  