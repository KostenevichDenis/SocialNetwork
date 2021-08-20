const WebSocket= require('ws');
const wss = new WebSocket.Server({clientTracking: false, noServer: true});
const map = new Map();
const Room = require('./models/rooms');
const Users = require('./models/user');

function noop() {}
function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', async function (ws, request) {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  const user_id = request.session.user_id;
  map.set(user_id, ws);
  /* var cookies = cookie.parse(request.headers.cookie);
  let sid=cookieParser.signedCookie(cookies["connect.sid"], process.env.SECRET); */
  console.log('wss conection established by user_id: ' + user_id);
    
  ws.on('message', async function (msg) {
    // Here we can now use session parameters.
    msg = JSON.parse(msg);
    console.log(`recieved msg: ${Object.keys(msg)}`)
    console.log(`recieved msg type: ${msg.type}`)
    switch (msg.type) {
      //init room
      case 'init':
          console.log('init room')
          if (request.session.activeRooms.findIndex(item => item == msg.roomId) == -1) {
          request.session.activeRooms.push(msg.roomId);
          request.session.save();
          console.log(`user ${request.session.user_id} open ws in room ${msg.roomId},
          now opened ws in rooms: ${request.session.activeRooms}`); 
          return
          }
        break

      //got new msg, save to mongo and broadcast them
      case 'newMsg':
          console.log(`recieved msg ${msg.body} from: ${request.session.user_id} in room ${msg.roomId}`);
          let room = await Room.findById({_id: msg.roomId});
          let newmsg = {
            author: request.session.user_id,
            date: Date.now(),
            body: msg.body
          }
          room.messages.push(newmsg);
          await room.save();
          newmsg.date = new Date(newmsg.date);
          /* console.log(newmsg); */
          room = await Room.findById({_id: msg.roomId}); // stoped here
          let author = await Users.findById({_id: request.session.user_id});
          room.messages.forEach( function (e) {
            if(e.author == newmsg.author && e.date.getTime() == newmsg.date.getTime() && e.body == newmsg.body) {
              //convert date format
              d = [
                '0' + newmsg.date.getDate(),
                '0' + (newmsg.date.getMonth() + 1),
                '' + newmsg.date.getFullYear(),
                '0' + newmsg.date.getHours(),
                '0' + newmsg.date.getMinutes()
                ].map(component => component.slice(-2));
              newmsg.dates = d.slice(0, 3).join('.') + ' ' + d.slice(3).join(':');
              
              //generate new ws msg
              newmsg = {
                _id: e._id,
                authorAvatar: author.user_avatar,
                authorName: author.user_name,
                date: newmsg.date,
                body: newmsg.body,
                type: 'newMsg',
                roomId: msg.roomId,
                read: false
              }
            }
          } )
          room.usersInRoom.forEach(function (e, i, arr) {
            let broadcastMsg = map.get(e);
            if (broadcastMsg != undefined && broadcastMsg.readyState === WebSocket.OPEN) {
                broadcastMsg.send(JSON.stringify(newmsg))
              }
          }); 
      break
      case 'msgDel':
          console.log(`recieve del req`)
      break
    }
  });
  
  ws.on('close', function () {
    map.delete(user_id);

  });
});

//detecting broken connetcion
const interval = setInterval(function ping() {
map.forEach(function each(ws) {
  if (ws.isAlive === false) return ws.terminate();

  ws.isAlive = false;
  /* console.log(`ping`) */
  ws.ping(noop);
  });
}, 30000);

wss.on('close', function close() {
  /* console.log(`pong`) */
  clearInterval(interval);
});

module.exports = {wss, map};