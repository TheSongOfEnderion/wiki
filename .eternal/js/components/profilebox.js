/*jshint esversion: 9 */

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
          this.imageData = {};
          for (const img in newVal.Image) {
            this.imageData[img.trim().replace(/\s/, '-').toLowerCase() + "-" + makeid(8)] = {
              name: img,
              path: newVal.Image[img]
            };
          }
          // this.$forceUpdate();
        }
      }
    },
    template: `
      <div class="profile-box profile-box--visual float-end">
        <div class="profile-title"> {{ profileData.Title }}</div>
  
        <div class="profile-image" v-if="Object.keys(imageData).length !== 0">
          <template v-for="(value, name, index) in imageData">
              <button @click="selectedTab(name)" :id="name + '-btn'" 
                :class="['btn', 'btn-primary', 'btn--color-tertiary', 'btn--color-tab', 'font--smaller', index == 0 ? 'btn--active' : '' ]"> 
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
  