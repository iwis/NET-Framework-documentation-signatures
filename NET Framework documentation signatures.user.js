// ==UserScript==
// @name         .NET Framework documentation signatures
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds member signatures at .NET documentation website
// @author       iwis
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        https://msdn.microsoft.com/en-us/library/*
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
/* jshint ignore:end */
    /* jshint esnext: false */
    /* jshint esversion: 6 */

//todo: optionally also for table with fields (for example in struct) and operators - not so important since they are rare

//get all links in Name column of Constructors, Properties and Methods tables
var nodes = document.evaluate("//table[@id='idConstructors' or @id='idProperties' or @id='idMethods']/tbody/tr/td[@data-th='Name']/a",
                              document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

//update text of each link to contain the full signature of the class member
for (var i = nodes.snapshotLength - 1; i >= 0; i--) {
  const node = nodes.snapshotItem(i);

  //the signature is found in the first pre tag on the webpage pointed by the current link
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", function() {
    var html = document.createElement('html');
    html.innerHTML = this.responseText;
    var s = html.getElementsByTagName('pre')[0].textContent;
    s = s.replace(/\n/g, "").replace(/\t/g, " ").replace(/\( /g, "("); //remove unnecessary white space from the signature
    s = s.replace(/^(public )/, "").replace(/^(protected )/, "").replace(/^(static )/, ""); //remove "public", "protected" and "static" modifiers since they are listed in the first column
    s = s.replace(/^(virtual )/, ""); //remove "virtual" modifier - it obfuscates the column
    //console.log(s);
    node.textContent = s;
  });
  oReq.open("GET", node.getAttribute("href"));
  oReq.send();
}

/* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */