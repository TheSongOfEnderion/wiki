// Global Variables
var directory; // Obj containing directory.json
var idList = []; // List of randomly generated ids
var pageCard; // Contains the page card Class
var pageEditor;
var editorData; // Contains parsed data for the editor
var isEditorChanged = false;
var notificationGreen;
var notificationRed;
var tempProfilesData = {};

function renderPage() {
  isEditorChanged = false;
  let urlParams = new URLSearchParams(window.location.search);
  let inputUrl = urlParams.get('p').trim();

  // Renders Page
  pageCard = new Card()
  pageCard.renderFromHTML(inputUrl)
    .then(() => {
      notificationGreen = window.createNotification({
        theme: 'success'
      });

      notificationRed = window.createNotification({
        theme: 'error'
      });

      // Renders Editor
      pageEditor = new PageEditor(pageCard)
      pageEditor.loadEditor()
        .then(() => {

          // Others
          // document.getElementById('modalbtn').click();
          // document.getElementById('editorAreaBtns').getElementsByTagName('button')[1].click()
          isEditorChanged = false;
          tempProfilesData = {};
        })
    })
}

function printIDList() {
  console.log(idList);
}

// Functions
/**
 * Notification Pop-Up.
 *
 * Shows a pop-up screen to notify the user.
 *
 * @access     public
 * @param {string}   type  "success" (green) or "error" (red).
 * @param {string}   title  title string of the pop-up.
 * @param {string}   message  message string of the pop-up.
 */
function notify(type, title, message) {
  switch (type) {
    case "success":
      notificationGreen({
        title: title,
        message: message
      });
      return;
    case "error":
      notificationRed({
        title: title,
        message: message
      });
      return;
    default:
      break;
  }
}

/**
 * Get Asset from .eternal/ folder.
 *
 * Returns a promise that gives the string data of the file.
 *
 * @access     public
 * @param {string}   filename  name of asset inside the .eternal/
 * @return {string}  Returns a promise with the string data.
 */
function getAsset(filename) {
  let raw = filename.split(".");
  const filetype = raw[raw.length - 1];

  switch (filetype) {
    case 'html':
      return fetch(`.eternal/assets/${filename}`)
        .then(response => response.text())
        .then(data => {
          return data;
        })
    case 'json':
      return fetch(`.eternal/${filename}`)
        .then(response => response.json())
        .then(data => {
          return data;
        })
    default:
      break;
  }
}

/**
 * Get HTML Page.
 *
 * Fetches the html file with its fileURL.
 *
 * @access     public
 * @param {string}   fileUrl   url of the html page.
 * @return {string}  the html file string. null if not found.
 */
function getPage(fileUrl) {
  return fetch(fileUrl)
    .then(async response => {
      const resp = await response.text();
      const validation = resp.toLowerCase();
      if (validation.includes("cannot get") || validation.includes("file not found")) {
        return null;
      }
      return resp;
    })
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
 * Checks if Object is Empty or not.
 *
 * Uses typeof and key check to validate whether the object.
 * is null or has no keys.
 *
 * @access     public
 * @param {Object}   object   object var to check.
 * @return {boolean}  true if object is empty. false if not empty.
 */
function isObjEmpty(object) {
  if (typeof object !== 'undefined' && Object.keys(object).length != 0) {
    return false;
  }
  return true;
}

/**
 * Is variable an Object?
 *
 * Checks whether the variable is an object or not
 *
 * @access     public
 * @param {any}   obj  variable to check
 * @return {boolean}  true - vars is an Object. false - not.
 */
function isObj(obj) {
  if (typeof obj === 'object') return true
  return false
}

/**
 * Insert after node
 *
 * Inserts a node right next to reference node.
 *
 * @access     public
 * @param {Node}   newNode  node obj to insert,
 * @param {Node}   referenceNode  node obj to insert next to.
 */
function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
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
    if (idList.includes(result)) continue
    idList.push(result)
    return result;
  }
}

/**
 * Open Tab.
 *
 * Opens the tab of a tabview item.
 *
 * @access     public
 * @param {Node}   btn   the btn node of the particular tab. i.e. (this).
 * @param {string}   tabId   id of tab containing the contents.
 * @param {string}   contentGroupClass   class name of the tabview content group.
 * @param {string}   btnGroupId   id name of the tabview button group.
 */
function openTab(btn, tabId, contentGroupClass, btnGroupId) {
  var tabs = document.getElementsByClassName(contentGroupClass);

  // Removes Active Class on other Tabs
  for (const tab of tabs) {
    tab.style.display = "none"
  }

  let btngroup = document.getElementById(btnGroupId).getElementsByTagName('button')
  for (const gbtn of btngroup) {
    if (gbtn == btn) continue
    if (!gbtn.classList.contains("tab-active")) continue
    gbtn.classList.remove("tab-active")
  }

  // Adds Active Class on Current Tab
  let tab_content = document.getElementById(tabId)
  tab_content.style.display = "block"

  btn.classList.add("tab-active")
}




/**
 * Create Tabs.
 *
 * Creates a Tabview.
 *
 * @access     public
 * @param {string}   btnGroupId  string ID of the tabview button group.
 * @param {Object}   tabIdsObj  object containing tab data {id, name}
 */
