/*jshint esversion: 9 */

const tab = {
    name: 'tab',
    props: {
      html: { type: String, required: false },
      id: { type: String, required: false },
      profileData: { type: Object, default: {} }
    },
    components: ['profilebox'],
    template: `
      <div :id="id">
        <profilebox v-if="Object.keys(profileData).length !== 0" :profile-data="profileData"/>
        <div v-html="html"></div>
      </div>
    `,
  };