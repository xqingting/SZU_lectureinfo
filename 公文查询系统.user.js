// ==UserScript==
// @name         公文查询系统
// @namespace    http://qingtingwl.cn/
// @version      0.1
// @description  配合QQ机器人，将查询的信息通过WebSocket发送给NodeJS后台。
// @author       蜻蜓和小卓
// @match        https://www1.szu.edu.cn/board/infolist.asp*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  let ws;
  let todayres = [];
  setTimeout(()=>{
    let iframe1 = document.createElement('iframe');
    document.body.appendChild(iframe1);
    let res = [];
    let url = [];
    //let todayres = [];
    ws = new WebSocket('ws://127.0.0.1:8081/doc');
    ws.onmessage = e=>{
      let msg = e.data;
      //console.log('收到NodeJS消息：', msg);
      if(msg.startsWith('doc')){
        if(/reload|刷新/.test(msg)){
          ws.send('正在刷新中...');
          location.reload(); //刷新页面
          return;
        }
        if(msg == 'doc help'){
          ws.send(`已缓存${res.length}条记录，可发送：\ndoc 默认查询（今日讲座）\ndoc today 获取今日内容\ndoc reload 更新缓存\ndoc 3-6 查看第3~6条\ndoc 9 只看第9条`)
        }
        if(msg == 'doc'){
          msg = 'doc today';
        }
        if(msg == 'doc today'){
          ws.send('今日后海校区的讲座如下：\n'+todayres.slice(0,todayres.length -1).join('\n\n'));
          return;
        }
        if(!res.length)return;
        let 范围 = msg.match(/(\d+)-(\d+)/);
        if(范围 && 范围[1]>0 && 范围[2]<=res.length){
          ws.send(res.slice(范围[1]-1,范围[2]).join('\n\n'));
          return;
        }
        let 单条 = msg.match(/\d+/);
        if(单条>0 && 单条<=res.length){
          ws.send(res[单条-1].split(',').join('\n')+'\n链接：'+url[单条-1]);
          iframe1.src = url[单条-1].replace('view','print');//'https://www1.szu.edu.cn/board/print.asp?id=463285';//改链接
          return;
        }
      }
    };
    let tbody = document.querySelector("table table table tr:nth-child(3) tbody")
    let arr = tbody.querySelectorAll('tr');
    url = [];
    for(let i=2; i<arr.length; i++){
      let a = arr[i].innerText.split('\t');
      url.push(arr[i].querySelector('a').href);
      let str = `【${a[0]}.${a[1]}】：${a[2]}\n主题：${a[3].substr(2)}[${a[4]}]`;//`序号：${a[0]},校区｜楼宇：${a[1]},讲座时间：${a[2]},讲座主题：${a[3].substr(2)}，发文单位：${a[4]}`;
      let day = new Date(a[2]).toLocaleDateString().substr(5);
      let today = new Date().toLocaleDateString().substr(5);
      let here = a[1].trim().startsWith("粤海") || a[1].trim().startsWith("沧海")
      //console.log(here,a[1],url[i-2])
      if(day == today && here){
        let todaystr = `【${a[1].substr(4)}(${a[0]})】：${a[2].substr(6)}\n主题：${a[3].substr(2)}[${a[4]}]`
        todayres.push(todaystr);
      }
      res.push(str);
    }
    //console.log(res);
    //console.log(`${new Date().toLocaleTimeString()}刷新完成！已获取到${res.length}条记录，可发送：\ndoc 默认查询（今日讲座）\ndoc today 获取今日内容\ndoc reload 更新缓存\ndoc 3-6 查看第3~6条\ndoc 9 只看第9条`);
    setTimeout(()=>ws.send(`${new Date().toLocaleTimeString()}更新完成！\n已缓存${res.length}条记录，发送：doc help 查看帮助`),2000);
  }, 3000);
  setInterval(()=>{ //每天上午7点更新
    let time = new Date().getHours();
    console.log(time)
    if(time == 6){
      location.reload();
    }else if(time == 7 || time == 18){
      ws.send('今日后海校区的讲座如下：\n'+todayres.slice(0,todayres.length -1).join('\n\n'));
    }
  }, 1000*3600);
})();