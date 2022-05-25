/*jshint esversion: 9 */

var areas = ['spoiler', 'nonspoiler'];
var pageName = '';
var pageUrlPath = '';
var idList = [];
var root;
var projectPath = '';
var urlpaths = [];

const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};


try {
  window.api.receive("fromMain", async(data) => {
    if (data.name == 'path') {
      if (projectPath != '') return;
      projectPath = data.value;
      console.log("Path: ", projectPath);
      return;
    }

    if (data.name == 'done-saving') {
      console.log('Rerendering');
      await root.rerenderPage();
      return;
    }

    if (data.name == 'urlpaths') {
      urlpaths = data.value;
      console.log(urlpaths);
      return;
    }

  });
} catch (error) {}


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

        isEmptyPage: false,

        rerenderData: {},
      };
    },
    methods: {
      areaToggleHandler(checked) {
        this.areaToggle = checked;
      },
      getPageUrl() {
        if (window.location.search) {
          let urlParams = new URLSearchParams(window.location.search);
          let url = urlParams.get('p').replace(/\s/g, "-");
          if (url) url.trim();
          return url;
        } else {
          return 'home';
        }
      },
      clearVars() {
        this.editorData = {};

        this.pageData = {};
        this.pageTitle = '';
        this.pageContents = {
          spoiler: [],
          nonspoiler: []
        };
      },
      isElectron() {
        const userAgent = navigator.userAgent.toLowerCase();
        // renderEditor(true);

        if (userAgent.indexOf(' electron/') == -1) {
          // Not electron
          console.log("Not on electron");
          return false;
        } else {
          // Electron
          return true;
        }
      },
      cloneObj(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
      capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      },
      updateProject() {
        if (!this.isElectron()) return;

        window.api.send('toMain', {
          name: 'project:update',
          path: projectPath,
        });

        alert('Updated Project to latest js/css/index!');
      },
      deletePage() {
        if (pageName === 'home') {
          alert('Home Page cannot be deleted');
          return;
        }

        if (!this.isElectron()) return;

        delete this.dir[pageName];

        // code to move file into trash bin

        window.api.send('toMain', {
          name: 'project:deletepage',
          data: { pageName: pageName, projectPath: projectPath }
        });

        console.log(pageName);

        this.readPage('home');

      },
      async newPage() {
        pageName = 'new-page';
        window.history.replaceState(null, null, `?p=new-page`);
        this.clearVars();
        await this.renderPage('pageNull', 'assets/new-page.html');
      },
      async readPage(pagename_, newPage = false) {
        pageName = pagename_.replace(/\s/g, '-').trim();
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
      async saveContent(data) {
        let isElectron = this.isElectron();
        if (isElectron) {

          window.api.send('toMain', {
            name: 'project:save',
            data: {
              content: data.contentData,
              pageData: this.cloneObj(data.pageData),
              profileData: this.cloneObj(data.profileData),
              pageName: data.pageData.name,
              pageUrl: data.pageData.urlPath,
              path: projectPath,
              isNewPage: this.isEmptyPage,
            }
          });

          this.dir[data.pageData.urlName] = {
            "title": data.pageData.title,
            "path": data.pageData.urlPath,
            "parent": data.pageData.parent,
          };
        }
        this.clearVars();
        // Rerender
        await this.$nextTick();


        this.rerenderData = data;
      },
      async rerenderPage() {
        this.clearVars();
        await this.renderPage('rerender', this.rerenderData);
      },
      async renderPage(mode, data) {
        // Step 3. Set Page General Data
        this.headerNavBtn = this.meta.headerNavigation;
        this.projectTitle = this.meta.projectTitle;
        this.projectSubtitle = this.meta.projectSubtitle;
        this.areaToggle = getSpoilerStorageValue();
        let pageRaw = '';
        let html = '';
        var pageFile;

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
            window.pageData.urlPath = this.dir[window.pageData.urlName].path;
            pageUrlPath = this.dir[window.pageData.urlName].path;

            this.isEmptyPage = false;
            break;

          case 'pageNull':
            pageFile = await fetch(data);
            html = (await pageFile.text()).replace('[[pageName]]', pageName);
            pageRaw = html.trim().split("<!-- File Content -->");

            // Step 5. Processing Window Variables
            loadScripts(pageRaw[0]);
            window.pageData.urlPath = 'content/' + pageName + '.html';
            pageUrlPath = 'content/' + pageName + '.html';
            window.pageData.title = this.capitalize(pageName.replace(/\-/g, " ")).trim();
            this.isEmptyPage = true;
            break;

          case 'rerender':
            window.profileData = data.profileData;
            window.pageData = data.pageData;
            window.pageData.urlPath = this.dir[window.pageData.urlName].path;
            pageUrlPath = this.dir[window.pageData.urlName].path;

            this.isEmptyPage = false;
            break;
        }
        let pathSplit = window.pageData.urlPath.split("/");
        window.pageData.urlName = pathSplit[pathSplit.length - 1].split(".html")[0];

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
      }

    },
    computed: {
      isElectronCheck() {
        return this.isElectron();
      }
    },
    async mounted() {
      // Step 1. Retrieves Necessary Files
      const metaRes = await fetch(`.eternal/eternal.json`); // Get Metadata
      this.meta = await metaRes.json();

      const dirRes = await fetch(`.eternal/directory.json`); // Get Directory
      this.dir = await dirRes.json();

      // Step 2. Gets Page URL
      pageName = this.getPageUrl();

      await this.readPage(pageName);

      if (this.isElectron()) {
        window.api.send('toMain', {
          name: 'project:getcontentdirs',
          projectPath: projectPath,
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

function getSpoilerStorageValue() {
  if (localStorage.theSongOfEnderion_isSpoiler === 'true') return true;
  else return false;
}


/**
 * Parse HTML String.
 *
 * Parses an HTML string into a Node object.
 *
 * @access     public
 * @param {string}   html   html string.
 * @return {Node}  a node with the parsed html string.
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



function superTrim(text) {
  let content = text.trim().split("\n");
  let result = "";
  for (let con of content) {
    result += `${con.trim()}\n`;
  }
  return result;
}




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
    this.TOClist = {};
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
   */
  renderText(htmlContentString, area) {
    if (htmlContentString.includes("[[toc]]")) {
      this.renderTOC = true;
    }
    // let remove = html.match(/<\/div>([\s\S]*?)<div id="spoiler">/gm);
    // let htmlContentString = html.replace(remove[0], `</div>\n<div id="spoiler">`);
    const lines = htmlContentString.trim().split("\n");

    let htmlContent = '';
    let first = true;
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
          htmlContent += `<${h} id="${id}" class="h">${value_} <a href="#" class="arrow-up">↑</a></${h}>\n`;
          this.TOClist[value_] = { id: id, h: h.toUpperCase() };
        } else {
          htmlContent += `<${h} class="h">${value.replace(hres[0], "")}</${h}>\n`;
        }

        if (h == "h1") htmlContent += '<hr>\n';
        continue;
      }


      // Add Value
      if (first) {
        htmlContent += value + "\n";
        first = false;
      } else {
        htmlContent += value + "<br>\n";
      }
    }

    let toc = `
      <p class="font--small"><b>Table of Contents</b></p>
    `;

    for (const head in this.TOClist) {
      toc += `\n<a href="#${this.TOClist[head].id}" class="toc-${this.TOClist[head].h} btn-primary btn--color-tertiary">${head}</a><br>`;
    }

    htmlContent = htmlContent.replace("[[toc]]", `<div class="toc">${toc}</div>`);
    this.renderTOC = false;
    this.TOClist = {};
    return htmlContent;
  }

  renderLink(value) {
      let links = value.match(/\[\[(.*?)\]\]/g);

      if (!links) return value;

      for (const link of links) {
        if (link === '[[toc]]') continue;
        let linkName = link.trim().replace(/(\[|\])/g, '');

        // // Search Directly
        let linkNameLowered = linkName.toLowerCase().replace(/\s/g, '-');
        if (this.dir.hasOwnProperty(linkNameLowered)) {
          let dirItem = this.dir[linkNameLowered];

          value = value.replace(link, `<a class="btn btn-secondary btn--link" onclick="root.readPage('${linkNameLowered}')">${dirItem.title}</a>`);
          continue;
        }

        let loweredlinkname = linkName.toLowerCase();
        // // Search Indirectly
        for (const pageName in this.dir) {
          let dirItem = this.dir[pageName];
          if (dirItem.title.toLowerCase() === loweredlinkname) {
            value = value.replace(link, `<a class="btn btn-secondary btn--link" onclick="root.readPage('${linkNameLowered}')">${dirItem.title}</a>`);
            break;
          }
        }
        value = value.replace(link, `<a class="btn btn-secondary btn--link red" onclick="root.readPage('${linkNameLowered}')">${link.replace(/\]/g, '').replace(/\[/g, '').trim()}</a>`);

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
     * @return {string}  `<b>${content}</b>`
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
   * @return {string}  `<b>${content}</b>`
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