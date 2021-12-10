// ==UserScript==
// @name         公文查询辅助
// @namespace    http://qingtingwl.cn/
// @version      0.1
// @description  配合QQ机器人，将查询的信息通过WebSocket发送给NodeJS后台。
// @author       蜻蜓和小卓
// @match        https://www1.szu.edu.cn/board/print.asp*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  let msg = document.querySelector(".cont-wrap").innerText.replace(/\n\n/g,'\n').replace(/\n\n/g,'\n')
  let ws = new WebSocket('ws://127.0.0.1:8081/docx');
  setTimeout(()=>{
    ws.send(msg);
    ws.close();
    },3000);
})();