const PB解析器 = require('./onebot_frame.js');
const ws = require('./websocket');
const others = require('./others.js');
const express = require('express');
let url = require('url');
let fs = require('fs');
let app = express();
let http = require('http').Server(app);
http.listen(6666, ()=>console.log('正在监听6666端口中……'));

app.all('*', (req, res, next)=>{ //设置允许跨域访问该服务
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Headers', 'mytoken');
  next();
});

app.use('/doc', (req, res)=>{
  let a = url.parse(req.url, true).query;
  console.log(a);
  res.end('save done.');
});

//加载
ws.createServer((socket)=>{
  console.log('连接成功！当前接口：', socket.path);
  if(socket.path == '/doc'){
    console.log('已连接公文接口。');
    QT.docemit = socket;
    socket.on('text', (str)=>{
      //console.log('公文接口收到消息：', str);
      //fs.writeFileSync('公文.txt', Buffer.from(str));
      QT.发送群消息(document, str);
      socket.send('save done!');
    });
    setInterval(()=>{ //每天上午7点定时给公文系统发送一个查询指令也就是让他给我推送今天的讲座。
      if(new Date().getHours() == 7)
      socket.send('save done!');
    }, 1000*60*60);
  }
  
  socket.on('close', (code, reason)=>{
    console.log('已断开连接！', code, reason);
    QT.faceEmit = null;
  });

  socket.on('error', (err)=>{
    console.log('发生异常：', err);
  });
}).listen(8081);
let process = ()=>{
  if(msg.startsWith('Doc'))msg = msg.toLowerCase();//msg = msg.toLowerCase();
  if(msg == '公文通')msg = 'doc';
  if(msg.startsWith('doc')){
    QT.docemit.send(msg);
    return ;
  }
}

module.exports = {process};
/*
网页连接机器人：
let ws = new WebSocket('ws://127.0.0.1:8081/doc');
ws.onmessage = (e)=>{
  console.log(e.data);
};

获取所需并发送给机器人：
let tbody = document.querySelector("body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(3) > td > table > tbody")
let arr = tbody.querySelectorAll('tr');
let res = '';
for(let i=0; i<arr.length; i++){
  res += arr[i].innerText+'\n';
}
ws.send(res);

前端刷新：
setInterval(()=>{
  location.reload();
    console.log('刷新');
}, 3000)

整点时间触发：
let 触发函数 = ()=>{
  console.log('当前时间:', new Date().toLocaleString());
};

let 整点触发 = ()=>{
  let time = new Date();
  let m = (59-time.getMinutes()) * 60000;
  let s = (59-time.getSeconds()) * 1000;
  let ms = 1000 - time.getMilliseconds();
  console.log(m+s+ms, '毫秒后执行。');
  setTimeout(()=>{
    触发函数();
    整点触发();
  }, m+s+ms);
};
*/