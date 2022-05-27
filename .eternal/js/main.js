/*jshint esversion: 9 */

// Global Variables
var pageName = ''; // urlName of page

var idList = []; // ID list for the makeid() function
var root; // Reference to Vue App
var projectId = ''; // Long random id of project
var projectPath = ''; // Absolute path of project

/**
 * Start Page.
 *
 * Initiate creation of Vue App and rendering of page.
 *
 * @access     public
 * @see        TextRenderer
 */
function startPage() {
  const app = Vue.createApp({
    data() {
      return {
        meta: {},
        dir: {},
        headerNavBtn: {},

        // Project Variables
        projectTitle: '',
        projectSubtitle: '',


        // Page Variables
        pageData: {},
        pageTitle: '',
        pageContents: {
          spoiler: [],
          nonspoiler: []
        },

        // Others
        areaToggle: getSpoilerStorageValue(),
        editorData: {},

        isNewPage: false,

        rerenderData: {},
        pageHistory: [],

        urlpaths: [],
        parentlists: [],

        isElectron: false,
      };
    },
    methods: {
      /**
       * Electron Check.
       *
       * Sets this.isElectron to true if running on electron
       * and false if in browser reader mode.
       *
       * @access     private
       */
      isElectronCheck() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf(' electron/') == -1) { // Not electron
          console.log("Not on electron");
          this.isElectron = false;
          return;
        }
        this.isElectron = true; // Electron
      },

      /**
       * Spoiler Toggle Switcch Bool.
       *
       * sets this.areaToggle value.
       *
       * @access            private
       * @param {boolean}   checked  true/false.
       */
      areaToggleHandler(checked) {
        this.areaToggle = checked;
      },

      /**
       * Clear Variables.
       *
       * Resets key variables.
       *
       * @access     private
       */
      clearVars() {
        this.editorData = {};
        this.pageData = {};
        this.pageTitle = '';
        this.pageContents = {
          spoiler: [],
          nonspoiler: []
        };
      },

      /**
       * Get Page urlName.
       *
       * Get the current page urlName.
       *
       * @access           private
       * @return {string}  urlName.
       */
      getPageUrl() {
        if (!window.location.search) return 'home';
        let urlParams = new URLSearchParams(window.location.search);
        let url = urlParams.get('p').replace(/\s/g, "-");
        if (url) url.trim();
        return url;
      },

      /**
       * Clone Object.
       *
       * Simple deep copy of object.
       *
       * @access           private
       * @param {object}   obj  object to copy.
       */
      cloneObj(obj) {
        return JSON.parse(JSON.stringify(obj));
      },

      /**
       * Capitalize
       *
       * Makes the first letter of string into an uppercase..
       *
       * @access           private
       * @param {string}   string  string to capitalize.
       */
      capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      },

      /**
       * Update Project.
       *
       * Gets new css/js/index.html from template to update current project.
       *
       * @access     private
       */
      updateProject() {
        if (!this.isElectron) return;
        window.api.send('toMain', {
          name: 'project:update',
          id: this.meta.id,
          projectPath: projectPath
        });
      },

      /**
       * Load Previous History.
       *
       * Gets saved urlName in this.pageHistory and loads it.
       *
       * @access     private
       */
      async historyPrevious() {
        if (this.pageHistory.length === 1) return;
        await this.readPage(this.pageHistory[this.pageHistory.length - 2]);
        this.pageHistory = this.pageHistory.slice(0, this.pageHistory.length - 2);
      },

      /**
       * Goto Page urlName.
       *
       * Function used by links to open a new page.
       *
       * @access           private
       * @param {string}   urlName  unique name id of url in directory. 
       */
      async gotoPage(urlName) {
        await this.readPage(urlName);
      },

      /**
       * Delete Page.
       *
       * Sends instructions to electron to delete a page.
       * Then sends user back to homepage.
       *
       * @access     private
       */
      async deletePage() {
        // Validator
        if (!this.isElectron) return;
        if (pageName === 'home') {
          alert('Home Page cannot be deleted');
          return;
        }

        // Deletes page from directory
        delete this.dir[pageName];

        // code to move file into trash bin
        window.api.send('toMain', {
          name: 'project:deletepage',
          data: { pageName: pageName, projectPath: projectPath }
        });

        // Goes back home and hides sidebar
        this.readPage('home');
        document.getElementById('sidebar').classList.add('hide');

      },

      /**
       * Create New Page.
       *
       * Create new page to save.
       *
       * @access     private
       */
      async newPage() {
        pageName = 'new-page';
        window.history.replaceState(null, null, `?p=new-page`);
        this.clearVars();
        await this.renderPage('pageNull', 'assets/new-page.html');
        document.getElementById('sidebar').classList.add('hide');
      },

      /**
       * Saves Edited Content.
       *
       * Sends file to electron to save into an html.
       *
       * @access           private
       * @param {object}   data  object containing pageData, pageProfile, and pageContent.
       */
      async saveContent(data) {
        // Validator
        if (!this.isElectron) return;

        // Creates URLpath with urlName.html at the end /
        let pagePath = data.pageData.urlPath.slice().trim();
        if (pagePath.charAt(pagePath.length - 1) != '/') {
          pagePath += '/';
        }
        pagePath += data.pageData.urlName.replace(/\s/g, '-') + '.html';

        // Send to electron
        window.api.send('toMain', {
          name: 'project:save',
          id: this.meta.id,
          projectPath: projectPath,
          info: {
            pagePath: pagePath,
            isNewPage: this.isNewPage,
          },
          contentData: data.contentData,
          pageData: this.cloneObj(data.pageData),
          profileData: this.cloneObj(data.profileData),
        });

        // Saves to directory
        this.dir[data.pageData.urlName] = {
          "title": data.pageData.title,
          "path": pagePath,
          "parent": data.pageData.parent,
        };

        // Saves for rerender
        this.clearVars();
        await this.$nextTick();
        this.rerenderData = data;
      },

      /**
       * Rerenders page.
       *
       * After electron confirms the page has been saved
       * this function will rerender the saved data.
       *
       * @access     public
       */
      async rerenderPage() {
        await this.renderPage('rerender', this.rerenderData);
        this.rerenderData = {};
      },

      /**
       * Read Page.
       *
       * Reads page and do a validation check before rendering it.
       *
       * @access           private
       * @param {string}   urlName  name of page in dir.
       */
      async readPage(urlName) {
        pageName = urlName.replace(/\s/g, '-').trim();
        if (pageName !== 'home') {
          window.history.replaceState(null, null, `?p=${pageName}`);
        } else {
          window.history.replaceState(null, null, window.location.pathname);
        }

        this.clearVars();
        if (!this.dir.hasOwnProperty(pageName)) {
          // Null Render
          try {
            await this.renderPage('pageNull', 'assets/page-not-found.html');
          } catch (error) { console.log(error); }
          return;
        }
        // Standard Render
        await this.renderPage('normal', this.dir[pageName].path);
      },

      /**
       * Render Page.
       *
       * Actually does the rendering of the page.
       *
       * @access           private
       * @param {string}   mode  'normal', 'pageNull', or 'rerender'
       * @param {string}   data  urlName or urlPath if null
       */
      async renderPage(mode, data) {
        // Step 3. Set Page General Data
        this.headerNavBtn = this.meta.headerNavigation;
        this.projectTitle = this.meta.projectTitle;
        this.projectSubtitle = this.meta.projectSubtitle;
        this.areaToggle = getSpoilerStorageValue();
        let pageRaw = '';
        let html = '';
        var pageFile;

        document.getElementById('projectTitle').innerText = this.projectTitle;

        switch (mode) {
          case 'normal':
            try {
              pageFile = await fetch(data);
              if (pageFile.status == 404) {
                await this.renderPage('pageNull', 'assets/page-not-found.html');
                return;
              }
            } catch (error) {
              await this.renderPage('pageNull', 'assets/page-not-found.html');
              return;
            }

            html = await pageFile.text();
            pageRaw = html.trim().split("<!-- File Content -->");

            // Step 5. Processing Window Variables
            loadScripts(pageRaw[0]);
            this.isNewPage = false;
            break;

          case 'pageNull':
            pageFile = await fetch(data);
            html = (await pageFile.text()).replace('[[pageName]]', pageName);
            pageRaw = html.trim().split("<!-- File Content -->");

            // Step 5. Processing Window Variables
            loadScripts(pageRaw[0]);
            window.pageData.title = this.capitalize(pageName.replace(/\-/g, " ")).trim();
            window.pageData.urlName = pageName.trim().toLowerCase().replace(/\s/g, '-');

            if (data === 'assets/new-page.html') window.pageData.urlName += '-' + makeid(5);

            this.isNewPage = true;
            break;

          case 'rerender':
            window.profileData = data.profileData;
            window.pageData = data.pageData;

            this.isNewPage = false;
            break;
        }

        // Step 6. Set Page Specific Data
        this.pageData = window.pageData;
        this.pageTitle = window.pageData.title;
        this.pageParent = window.pageData.parent;

        let editorContentDataTemp = {};


        // Step 7. Process Contents
        let parsedContent = {};

        if (mode == 'rerender') {
          parsedContent = parseHTML(data.contentData);
        } else {
          parsedContent = parseHTML(pageRaw[1]);
        }

        let content = []; // Separating Each Part
        const areas = ['spoiler', 'nonspoiler'];
        for (const area of areas) {
          let areaDiv = parsedContent.getElementById(area);
          if (!areaDiv) continue;
          for (let item of areaDiv.querySelectorAll('.page-tab')) {
            let itemHtml = superTrim(item.innerHTML);
            editorContentDataTemp[item.id] = itemHtml;
            content.push(`<div id="${item.id}" class="page-tag">\n` + itemHtml + "\n</div>");
          }
        }

        const textRenderer = new TextRenderer(this.dir);

        // Step 8. Add Contents to render
        content.forEach((item, index) => { // Adding them to the tab
          let data = getPageData(item);
          let profileBox = {};
          if (window.profileData.hasOwnProperty(data.data.id)) {
            profileBox = window.profileData[data.data.id];
          }
          this.pageContents[data.type].push({ html: textRenderer.renderText(item, data.type), profileBox: profileBox, ...data.data });
        });

        let editorDataTemp = { pageData: window.pageData, profileData: window.profileData, contentData: JSON.parse(JSON.stringify(this.pageContents)) };
        for (const area in editorDataTemp.contentData) {
          for (const item of editorDataTemp.contentData[area]) {
            item.html = editorContentDataTemp[item.id];
            delete item.profileBox;
          }
        }

        this.editorData = editorDataTemp;
        console.log(this.editorData);

        // Tape and Stapler solution. I have no fucking idea why the nonspoiler div gets hidden at the start
        // when you opened a spoiler=true page from a link.
        if (this.areaToggle == false) {
          document.getElementById('nonspoiler').classList.remove('hide');
        }

        this.pageHistory.push(pageName);
      },

      /**
       * Create Script (floating status).
       *
       * Loads a script from src and adds it to page.
       *
       * @access           private
       * @param {string}   src  script src url.
       */
      createScript(src) {
        fetch(src).then(data => {
          data.text().then(r => {
            eval(r); // jshint ignore:line
          });
        });
      }
    },

    async created() {
      this.isElectronCheck();

      // this.createScript(".eternal/js/editor/codeflask.min.js");
      // this.createScript(".eternal/js/editor/jsoneditor.js");
      // this.createScript(".eternal/js/editor/easymde.min.js");

      // Creates API receive listener
      try {
        window.api.receive("fromMain", async(data) => {
          // Receives projectPath value
          if (data.name == 'projectpath') {
            if (projectPath != '') return;
            projectPath = data.value;
            console.log("Path: ", projectPath);

            // Get urlPath autocomplete data
            window.api.send('toMain', {
              name: 'project:getcontentdirs',
              id: projectId,
              projectPath: projectPath,
            });
            return;
          }

          // Rerenders page anew after saving it in editor
          if (data.name == 'done-saving') {
            console.log('Rerendering');
            await this.rerenderPage();
            return;
          }

          // Receives urlPath autocomplete data
          if (data.name == 'urlpaths') {
            this.urlpaths = data.value;
            return;
          }
        });
      } catch (error) {}
    },
    async mounted() {
      // Retrieves Necessary Files
      const metaRes = await fetch(`.eternal/eternal.json`); // Get Metadata
      this.meta = await metaRes.json();

      const dirRes = await fetch(`.eternal/directory.json`); // Get Directory
      this.dir = await dirRes.json();

      projectId = this.meta.id;

      // Save list for parent metada automcomplete data
      this.parentlists = Object.keys(this.dir);

      // Gets urlName
      pageName = this.getPageUrl();

      // Read and renders page
      await this.readPage(pageName);

      // Get the projectPath
      if (this.isElectron) {
        window.api.send('toMain', {
          name: 'project:getpath',
          id: this.meta.id
        });
      }
    }
  });

  // Register Components
  app.component(btn.name, btn);
  app.component(btntoggle.name, btntoggle);
  app.component(header.name, header);
  app.component(pageContent.name, pageContent);
  app.component(tab.name, tab);
  app.component(toggle.name, toggle);
  app.component(breadcrumbs.name, breadcrumbs);
  app.component(profilebox.name, profilebox);
  app.component(tabs.name, tabs);

  app.component(editor.name, editor);
  app.component(sideBar.name, sideBar);
  app.component(metaEditor.name, metaEditor);
  app.component(tabEditor.name, tabEditor);
  app.component(contentEditor.name, contentEditor);
  app.component(profileEditor.name, profileEditor);
  app.component(textInput.name, textInput);
  app.component(selectDrop.name, selectDrop);

  // Mount
  root = app.mount('#app');
}

