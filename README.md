
## mediasoup_transfer
- 默认监听端口为 5006
- 需要修改 server_config.js中相关配置
- 启动  node   server.js  
默认启动后，mediasoup_transfer服务器会到nuve申请token,并创建到ec的socket连接，
正常的日志
```
config:{"serverid":"5f34dc28c5302121969d725e","serverkey":"24607","serveraddres":"http://10.254.48.97:3000/","roomid":"5f34e37319e76401391dfa29"}
server/server.js:39
server_id:5f34dc28c5302121969d725e 
        server_key:24607 
        server_add:http://10.254.48.97:3000/
        roomid:5f34e37319e76401391dfa29
server/server.js:40
transfer_server   linsten  on：0.0.0.0:5006
server/server.js:184
server   client  on   5006
server/server.js:196
申请token返回
server/server.js:50
{"tokenId":"5f573b0f458fb701396ad4af","host":"10.254.41.175:8080","secure":false,"signature":"Mjc1MjNhNGRmMGQ0MWEyNDBiYjZmYzliYzhjODRlMDQ4ZDEyOGY3Mw=="}
server/server.js:52
 EC URLhttp://10.254.41.175:8080
server/server.js:54
发送token返回
server/server.js:76
发送token成功返回 clientID: 4cacb797-55ed-477b-a79b-b8ab113fc393

```

## mediasoup-demo
- 使用官网给出的示例，并根据步骤搭建完成
- https://github.com/versatica/mediasoup-demo
### 修改代码 
修改  lib/urlFactory.js  中的ws连接为固定的端口,连接到mediasoup_transfer的5006端口
return `ws://127.0.0.1:5006/?roomId=${roomId}&peerId=${peerId}`;
修改 gulpfile.js  中live节点，将https注释掉 

### 启动 
- 切换到 app文件夹
- 启动  gulp   live
- 根据生成的URL访问即可