function createTabs(btnGroupId, tabIdsObj) {

  const content_group_class = makeid(7)
  const btn_group_id = makeid(7)

  const div = document.getElementById(btnGroupId)
  const btn_div = document.createElement("div")
  btn_div.id = btn_group_id

  let first = true
  for (const idObj of tabIdsObj) {
    const elem = document.getElementById(idObj.id)
    if (!elem) continue
    elem.classList.add(content_group_class)
    elem.style.display = "none"

    const btn = document.createElement("button")
    btn.innerText = idObj.name
    btn.setAttribute("onclick", `openTab(this, '${idObj.id}', '${content_group_class}', '${btn_group_id}')`)
    btn.classList.add("btn", "profile-image-btn")

    if (first == true) {
      btn.classList.add("tab-active")
      elem.style.display = "block"
      first = false
    }

    btn_div.appendChild(btn)
  }
  div.appendChild(btn_div)
}

/**
 * Open Editor Modal
 *
 * Opens the modal, specifically the editor.
 *
 * @access     public
 * @param {string}   modalID   the id of the modal div
 * @param {boolean}   renderPageAgain   true - renders the page. false- don't.
 */
function openModal(modalID, renderPageAgain = false) {
  if (renderPageAgain && isEditorChanged) {
    renderPage()
  }

  let modal = document.getElementById(modalID)
  modal.classList.toggle('modal-visible')
    // Hide scrollbar
  document.getElementsByTagName("body")[0].classList.toggle("disable-srolling")
  document.getElementsByTagName("html")[0].classList.toggle("disable-srolling")

  // Exits modal if clicked outsie
  if (modal.onclick != null) return;
  modal.onclick = (event) => {
    if (event.target == modal) {
      modal.classList.remove('modal-visible')
        // Reveal Scrollbar
      document.getElementsByTagName("body")[0].classList.remove("disable-srolling")
      document.getElementsByTagName("html")[0].classList.remove("disable-srolling")
    }
  }

}

function toggleSpoilers() {
  if (document.getElementById("spoiler").style.display == "none") {
    setSpoilersVisibility(true);
  } else {
    setSpoilersVisibility(false);
  }
}

/**
 * Set Spoilers Visibility.
 *
 * Sets the spoilers visibility and saves the false/true value in
 * `localStorage["theSongOfEnderion_isSpoiler"]`
 *
 * @access     public
 * @param {boolean}   isVisible   true - visible spoiler area. false - not.
 */
function setSpoilersVisibility(isVisible) {
  let spoiler_div = document.getElementById("spoiler");
  let non_spoiler_div = document.getElementById("nonspoiler");

  spoiler_div.style.display = (isVisible == true) ? "block" : 'none';
  non_spoiler_div.style.display = (isVisible == true) ? "none" : 'block';
  localStorage["theSongOfEnderion_isSpoiler"] = isVisible;
  document.getElementById('spoilerTooltipTexts').innerText = (isVisible == true) ? "Hide Spoilers" : "Show Spoilers";
}