/**
 * Get Page Data.
 *
 * Gets value of div tab, the id, pageid, and name.
 *
 * @access          public
 * @return {Object} Aan obj with {type, data: {id, pageid, name }} format.
 */
function getPageData(html) {
  const id = html.match(/<div id=\"(.+?)\"/)[1];
  return {
    type: window.pageData.tabs[id].area,
    data: {
      id: id,
      pageid: id + '-page',
      name: window.pageData.tabs[id].name
    }
  };
}

/**
 * Get Spoiler Storage Value.
 *
 * Gets value of spoiler switch from local storage
 *
 * @access            public
 * @return {Boolean}  true = spoiler is turned on. false = turned off.
 */
function getSpoilerStorageValue() {
  if (localStorage.theSongOfEnderion_isSpoiler === 'true') return true;
  else return false;
}

/**
 * Parse HTML String.
 *
 * Parses an HTML string into a Node object.
 *
 * @access           public
 * @param {string}   html   html string.
 * @return {Node}           a node with the parsed html string.
 */
function parseHTML(html) {
  let t = document.createElement('template');
  t.innerHTML = html;
  return t.content.cloneNode(true);
}

/**
 * Load Page HTML Script Variables.
 *
 * Parses the string \<script\> tag of the page html and
 * evaluates it so you can use its vars and funcs.
 *
 * @access     private
 * @param {string}   scriptData  string of the \<script\> 
 */
function loadScripts(scriptData) {
  let parsedData = parseHTML(scriptData);

  let scripts = parsedData.querySelectorAll("script");
  for (let script of scripts) {
    if (script.innerText) {
      eval(script.innerText); // jshint ignore:line
    } else if (script.src) {
      fetch(script.src).then(data => {
        data.text().then(r => {
          eval(r); // jshint ignore:line
        });
      });
    }
    // To not repeat the element
    script.parentNode.removeChild(script);
  }
}

/**
 * Supre trim string.
 *
 * Removes excess white space on every line in a 
 * multi-line string.
 * 
 * @access     public
 * @param {string}   text  string to remove white space.
 * @return {string}        processed string.
 */
function superTrim(text) {
  let content = text.trim().split("\n");
  let result = "";
  for (let con of content) {
    result += `${con.trim()}\n`;
  }
  return result;
}

/**
 * Text Renderer.
 *
 * Renders text and converts it from markdown to html.
 * 
 * @access     public
 */
class TextRenderer {
  constructor(dir) {
    this.headerConvertionTable = {
      '# ': 'h1',
      '## ': 'h2',
      '### ': 'h3',
      '#### ': 'h4',
      '##### ': 'h5',
      '###### ': 'h6',
    };
    this.renderTOC = false;
    this.dir = dir;
  }

  /**
   * Render Markdown Text
   *
   * Parses the markdown content of the html string and
   * applies markdown rules as well as custom rendering.
   *
   * @access     public
   * @param {string}   htmlContentString   raw string content of the html
   * @param {string}   area                'spoiler' or 'nonspoiler'
   */
  renderText(htmlContentString, area) {

    // Checks if toc is enabled in current page.
    if (htmlContentString.includes("[[toc]]")) {
      this.renderTOC = true;
    }

    // String split into multilines.
    const lines = htmlContentString.trim().split("\n");

    // Variables
    let htmlContent = ''; // Final Processed content
    var TOClist = {}; // Table of Contents

    for (const line of lines) {
      let value = line.trim();
      if (value == "") {
        htmlContent += '<p class="space"></p>';
        continue;
      }

      // Formats
      value = this.renderWordBold(value);
      value = this.renderWordItalic(value);

      // Link
      value = this.renderLink(value);

      // List
      if (value.startsWith("* ")) {
        htmlContent += `<li>${value.replace("* ", "").trim()}</li>\n`;
        continue;
      }

      // Headers
      const hres = value.match(/(#+)\s/);
      if (hres) {
        let h = this.headerConvertionTable[hres[0]];
        if (this.renderTOC) {
          let value_ = value.replace(hres[0], "");
          let id = `${area}-${value_.replace(/\s/g, "-").toLowerCase()}`;
          if (idList.includes(id)) {
            id += makeid(5);
          }
          htmlContent += `<${h} id="${id}" class="h">${value_}<a href="#" class="arrow-up">↑</a></${h}>\n`;
          TOClist[value_] = { id: id, h: h.toUpperCase() };
        } else {
          htmlContent += `<${h} class="h">${value.replace(hres[0], "")}</${h}>\n`;
        }

        if (h == "h1") htmlContent += '<hr>\n';
        continue;
      }


      // Checks if first. Add Value
      if (htmlContent === '') {
        htmlContent += value + "\n";
      } else {
        htmlContent += value + "<br>\n";
      }
    }

    // Creates Table of Content after rendering everything
    let toc = `<p class="font--small"><b>Table of Contents</b></p>`;
    for (const head in TOClist) {
      toc += `\n<a href="#${TOClist[head].id}" class="toc-${TOClist[head].h} btn-primary btn--color-tertiary">${head}</a><br>`;
    }

    // Adds toc to processed content
    htmlContent = htmlContent.replace("[[toc]]", `<div class="toc">${toc}</div>`);
    this.renderTOC = false;

    // Returns processed file.
    return htmlContent;
  }

  /**
   * Render Link.
   *
   * Renders links containing [[ {word} ]] and turns it 
   * into an <a>{word}</a> href tag.
   *
   * @access     public
   * @param {string}   value   word to check if it has a link format.
   * @return {string}  `<a>${word}</a>`
   */
  renderLink(value) {
    // Validator
    let links = value.match(/\[\[(.*?)\]\]/g);

    if (!links) return value;

    // Loop through found links.
    for (const link of links) {
      if (link === '[[toc]]') continue;

      // Checks if link has a custom name through | division.
      let linkName = '';
      let linkDisplayName = '';
      if (link.includes('|')) {
        const rawSplit = link.split("|");
        linkName = rawSplit[0].trim().replace(/(\[|\])/g, '').toLowerCase();
        linkDisplayName = rawSplit[1].trim().replace(/(\[|\])/g, '');
      } else {
        linkName = link.trim().replace(/(\[|\])/g, '');
      }

      // Search Directly
      let linkNameLowered = linkName.toLowerCase().replace(/\s/g, '-');
      if (this.dir.hasOwnProperty(linkNameLowered)) {
        let dirItem = this.dir[linkNameLowered];
        let name = dirItem.title;
        if (linkDisplayName !== '') {
          name = linkDisplayName;
        }
        value = value.replace(link, `<a class="btn btn-secondary btn--link" onclick="root.gotoPage('${linkNameLowered}')">${name}</a>`);
        continue;
      }

      let loweredlinkname = linkName.toLowerCase();

      // Search Indirectly
      for (const pageName in this.dir) {
        let dirItem = this.dir[pageName];
        if (dirItem.title.toLowerCase() === loweredlinkname) {
          let name = dirItem.title;
          if (linkDisplayName !== '') {
            name = linkDisplayName;
          }
          value = value.replace(link, `<a class="btn btn-secondary btn--link" onclick="root.gotoPage('${linkNameLowered}')">${name}</a>`);
          break;
        }
      }

      // Considers link as nonexistent and turns it red.
      let name = '';
      if (linkDisplayName !== '') {
        name = linkDisplayName;
      } else {
        name = link.replace(/\]/g, '').replace(/\[/g, '').trim();
      }
      value = value.replace(link, `<a class="btn btn-secondary btn--link red" onclick="root.gotoPage('${linkNameLowered}')">${name}</a>`);

    }
    return value;
  }

  /**
   * Render Bold Words.
   *
   * Renders words containing ** {word} ** and turns it into a
   * bold html tag.
   *
   * @access     public
   * @param {string}   value   word to check if it has a bold format.
   * @return {string}  `<b>${word}</b>`
   */
  renderWordBold(value) {
    const bold_words = value.match(/\*\*(.*?)\*\*/g);
    const bold_words2 = value.match(/\_\_(.*?)\_\_/g);
    if (bold_words) {
      for (const word of bold_words) {
        value = value.replace(word, `<b>${word.replace(/\*/g, "").trim()}</b>`);
      }
    }
    if (bold_words2) {
      for (const word of bold_words2) {
        value = value.replace(word, `<b>${word.replace(/\_/g, "").trim()}</b>`);
      }
    }
    return value;
  }

  /**
   * Render Italic Words.
   *
   * Renders words containing * {word} * and turns it into an
   * italicized html tag.
   *
   * @access     public
   * @param {string}   value   word to check if it has a bold format.
   * @return {string}  `<b>${word}</b>`
   */
  renderWordItalic(value) {
    const italic_words = value.match(/\*(.*?)\*/g);
    if (italic_words) {
      for (const word of italic_words) {
        if (word == "**") continue;
        value = value.replace(word, `<i>${word.replace(/\*/g, "").trim()}</i>`);
      }
    }
    const italic_words2 = value.match(/\_(.*?)\_/g);
    if (italic_words2) {
      for (const word of italic_words2) {
        if (word == "**") continue;
        value = value.replace(word, `<i>${word.replace(/\_/g, "").trim()}</i>`);
      }
    }
    return value;
  }
}


/**
 * Generate Random String ID.
 *
 * Creates a randomly generated id string. it checks \[idList\] var
 * if the string already exists, if so, it regenerates it.
 *
 * @access     public
 * @param {int}   length   length of random id string
 * @return {string}  randomly generated id string
 */
function makeid(length) {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  while (true) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if (idList.includes(result)) continue;
    idList.push(result);
    return result;
  }
}