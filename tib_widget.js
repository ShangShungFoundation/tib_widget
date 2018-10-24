(function () {
  var scriptName = "tib_widget.js"; //name of this script, used to get reference to own tag
  var jQuery; //noconflict reference to jquery
  var jqueryVersion = "3.3.1";
  var jqueryPath = "https://ajax.googleapis.com/ajax/libs/jquery/" + jqueryVersion + "/jquery.min.js"; 

  var scriptTag; //reference to the html script tag

  /******** Get reference to self (scriptTag) *********/
  var allScripts = document.getElementsByTagName('script');
  var targetScripts = [];
  for (var i in allScripts) {
      var name = allScripts[i].src
      if(name && name.indexOf(scriptName) > 0)
          targetScripts.push(allScripts[i]);
  }

  scriptTag = targetScripts[targetScripts.length - 1];

  /******** helper function to load external scripts *********/
  function loadScript(src, onLoad) {
      var script_tag = document.createElement('script');
      script_tag.setAttribute("type", "text/javascript");
      script_tag.setAttribute("src", src);

      if (script_tag.readyState) {
          script_tag.onreadystatechange = function () {
              if (this.readyState == 'complete' || this.readyState == 'loaded') {
                  onLoad();
              }
          };
      } else {
          script_tag.onload = onLoad;
      }
      (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
  }

  /******** helper function to load external css  *********/

  function loadCss(href) {
    var link_tag = document.createElement('link');
    link_tag.setAttribute("type", "text/css");
    link_tag.setAttribute("rel", "stylesheet");
    link_tag.setAttribute("href", href);
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(link_tag);
  }

  /******** load jquery into 'jQuery' variable then call main ********/
  if (window.jQuery === undefined || window.jQuery.fn.jquery !== jqueryVersion) {
      loadScript(jqueryPath, initjQuery);
  } else  {
    initjQuery();
}

function initjQuery() {
    jQuery = window.jQuery.noConflict(true);
    main();
}

  const Find = (syllabes, string, isWylie) => {
    function strip(string) {
      string = string.replace(/[༄༅།༼༽༈༾༿༴྾྾༑☸༎༔\- ]*/g, '')
      if (!string.endsWith('་'))
        string = `${string}་`
      return string
    }
    return syllabes[string]
  }

  class TibText {
    constructor(text, syllabsDict, size, color, background) {
      this.text = text;
      this.color = color;
      this.background = background;
      this.syllabsDict = syllabsDict;
      this.isWylie = false
      this.textArray = []
      this.wylieArray = []
      this.drajorArray = []
      this.size = size
      this.spacer = "<span>&nbsp;</span>";
      this.syllabes = this.toSyllabes(text, this.spacer )
      this.html = this.syllabes.join(' ')
      this.wylie = this.wylieArray.join(' ')
      this.drajor = this.drajorArray.join(' ')
    }
    
    toSyllabes(text, spacer){
      let textWhiteSpaceArray = text.split(/[ ]+/g)
      let syllArray = textWhiteSpaceArray.map((w) => w.split('་').map((s, i) => this.renderSylabe(s)))
      // console.log(syllArray)
      // return syllArray.map((a, i) => [...a, spacer])
      return syllArray[0]
    }
  
    toogleTip() {
      console.log(this)
      // this.setState({showTip: !this.state.showTip})
    }

    renderSyl = (syl, notFound=true) => 
      `<span class="syll" style="color: ${this.color}; background-color: ${this.background}">
        <p></p>
        <a class="tib ${notFound && 'notFound'}" style='font-size: ${this.size}; color: ${this.color}'>${syl}་</a>
      </span>`
      
    renderSylabe(s) {
      let tib = ''
      if (s === '')
        return ''
      var syl = Find(this.syllabsDict, s, this.isWylie)
      if (syl === undefined)
        return this.renderSyl(s)
        //   `<span class="syll" style="color: ${this.color}; background-color: ${this.background}">
        //     <p></p>
        //     <a class="tib notFound" style='font-size: ${this.size}; color: ${this.color}'>${s}་</a>
        //   </span>`
        // );
      else
        if (!this.isWylie) {
          this.wylieArray.push(syl.wy || s)
          tib = s.endsWith('།')? s : `${s}་`;
        } else {
          tib = syl.tib
        }
        this.drajorArray.push(syl.dra)
        return this.renderSyl(tib)
        // (
        //   `<span class="syll" style="color: ${this.color}; background-color: ${this.background}">
        //     <p></p>
        //     <a class="tib" data-tib=${s} style='font-size: ${this.size}; color: ${this.color}'>${tib}</a>
        //   </span>
        //   `)
    }
  };

  function main() {
    //your widget code goes here
    jQuery(document).ready(function ($) {
      const URL = 'https://shangshungfoundation.github.io/tib_learn_app/'
      loadCss(`https://shangshungfoundation.github.io/tib_widget/widget.css`);
      function renderTip(syl) {
        const spel = (syl.spel !== '') ? 
        `<audio autoPlay>
          <source src='${URL}assets/mp3/sylabes/${encodeURIComponent(syl.spel)}' type="audio/mpeg" />
        </audio>` : ''
        return (
          `<div class="tip">
          <p class="wy">${syl.wy}</p>
          <p class="dra">${syl.dra}</p>
          ${spel}
        </div>`)
      }

      var scriptEle = $(scriptTag)
      const text = scriptTag.dataset.text;
      const syllabsDict = JSON.parse(scriptTag.dataset.syllabes);
      const size = scriptTag.dataset.size == '' ?  '2em': scriptTag.dataset.size + 'em';
      const color = scriptTag.dataset.color || 'black';
      const background = scriptTag.dataset.background || '#DDD';
      const tibText = new TibText(text, syllabsDict, size, color, background) 
      const show_wylie = scriptTag.dataset.show_wylie == '' ? '' : `<p class='wy'>${tibText.wylie}</p>`;
      const show_dra = scriptTag.dataset.show_dra == '' ?  '' : `<p class='dra'>${tibText.drajor}</p>`
      const renderedSyllabes = tibText.html
      scriptEle.after(
        `<div class='tib'>
          ${renderedSyllabes}
          ${show_wylie}
          ${show_dra}
        </div>`
      )
      $('a.tib').click(function(e){
        const tib = this.dataset.tib
        if (tib !== undefined) {
          let syl = syllabsDict[tib]
          if (syl !== undefined) {
            // render tip
            let tip = $(this).prev().html(renderTip(syl))
            // close tip
            $(tip).click(function(e){
              $(this).html('')
            })
          }
        }
      })
    });
  }
})();
