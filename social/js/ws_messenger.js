  
async function delMsg (msgId) {
  console.log(`called del function: `+msgId);

  let token = document.getElementById("_csrf");
  const roomId = document.querySelector('#roomId').value;

  let url = `/messenger/delete/${msgId}`
  let headers = {
    'Content-Type': 'application/json',
    'CSRF-Token': token
  };
  let method = 'DELETE'
  let body = JSON.stringify({
    roomId,
    msgId,
    _csrf: token.value,

  });

  let response = await fetch(url, {
    method,
    headers,
    body
});
  let result = await response.json();
  console.log(result.status);
  switch (result.status) {
    case 'done':
      document.getElementById(msgId).remove();
      break
    case 'error':
      console.log(`delete not permitted`);
      break
  }
  


  /* request(`/messenger/delete/${msgId}`, 'DELETE', data, {csrf: token.value})
} */
}


function run () {
  
  //wss
  const messages = document.querySelector('#messages');
  const sendMsgBtn = document.querySelector('#sendMsg');
  const roomId = document.querySelector('#roomId').value;
  const targetId = document.querySelector('#target').value;
  const msgInput = document.querySelector('#message');

  let msg;
  let ws;

  function dateFormat (date) {
    date = new Date (date);
    let d = [
      '0' + date.getDate(),
      '0' + (date.getMonth() + 1),
      '' + date.getFullYear(),
      '0' + date.getHours(),
      '0' + date.getMinutes()
      ].map(component => component.slice(-2));
    return d.slice(0, 3).join('.') + ' ' + d.slice(3).join(':');
  
}
  

  function wsConnect () {
    if (ws) {
      ws.onerror = ws.onopen = ws.onclose = null;
      ws.close();
    }

    //WSIP
    ws = new WebSocket(`ws://localhost:3000`);
    ws.onerror = function (e) {
      console.dir(e)
      showMessage('WebSocket error');
    };
    ws.onopen = function () {
      console.log('WebSocket connection established');
      msg = {
        roomId,
        targetId,
        type: 'init'
      }
      json = JSON.stringify(msg);
      ws.send(json);
      msg = null;
    };

    ws.onmessage = async function (event) {
      msg = await JSON.parse(event.data);
      
      switch(msg.type) {
        case "newMsg":
          function renderMsgHtml () {
            let msgDiv = document.createElement('div');
            msgDiv.className = 'row message unread';
            msgDiv.id = msg._id;
            msgDiv.style.opacity=0;
            let authorDataDiv = document.createElement('div');
            authorDataDiv.className='col-11 message__author-info w-auto';
            let avatar = document.createElement('img');
            avatar.className = 'message__author__avatar';
            avatar.src = msg.authorAvatar;
            authorDataDiv.append(avatar);
            let msgDateName = document.createElement('div');
            msgDateName.className = 'message__author__data';
            
            let authorName = document.createElement('div');
            authorName.className = 'col-11 message__author__name';
            authorName.textContent = msg.authorName;
            msgDateName.append(authorName);
            let msgDelBtn = document.createElement('div');
            msgDelBtn.className = 'col-1 message_btn-del';
            msgDelBtn.addEventListener('click', e => {
              delMsg(e.target.parentElement.parentElement.parentElement.id);
            }
            )
            msgDateName.append(msgDelBtn)
            let msgDate = document.createElement('div');
            msgDate.className = 'col-12 message__date';
            msgDate.textContent = dateFormat(msg.date);
            msgDateName.append(msgDate);
            authorDataDiv.append(msgDateName);
            msgDiv.append(authorDataDiv);
            let msgText = document.createElement('div');
            msgText.className = 'col-12 message__text';
            msgText.textContent = msg.body;
            msgDiv.append(authorDataDiv);
            msgDiv.append(msgText);
            messages.prepend(msgDiv);
            msgDiv.style.opacity=1;
            
            
          };
          if(roomId == msg.roomId) {
            renderMsgHtml();
            
          }
          
          break
      }
    }


    ws.onclose = function () {
      console.log('WebSocket connection closed');
      ws = null;
    };
  };

  //send msg via ws
  function sendMsg () {
    if (!ws) {
      console.log('No WebSocket connection');
      return;
    }
    let msg = {
      body: document.forms.msg.message.value,
      roomId,
      targetId,
      type: 'newMsg'
    }
    msg = JSON.stringify(msg);
    console.log(msg);
    ws.send(msg);
    console.log('msg has been sanded');
    document.forms.msg.message.value = '';
  };

  //sending via press enter + btn
  msgInput.addEventListener ('keydown', function(e) {
    if (e.code == "Enter" || e.code == "NumpadEnter") {
      e.preventDefault();
    sendMsg();
    }
  });
  sendMsgBtn.addEventListener ('click', sendMsg);
  
  wsConnect();
}

document.addEventListener("load", run());