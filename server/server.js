var protoo = require('protoo-server')
var http =  require('http')
const url = require('url');
const bodyParser = require('body-parser');
var config =  require('../server_config');


var  clients =  new  Map();


clients.forEach(function(client){
    console.log("asdasda");
});


var  soc = require('socket.io-client');
const N = require('./nuve');
const events = require('events');
const { json } = require('body-parser');

class  Client extends events.EventEmitter{
    
    setio(io){
        this.io =   io;

    }
    getio(){
        return  this.io;
    }
}


const   global_client =  new Client();

 run();

async function run()
{
    console.log(`config:${JSON.stringify(config.mediasoup_server)}`);
    console.log(`server_id:${config.mediasoup_server.serverid} 
        server_key:${config.mediasoup_server.serverkey} 
        server_add:${config.mediasoup_server.serveraddres}
        roomid:${config.mediasoup_server.roomid}`);
    
    N.API.init(config.mediasoup_server.serverid, 
        config.mediasoup_server.serverkey,
        config.mediasoup_server.serveraddres);
    //创建token
    N.API.createToken(config.mediasoup_server.roomid, "123123", 'viewer', (token) => {
        console.log("申请token返回");
        tokens = Buffer.from(token, 'base64').toString()
        console.log(tokens)
        var  urls = "http://"+JSON.parse(tokens).host
        console.log(" EC URL"+urls);
        const io = soc(urls,{
            transports: ['websocket']
        });

        io.on('disconnect',function(){
            console.log('get disconnect')
        })

        io.on('connection_failed',function(){
            console.log('get connection_failed')
        })

        io.on('error',function(){
            console.log('get error')
        })

        io.on('connect',function(){
            var  optiones = {
                token:JSON.parse(tokens)
            }
            io.emit("token",optiones,function(event,msg){
                console.log("发送token返回");
                if(event == "success"){
                    console.log("发送token成功返回 clientID:",msg.clientId);
                    
                }
            });
            
        });

        io.on("test",function(nessage){
            console.log("get  test");
        });
        io.on("newConsumer",function(message,callback){
            console.log("==============newConsumer============");
            console.log(message);
            global_client.emit("newConsumer",message,callback);
        });

        io.on("newDataConsumer",function(message,callback){
            console.log("==============newDataConsumer============");
            console.log(message);
            global_client.emit("newDataConsumer",message,callback);
        });

        
        io.on("producerScore",function(message){
            console.log("==============producerScore============");
            console.log(message);
            global_client.emit("producerScore",message);
        });


        io.on("newPeer",function(message){
            console.log("==============newPeer============");
            console.log(message);
            global_client.emit("newPeer",message);
        });
        

        io.on("peerClosed",function(message){
            console.log("==============peerClosed============");
            console.log(message);
            global_client.emit("peerClosed",message);
        });

        io.on("downlinkBwe",function(message){
            console.log("==============downlinkBwe============");
            console.log(message);
            global_client.emit("downlinkBwe",message);
        });

        
        io.on("consumerClosed",function(message){
            console.log("==============consumerClosed============");
            console.log(message);
            global_client.emit("consumerClosed",message);
        });

        io.on("consumerPaused",function(message){
            console.log("==============consumerPaused============");
            console.log(message);
            global_client.emit("consumerPaused",message);
        });


        io.on("consumerResumed",function(message){
            console.log("==============consumerResumed============");
            console.log(message);
            global_client.emit("consumerResumed",message);
        });

        io.on("consumerLayersChanged",function(message){
            console.log("==============consumerLayersChanged============");
            console.log(message);
            global_client.emit("consumerLayersChanged",message);
        });

        io.on("consumerScore",function(message){
            console.log("==============consumerScore============");
            console.log(message);
            global_client.emit("consumerScore",message);
        });

        io.on("dataConsumerClosed",function(message){
            console.log("==============dataConsumerClosed============");
            console.log(message);
            global_client.emit("dataConsumerClosed",message);
        });

        io.on("activeSpeaker",function(message){
            console.log("==============activeSpeaker============");
            console.log(message);
            global_client.emit("activeSpeaker",message);
        });

        

    
        global_client.setio(io);
    });





    const  option = {};
    httpServer =   http.createServer(option);

    console.log(`transfer_server   linsten  on：${config.transfer_server.ip}:${config.transfer_server.port }`);
    httpServer.listen(Number(config.transfer_server.port), config.transfer_server.ip);

    protooWebSocketServer = new protoo.WebSocketServer(httpServer,
        {
            maxReceivedFrameSize     : 960000, // 960 KBytes.
            maxReceivedMessageSize   : 960000,
            fragmentOutgoingMessages : true,
            fragmentationThreshold   : 960000,
            // autoAcceptConnections    : true
        });

    console.log("server   client  on   5006");

    const protooRoom = new protoo.Room();

    protooWebSocketServer.on('connectionrequest', (info, accept, reject) =>
    {

        const u = url.parse(info.request.url, true);
        const roomId = u.query['roomId'];
        const peerId = u.query['peerId'];
        console.log("roomid"+roomId);
        console.log("peerid"+peerId);

        const protooWebSocketTransport = accept();

        peer = protooRoom.createPeer(peerId, protooWebSocketTransport);
        
        peer.on('request', (request2, accept2, reject2) =>
            {
                console.log("peer  get  request:",request2.method);
                console.log("peer  get  request:",request2.data);
                var  msg= {
                    data:request2.data
                };
                global_client.getio().emit(request2.method,msg,function(resutl,msg){
                    accept2(msg.data);
                });
            });

        peer.on('close', () =>
        {
            console.log("peer  close");
            global_client.getio().close();
            
        });


        global_client.on("newConsumer",function(message,callback){
            const res =      peer.request("newConsumer",message.data);
            res.then(function(data){
                console.log("newConsumer res:"+data);
                console.log("newConsumer res:"+JSON.stringify(data));
                var  res = {
                    data:data
                }
                callback("success",res);
            })
        });

        global_client.on("newDataConsumer",function(message,callback){
            const res =      peer.request("newDataConsumer",message.data);
            res.then(function(data){
                console.log("newDataConsumer res:"+data);
                var  res = {
                    data:data
                }
                callback("success",res);
            })
        });

        global_client.on("producerScore",function(message){
            peer.notify("producerScore",message.data);
        });

        global_client.on("newPeer",function(message){
            message.data.device = {};
            peer.notify("newPeer",message.data);
        });

        global_client.on("peerClosed",function(message){
            peer.notify("peerClosed",message.data);
        });

        global_client.on("downlinkBwe",function(message){
            peer.notify("downlinkBwe",message.data);
        });

        global_client.on("consumerClosed",function(message){
            peer.notify("consumerClosed",message.data);
        });


        global_client.on("consumerPaused",function(message){
            peer.notify("consumerPaused",message.data);
        });











        global_client.on("consumerResumed",function(message){
            peer.notify("consumerResumed",message.data);
        });

        global_client.on("consumerLayersChanged",function(message){
            peer.notify("consumerLayersChanged",message.data);
        });


        global_client.on("consumerScore",function(message){
            peer.notify("consumerScore",message.data);
        });


        global_client.on("dataConsumerClosed",function(message){
            peer.notify("dataConsumerClosed",message.data);
        });

        global_client.on("activeSpeaker",function(message){
            peer.notify("activeSpeaker",message.data);
        });

    });

}



// async  function sendreq(peer){
//     res =   await    peer.request("reqGetNmae",{
//         name:"123"
//     });

//     const {
//         name
//     }=  res
//     console.log("client's  name:"+name);
// }