class TextRenderer {
  constructor() {
    this.headerConvertionTable = {
      '# ': 'h1',
      '## ': 'h2',
      '### ': 'h3',
      '#### ': 'h4',
      '##### ': 'h5',
      '###### ': 'h6',
    };
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
  renderText(htmlContentString) {
    const lines = htmlContentString.split("\n");
    let htmlContent = '';

    for (const line of lines) {
      let value = line.trim();

      // Formats
      value = this.renderWordBold(value);
      value = this.renderWordItalic(value);

      // List
      if (value.startsWith("* ")) {
        htmlContent += `<li>${value.replace("* ", "").trim()}</li>\n`;
        continue;
      }
      // <div class="mb-4">\n</div>
      // Headers
      const hres = value.match(/(#+)\s/);
      if (hres) {
        let h = this.headerConvertionTable[hres[0]];
        htmlContent += `<${h} class="h">${value.replace(hres[0], "")}</${h}>\n`;
        if (h == "h1") htmlContent += '<hr>\n';
        continue;
      }
      if (value == "</div>" || value.match(/\<div(.+?)\>/)) {
        htmlContent += value;
        continue;
      }
      htmlContent += value + '<p class="space"></p>\n';
    }
    return htmlContent;
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
    if (bold_words) {
      for (const word of bold_words) {
        value = value.replace(word, `<b>${word.replace(/\*/g, "").trim()}</b>`);
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
    return value;
  }

}

// Class
class Card {

  async renderFromHTML(inputUrl) {
    let htmlData = await this.findFileData(inputUrl);
    if (!htmlData) return;
    await this.renderPage(htmlData)
  }

  /**
   * Render Page.
   *
   * An async function which renders the entire body card
   * contents.
   *
   * @access     public
   * @param {string}   htmlData   raw html string data.
   * @param {boolean}  readScripts whether to read the scrips or not.
   */
  async renderPage(htmlData, readScripts = true) {

    // Loads the Page and Renders Data
    await this.loadPage(htmlData, readScripts);

    // Create Table of Content
    this.createTOC();

    // Create Profile Box
    this.createProfileBox();

    // Create Spoiler Tab Division
    this.createSpoiler();

    // Create Page Tabs
    this.createPageTabs();
  }

  /**
   * Load HTML Page.
   *
   * This takes a plain text HTML file and parses it 
   * into the div#page-content.
   *
   * @access     public
   * @see  TextRenderer 
   * @param {string}   htmlData   A string of the html file.
   */
  async loadPage(htmlData, readScripts) {
    // Variables

    idList = []

    // Parses the data into a node
    const splitData = htmlData.split('<!-- File Content -->');

    if (readScripts) {
      // Loads the Scripts
      this.loadScripts(splitData[0]);
    }

    // Loads File Content
    const contentData = splitData[1].trim();
    const rt = new TextRenderer();

    // Save data for editor
    this.saveEditorData(contentData);

    // Set Page data
    let pageContent = document.getElementById('page-content');
    pageContent.innerHTML = rt.renderText(contentData);

    this.setTitle(pageData.title)
    this.setTags(pageData.tags)
    this.setBreadCrumbs(pageData.parent)
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
  loadScripts(scriptData) {
    let parsedData = parseHTML(scriptData);

    let scripts = parsedData.querySelectorAll("script");
    for (let script of scripts) {
      if (script.innerText) {
        eval(script.innerText);
      } else if (script.src) {
        fetch(script.src).then(data => {
          data.text().then(r => {
            eval(r);
          })
        });
      }
      // To not repeat the element
      script.parentNode.removeChild(script);
    }
  }

  /**
   * Find the location of the url html.
   *
   * Gets the urlstring from the ?p=url-string and searches the
   * directory obj if the url exist. If so, opens the actual url
   * path and loads the html into a string value and returns it.
   *
   * @access     private
   * @param {string}   inputUrl  e.g. ethan-morales
   * @return {string}  A string of the html file.
   */
  async findFileData(inputUrl) {
    // Finds Page data
    for (const pageUrl in directory) {
      if (pageUrl == inputUrl) {
        let result = await getPage(directory[inputUrl]["url"])
        return result;
      }
    }
    document.getElementById('page-content').innerHTML = `Page does not exists. Create <a href=""> ${inputUrl}</a>?`;
    return false;
  }

  /**
   * Saves Editor Data.
   *
   * Gets the file content str without the file data script
   * and replaces the \n\n with a <p> tag to preserve new lines
   * then splits it to individual line to remove any spaces.
   * It then saves it to global variable "editorData".
   *
   * @access     private
   * @param {string}   contentData  athe file content
   */
  saveEditorData(contentData) {
    let editorLineData = "";
    for (let line of contentData.replace("\n\n", '<p></p>').split("\n")) {
      editorLineData += line.trim() + "\n";
    }

    editorData = parseHTML(editorLineData);
  }

  /**
   * Create Table of Contents.
   *
   * Replaces the [[toc]] with a table of content linking
   * to all the headers.
   *
   * @access     private
   */
  createTOC() {
    const divs = document.getElementsByClassName("page-tab");
    for (const contdiv of divs) {

      let divText = contdiv.innerHTML.trim();

      if (divText == '') continue;
      if (!divText.includes("[[toc]]")) continue;

      let headers = contdiv.getElementsByClassName("h");
      let toc = `<div class="toc"><p><b>Table of Contents</b></p>`;
      let alreadyDone = false;
      for (const head of headers) {

        // Add ID
        if (head.id != '') {
          alreadyDone = true;
          break;
        }

        head.id = head.textContent.replace(" ", "_").toLocaleLowerCase() + "-" + makeid(8);

        // Create links
        toc += `<a href="#${head.id}" class="toc-${head.tagName}">${head.innerText}</a><br>\n`;

        // Add Arrow Up
        head.insertAdjacentHTML('beforeend', `<a href="#" class="arrow-up">↑</a>`);
      }

      if (alreadyDone) continue;
      contdiv.innerHTML = contdiv.innerHTML.replace("[[toc]]", toc + '</div>\n');
    }
  }

  /**
   * Create Profile Box.
   *
   * Parses the [profileData] variable and inserts a div on the
   * very top of parent divs where the profile box is created.
   *
   * @access     private
   */
  createProfileBox() {
    // Validation Check
    if (!pageData.functions.hasOwnProperty('createProfileBox') && pageData.functions.createProfileBox != true) return;
    if (isObjEmpty(profileData)) return;

    for (const pageTabId in profileData) {
      if (pageData.disabledProfileData.includes(pageTabId)) continue;
      let divToPlaceProfileBoxIn = document.getElementById(pageTabId);
      if (!divToPlaceProfileBoxIn) continue;
      const profle_obj = profileData[pageTabId];
      const div = document.createElement('div');
      div.id = pageTabId + "-profilebox";

      // Validation
      if (div == null) {
        alert(`Profile Box Error: The div with "${profile_id}" id is missing`);
        return;
      }
      div.classList.add("float-end", "profile-box");

      // Create Title
      div.insertAdjacentHTML('beforeend', `<span class="profile-title bold">${profle_obj['Title']}</span>`);

      // Create Image Tabs
      if (profle_obj.hasOwnProperty('Image')) {

        // Create ids
        let btn_group_id = div.id + "-" + makeid(8);
        let btn_content_id = makeid(8);

        let image_ids = {};

        // Create Button Group
        let btn_group = document.createElement('div');
        btn_group.id = btn_group_id;

        div.appendChild(btn_group);

        // Create Buttons and Images
        let first = true;
        for (const image in profle_obj['Image']) {

          // Create Buttons
          image_ids[image] = image.replace(" ", "_").toLocaleLowerCase() + "-" + makeid(8);

          let btn_tab = document.createElement("button");
          btn_tab.classList.add("btn", "profile-image-btn");
          btn_tab.innerText = image;
          btn_tab.setAttribute("onclick", `openTab(this, '${image_ids[image]}', '${btn_content_id}', '${btn_group_id}')`);

          btn_group.appendChild(btn_tab);


          // Add active status if first one
          let display_style = "none";
          if (first) {
            btn_tab.classList.add("tab-active");
            display_style = "block";
            first = false;
          }

          // Create Image Div
          div.insertAdjacentHTML('beforeend', `
                <div id="${image_ids[image]}" class="green-box profile-image ${btn_content_id}" style="display: ${display_style};">
                  <img src="${profle_obj['Image'][image]}" class="img-fluid mx-auto d-block" alt="...">
                </div>`);
        }
      }

      // Create Table
      const table = document.createElement("table");
      table.id = "profile-table";
      table.classList.add("table");

      const tbody = document.createElement("tbody");

      for (const category_ in profle_obj['Content']) {
        let category = category_.trim()
        if (!isObj(profle_obj['Content'][category])) continue

        // Category Name
        if (category.toLowerCase() != "desc") {
          tbody.insertAdjacentHTML('beforeend', `<tr><td class="bold profile-category" colspan="2">${category}</td></tr>`)
        }

        // Category Row-Cell values
        for (const cellName in profle_obj['Content'][category]) {
          let cellValue = profle_obj['Content'][category][cellName];

          // Validation Check
          if (!Array.isArray(cellValue) && isObj(cellValue)) continuel
          if (category == "Image") continue;

          // Cell Content
          let cellContent = ''

          // Checks if value contains a list
          if (Array.isArray(cellValue)) {
            for (const item of cellValue) {
              if (isObj(item)) continue
              if (isNaN(item) && item.includes("|")) {
                let rawSplit = item.split("|");
                cellContent = `• <a href=${rawSplit[1]}>${rawSplit[0]}</a> <br>`;
                continue
              }
              cellContent += `• ${item} <br>`;

            }
          } else {
            if (isNaN(cellValue) && cellValue.includes("|")) {
              let rawSplit = item.split("|");
              cellContent = `<a href=${rawSplit[1]}>${rawSplit[0]}</a>`;
            } else {
              cellContent = cellValue;
            }
          }

          // Add to Table
          tbody.insertAdjacentHTML('beforeend', `
          <tr>
            <td class="bold profile-cell" style="width: 35%;">${cellName}</td>
            <td class="profile-cell">${cellContent}</td>
          </tr>
          `)
        }

      }

      // Add to Page
      table.appendChild(tbody);
      div.appendChild(table);

      let parentDiv = document.createElement("div")
      parentDiv.classList.add("profile-box-parent")
      parentDiv.appendChild(div)

      divToPlaceProfileBoxIn.prepend(parentDiv);
    }
  }

  /**
   * Create Spoiler Divs.
   *
   * Takes the 'spoiler' and 'nonspoiler' div in the html file
   * and places them in two tabs. It also creates a spoiler
   * switch button.
   *
   * @access     private
   */
  createSpoiler() {
    if (!pageData.functions.hasOwnProperty('createSpoilers') && pageData.functions.createSpoilers != true) {
      // Hides spoiler div if createSpoilers is not enabled
      let spoilerDiv = document.getElementById('spoiler');
      if (spoilerDiv) spoilerDiv.style.display = "none";
      return;
    }

    const spoilerDiv = document.getElementById("spoiler-button");
    spoilerDiv.classList.add("float-end", "tooltipStyle");
    spoilerDiv.innerHTML = `
    
      <label class="switch" >
        <input type="checkbox" onclick="toggleSpoilers()" id="spoilerBoxInputPage">
        <span class="slider round"></span>
      </label>
      <span class="tooltipStyletext" id="spoilerTooltipTexts">Show Spoilers</span>`;


    if (localStorage["theSongOfEnderion_isSpoiler"] == 'true') {
      spoilerDiv.getElementsByTagName('input')[0].checked = true;
      setSpoilersVisibility(true)
    } else {
      setSpoilersVisibility(false)
    }
  }

  /**
   * Create Page Tabs.
   *
   * Using the pageData.fileStructure, turns divs with 'page-tab'
   * class into separate tabs.
   *
   * @access     private
   */
  createPageTabs() {
    if (isObjEmpty(pageData.fileStructure)) return

    for (const area in pageData.fileStructure) {
      if (isObjEmpty(pageData.fileStructure[area])) continue
      let div = document.getElementById(area)

      let btn = document.createElement('div')
      btn.id = area + "-page-tab-button-" + makeid(5)
      div.prepend(btn)

      let tabsObj = []

      for (const tabId in pageData.fileStructure[area]) {
        tabsObj.push({ name: pageData.fileStructure[area][tabId], id: tabId })
      }
      if (tabsObj.length == 1) {
        btn.style.display = "none";
      }
      createTabs(btn.id, tabsObj)
    }
  }

  /**
   * Set Card Title
   *
   * Change the card title.
   *
   * @access     public
   * @param {string}   name   new name of the card.
   */
  setTitle(name) {
    document.getElementById('page-title').getElementsByTagName('h1')[0].innerText = name;
  }

  /**
   * Set Tags
   *
   * Changes the bottom tags of the body-card.
   * Example entry: "tboah human orc hunter"
   *
   * @access     public
   * @param {string}   tags   strings of tags separated by comma.
   */
  setTags(tags) {
    // Step 1. Validation. Checks if [tags] is empty
    if (!tags) {
      document.getElementById('page-tags').style.display = 'none';
      return
    }

    // Step 2. Process tags
    let tagsHTML = '';
    for (const tag of tags.trim().split(" ")) {
      tagsHTML += `<a href="#" _target="blank">${tag}</a> `;
    }

    // Step 3. Insert tags
    let tagsDiv = document.getElementById('page-tags');
    tagsDiv.innerHTML = tagsHTML;
    tagsDiv.style.display = 'block';
  }

  /**
   * Set BreadCrumbs
   *
   * Gets the breadcrumbs of the parent if there is one
   * and forms a chain of crumbs.
   *
   * @access     public
   * @param {string}   crumbs   parent page name.
   */
  setBreadCrumbs(crumbs) {
    // Step 1. Validation. Checks if [crumbs] is empty
    let crumbDiv = document.getElementById("page-breadcrumbs");
    if (!crumbs) {
      crumbDiv.style.display = "none";
      return
    }

    // Step 2. Insert crumbs. Floating status. Will Change
    //         on electron port.
    crumbDiv.style.display = "block";
    crumbDiv.innerText = crumbs;
  }

  /**
   * Set Spoilers Status
   *
   * Whether the spoiler area is enabled or disabled.
   *
   * @access     public
   * @param {boolean}   isVisible   true - enabled. false - disabled.
   */
  setSpoilersStatus(isVisible) {
    pageData.functions.createSpoilers = isVisible;
    let checkbox = document.getElementById('spoilerBoxInputPage');
    checkbox.checked = isVisible;
    setSpoilersVisibility(isVisible);
    document.getElementById('spoiler-button').style.display = (isVisible == true) ? "block" : "none";
  }

  /**
   * Rename tab in Manage Tabs.
   *
   * Renames the tab while keeping the order.
   *
   * @access     public
   * @param {boolean}   isVisible   true - enabled. false - disabled.
   */
  renameTab(area, oldTabId, newTab) {
    let fskeys = Object.keys(pageData.fileStructure[area]);
    let index = fskeys.indexOf(oldTabId)

    fskeys.splice(index, 1);

    let keyValues = Object.entries(pageData.fileStructure[area]); //convert object to keyValues ["key1", "value1"] ["key2", "value2"]
    keyValues.splice(index, 1);

    keyValues.splice(index, 0, [newTab.id, newTab.name]); // insert key value at the index you want like 1.
    pageData.fileStructure[area] = Object.fromEntries(keyValues) // convert key values to obj {key1: "value1", newKey: "newValue", key2: "value2"}

    if (profileData.hasOwnProperty(oldTabId)) {
      let x = profileData[oldTabId];
      delete profileData[oldTabId];

      profileData[newTab.id] = x;
      console.log(profileData);
    }
  }

  /**
   * Remove tab in Manage Tabs.
   *
   * Removes a tab in the filestructure, but the data
   * remains hidden in the file.
   *
   * @access     public
   * @param {string}   area   'spoiler' or 'nonspoiler'
   * @param {string}   tabID   id of the tab.
   */
  removeTab(area, tabID) {
    delete pageData.fileStructure[area][tabID];
  }

  /**
   * Add tab in Manage Tabs.
   *
   * Adds new tab.
   *
   * @access     public
   * @param {string}   area   'spoiler' or 'nonspoiler'
   * @param {string}   tabID   id of the tab.
   * @param {string}   tabName   name of the tab.
   */
  addTab(area, tabID, tabName) {
    pageData.fileStructure[area][tabID] = tabName;

    let tabDiv = document.createElement('div');
    tabDiv.id = tabID;
    tabDiv.classList.add("page-tab");

    editorData.getElementById(area).appendChild(tabDiv);
    console.log(tabID + " " + tabName);
  }
}

class PageEditor {
  constructor(card) {
    this.card = card;
    this.filestructure = {};;

    this.editorAreaIDs = [
      "editorContentDiv",
      "editorProfileBox",
      "editorManageTabs",
    ];

    // Manage tab
    this.manageTabSelected;
    this.profileTabSelected;
    this.profileEditor;
  }

  loadEditor() {
    return getAsset('editor.html')
      .then(data => {
        document.getElementById('page-editor').innerHTML = data;
        // document.getElementById('page-editor').insertAdjacentHTML('beforeend', `<button id="modalbtn" onclick="openModal('editor-modal')">open modal</button>`);

        // Create Spoiler and nonspoiler Tabs
        createTabs('editor-content-spoiler-tab-btns', [{
          name: 'NON-SPOILER CONTENT',
          id: 'editor-nonspoiler'
        }, {
          name: 'SPOILER CONTENT',
          id: 'editor-spoiler'
        }]);
        this.showSpoilers();

        // Create the Content Area
        // let pageData = pageData;

        // Spoiler Switch
        if (pageData.functions.hasOwnProperty('createSpoilers') && pageData.functions.createSpoilers == true) {
          document.getElementById('editorSpoilerCheck').checked = true
          this.showSpoilers()
        }

        // Content Areas
        this.generateTextArea('spoiler');
        this.generateTextArea('nonspoiler');

        // Meta Area
        document.getElementById('editorPageTitle').value = pageData.title
        document.getElementById('editorParent').value = pageData.parent
        document.getElementById('editorTags').value = pageData.tags

        // Manage Tabs Area
        this.generateTabArea('managetab');
        this.generateTabArea('profilebox');

        // Create Profile 
        this.profileEditor = new ProfileEditor(this.profileTabSelected.value);
      })
  }

  saveEditor() {

    // Save Profile Data
    Object.assign(profileData, tempProfilesData);
    
    // Save Content
    let htmlContent = '<!-- File Content -->\n\n';

    for (const area in this.filestructure) {
      let innerValue = ''

      for (const tab in this.filestructure[area]) {
        let tabValue = document.getElementById(tab).value;
        innerValue += `\n<div id="${this.filestructure[area][tab].htmlId}" class="page-tab">\n${tabValue}\n</div>\n`;
      }
      htmlContent += `<div id="${area}">${innerValue}</div>\n`;
    }

    this.card.renderPage(htmlContent, false)
      .then(() => {
        // Save Metadata
        this.card.setTitle(document.getElementById('editorPageTitle').value);
        this.card.setTags(document.getElementById('editorTags').value);
        this.card.setBreadCrumbs(document.getElementById('editorParent').value);
        this.card.setSpoilersStatus(document.getElementById('editorSpoilerCheck').checked);

        notify("success", "Successful Save", "Page has been re-rendered.");
        isEditorChanged = false;
        tempProfilesData = {};
      })
  }

  generateMDEditor(textarea, initialValue) {
    return new EasyMDE({
      element: textarea,
      initialValue: initialValue,
      autofocus: true,
      hideIcons: [
        "guide",
        "side-by-side",
        "preview"
      ],
      forceSync: true,
    });
  }

  generateTextArea(area) {
    if (!pageData.fileStructure.hasOwnProperty(area)) return;

    this.filestructure[area] = {};

    let contentArea = document.getElementById(`editor-${area}-content-tab`);
    contentArea.innerHTML = '';

    let btnArea = document.getElementById(`editor-${area}-tab-btns`);
    btnArea.innerHTML = '';

    let tabs = [];

    for (const tab in pageData.fileStructure[area]) {
      // Create Div to put MD
      let textdiv = document.createElement('div');
      textdiv.id = tab + "-editordiv-" + makeid(4);

      // Create Textarea
      let textarea = document.createElement("textarea");
      textarea.id = tab + "-editor";

      // Append div
      textdiv.appendChild(textarea);
      contentArea.appendChild(textdiv);

      // Create Markdown
      let md = this.generateMDEditor(textarea,
        editorData.getElementById(tab).innerHTML.trim());
      // Add Tab to button
      md.onchange = this.editorModified();
      tabs.push({
        name: pageData.fileStructure[area][tab],
        id: textdiv.id
      });

      this.filestructure[area][textarea.id] = {
        htmlName: pageData.fileStructure[area][tab],
        htmlId: tab,
      }
    }

    createTabs(`editor-${area}-tab-btns`, tabs);
  }

  generateTabId(area, name) {
    let id = `${area}-${name}`;

    if (idList.includes(id)) {
      id += "-" + makeid(4);
    }
    idList.push(id);
    return id;
  }

  generateTabArea(location) {
    for (const area of['spoiler', 'nonspoiler']) {
      let selectGroup = document.getElementById(`${location}-${area}-list`);
      selectGroup.innerHTML = '';
      let first = true;
      for (const tab in pageData.fileStructure[area]) {
        let optionId = tab;
        idList.push(optionId);
        if (first) {
          if (profileData.hasOwnProperty(optionId)) {
            document.getElementById('editorProfileBoxCheck').checked = true;
          }
          selectGroup.insertAdjacentHTML('beforeend', `<option value="${optionId}" selected="selected">${pageData.fileStructure[area][tab]}</option>`);
          first = false;
          continue;
        }
        selectGroup.insertAdjacentHTML('beforeend', `<option value="${optionId}">${pageData.fileStructure[area][tab]}</option>`);
      }

      if (area === 'nonspoiler') {
        switch (location) {
          case 'managetab':
            this.manageTabSelected = selectGroup.childNodes[0];
            break;
          default:
            this.profileTabSelected = selectGroup.childNodes[0];
            break;
        }
      }
    }

  }
  switchEditorArea(targetBtn, targetId) {
    let btns = document.getElementById('editorAreaBtns').getElementsByTagName('button');

    // Clear Buttons
    for (const btn of btns) {
      if (btn == targetBtn) {
        targetBtn.classList.add('btn-active');
        continue;
      }
      btn.classList.remove('btn-active');
    }

    // Clear Area Div
    for (const areaID of this.editorAreaIDs) {
      if (areaID == targetId) {
        document.getElementById(areaID).classList.remove('hide');
        continue
      }
      document.getElementById(areaID).classList.add('hide');
    }
  }

  showSpoilers() {
    const btns = document.getElementById('editor-content-spoiler-tab-btns');
    if (btns.style.display == "none") {
      btns.style.display = "block";
      document.getElementById('editor-nonspoiler').style.display = "block";
      document.getElementById('editor-spoiler').style.display = "none";
    } else {
      btns.style.display = "none";
      btns.getElementsByTagName('Button')[0].click();
      document.getElementById('editor-spoiler').style.display = "none";
    }
  }


  tabUp() {
    let list = document.getElementById('managetab-contentarea-list');
  }

  tabGetSelectedArea() {
    if (typeof this.manageTabSelected == 'undefined') return;
    return this.manageTabSelected.parentNode.id.split("-")[1];
  }
  tabSelectedOption(sel) {
    this.manageTabSelected = sel.options[sel.selectedIndex];
    console.log(this.manageTabSelected);
    document.getElementById('tabReNameInput').value = this.manageTabSelected.innerText;
  }

  tabClear(inputId) {
    document.getElementById(inputId).value = '';
  }

  tabRename() {
    if (typeof this.manageTabSelected == 'undefined') return;
    let newName = document.getElementById('tabReNameInput').value;

    // Checks if no change in name
    if (newName == this.manageTabSelected.innerText) return;

    // Whether its a spoiler or nonspoiler area
    let area = this.tabGetSelectedArea();

    // Save old data
    let oldTabId = this.manageTabSelected.value;

    // Set New data
    this.manageTabSelected.innerText = newName;
    this.manageTabSelected.value = this.manageTabSelected.value.split("-")[0] + "-" + newName.toLocaleLowerCase();

    // Save New Data
    let newData = {
      id: this.manageTabSelected.value,
      name: this.manageTabSelected.innerText,
    };

    // Set Card Tabs
    this.card.renameTab(area, oldTabId, newData);

    // Edit editorData
    editorData.getElementById(oldTabId).id = newData.id;

    // Content Areas
    this.generateTextArea(area);
    this.generateTabArea('profilebox');
    notify("success", "Successfully Renamed", "");
    this.editorModified();
  }

  tabRemove() {
    if (typeof this.manageTabSelected == 'undefined') return;
    let area = this.tabGetSelectedArea();

    if (Object.keys(pageData.fileStructure[area]).length == 1) {
      notify("error", "Removal Failed", "Content Area must have atleast one textarea.")
      return;
    }

    let areaList = document.getElementById(`managetab-${area}-list`);
    areaList.removeChild(this.manageTabSelected);

    this.tabClear('tabReNameInput');

    this.card.removeTab(area, this.manageTabSelected.value);
    this.generateTextArea(area);
    this.generateTabArea('profilebox');
    this.editorModified();

    this.manageTabSelected = undefined;

    notify('success', 'Removal Successful', 'Tab removed. But content remains hidden.');
  }

  tabAdd() {
    let area = document.querySelector('input[name="contentAreaRadio"]:checked').value;
    let tabName = document.getElementById('tabNewNameInput').value;
    let tabId = this.generateTabId(area, tabName);

    // Add to boxlist
    let areaList = document.getElementById(`managetab-${area}-list`);
    areaList.insertAdjacentHTML('beforeend', `<option value="${tabId}">${tabName}</option>`);

    this.card.addTab(area, tabId, tabName);
    this.generateTextArea(area);
    this.generateTabArea('profilebox');
    this.editorModified();

    notify('success', 'Add Successful', 'New tab added');
  }

  editorModified() {
    if (isEditorChanged) return;
    isEditorChanged = true;
  }

  profileRemoveDisable(profileId) {
    if (!pageData.disabledProfileData.includes(profileId)) return;
    let index = pageData.disabledProfileData.indexOf(profileId);
    pageData.disabledProfileData.splice(index, 1);
  }

  profileSelectedOption(sel) {
    this.profileTabSelected = sel.options[sel.selectedIndex];
    let check = document.getElementById('editorProfileBoxCheck');

    if (profileData.hasOwnProperty(this.profileTabSelected.value)) {
      this.profileEditor.setData(profileData[this.profileTabSelected.value]);
      this.profileEditor.expand();
      check.checked = true;
    } else if (tempProfilesData.hasOwnProperty(this.profileTabSelected.value)) {
      this.profileEditor.setData(tempProfilesData[this.profileTabSelected.value]);
      this.profileEditor.expand();
      check.checked = true;
    } else {
      this.profileEditor.setData({});
      check.checked = false;
    }
    this.editorModified();
  }

  profileEnable(check) {
    this.editorModified();
    let profileId = this.profileTabSelected.value;
    if (check.checked && profileData.hasOwnProperty(profileId)) {
      this.profileEditor.setData(profileData[profileId]);
      this.profileRemoveDisable(profileId);
      return;
    }
    else if (check.checked && !profileData.hasOwnProperty(profileId)) {
      this.profileEditor.insertGeneric();
      tempProfilesData[profileId] = this.profileEditor.initialValue();
      this.profileRemoveDisable(profileId)
      return;
    } else if (check.checked && !tempProfilesData.hasOwnProperty(profileId)) {
      this.profileEditor.setData(tempProfilesData[profileId]);
      this.profileRemoveDisable(profileId);
      return;
    } else {
      pageData.disabledProfileData.push(profileId);
      this.profileEditor.setData({});
    }
  }

  getSelectedProfileId() {
    return this.profileTabSelected.value;
  }
}


class ProfileEditor {
  constructor(defaultProfileID) {
    // create the editor
    this.container = document.getElementById("jsoneditor");
    this.main = new JSONEditor(this.container, {
      onCreateMenu: this.onCreateMenu,
      limitDragging: true,
      mainMenuBar: false,
      navigationBar: true,
      onChangeJSON: this.onChangeJSON,
    });
    this.container.style.width = "100%";
    this.container.style.height = 'fit-content';

    if (profileData.hasOwnProperty(defaultProfileID)) {
      this.main.set(profileData[defaultProfileID]);
    } else {
      this.main.set({});
    }

    this.main.expandAll();
  }

  printData() {
    console.log(JSON.stringify(this.main.get(), null, 2));
  }

  setData(json) {
    this.main.set(json);
  }

  collapse() {
    this.main.collapseAll();
  }

  expand() {
    this.main.expandAll();
  }

  onCreateMenu(items, node) {
    // console.log('items:', items, '\nnode:', node);
    let newItems = [];
    let level = node.path.length;
    const notAllowed = ['Transform', 'Sort', 'Type', 'Extract', 'Auto'];
    const notAllowedSub = ['Object'];

    // Top Items
    if (level === 1 || level === 0) return [];



    for (const item of items) {
      if (notAllowed.includes(item.text)) continue;
      if (item.hasOwnProperty('type') && item.type == 'separator') continue;

      if (node.path.includes('Image') || level >= 4 || (level == 3 && node.type === 'append')) {
        if (item.hasOwnProperty('submenu')) {
          delete item.submenu;
          delete item.submenuTitle;
        }
      }

      if (level >= 3) {
        if (item.hasOwnProperty('submenu')) {
          for (const subItem of item.submenu) {
            if (notAllowedSub.includes(subItem.text)) {
              let index = item.submenu.indexOf(subItem);
              item.submenu.splice(index, 1);
            }
          }
        }
      }

      if (item.hasOwnProperty('submenu')) {
        for (const subItem of item.submenu) {
          if (subItem.text == 'Auto') {
            let index = item.submenu.indexOf(subItem);
            item.submenu.splice(index, 1);
          }
          if (level == 2) {
            if (subItem.text == 'Object' && node.type == 'append') {
              let index = item.submenu.indexOf(subItem);
              item.submenu.splice(index, 1);
            }
          }
        }
      }

      if (level == 2 && node.type == 'single') {
        if (item.text == 'Insert') {
          newItems.unshift(item.submenu[1]);
          delete item.submenu;
          delete item.submenuTitle;
          continue;
        }
      }

      newItems.push(item);
    }

    return newItems;
  }

  insertGeneric() {
    this.main.set(this.initialValue())
  }

  initialValue() {
    return {
      'Title': 'John Doe',
      'Image': {
        "Original Art": "assets/images/Ethan-Morales.png",
        "Uniform": "assets/images/Eltia-Axolin-Uniform.png",
        "Hero Suit": "assets/images/Eltia Axolin.png"
      },
      'Content': {
        'Desc': {
          'Full Name': 'John R. Doe',
          'Alias': ['Tantan', 'Lunatic', 'Crazy Sociopath']
        },
        'Biography': {
          'Race': 'Human',
          'Birthday': '15 June',
          'Age': '15',
          'Gender': 'Male',
          'Height': '168 cm',
          'Weight': '58 kg',
          'Hair Color': 'Orange-Red',
          'Skin Color': 'Light-Beige',
          'Blood Type': 'AB'
        },
        'Power': {
          'Rank': 'Sixth Awakener',
          'Ability': [
            'Candlefire',
            'Pyrokinesis',
            'Thermal Manipulation | https://www.w3schools.com/howto/howto_js_tabs.asp',
            'Kinetic Manipulation',
            'Molecular Binding',
            'Atomic Manipulation',
          ]
        },
        'Status': {
          'Status': 'Alive',
          'Birthplace': 'Desteria, Shanty Town',
          'Family': [
            'Madelyn Morales (Mother)',
            'Nathaniel Morales (Father)',
            'Isaac Morales (Little Brother)',
            'Graniel Morales (Grandfather)',
          ]
        }
      }
    };
  }

  onChangeJSON(json) {
    let id = pageEditor.getSelectedProfileId();
    if (tempProfilesData.hasOwnProperty(id)) {
      tempProfilesData[id] = json;
      return;
    }
    if (profileData.hasOwnProperty(id)) {
      profileData[id] = json;
    }
  }
}