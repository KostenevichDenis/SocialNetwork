class User {
    constructor(id, name, location, status, avatar, password) {
        this.id = id, this.name = name, this.location = location, this.status = status, this.avatar = avatar, this.password = password};
    };

let csrf;
if(document.querySelector("#_csrf")) {
    csrf = document.querySelector("#_csrf").value;
}
if(document.getElementsByName("_csrf").length > 0) {
    csrf = document.getElementsByName("_csrf")[0].value
}

//login e-mail input verification
/* let inputEmail = document.getElementById('email');
if (inputEmail) {
    inputEmail.addEventListener('change', (e) => {
        if(validateEmail(e.target.value)) {
            document.getElementById('email-error').style.opacity=0;
        } else {
            document.getElementById('email-error').style.opacity=1;
        }
    })
}
function validateEmail (email) {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    reg.tes
    return reg.test(String(email).toLowerCase());
}; */


function followUser(targetId, csrf = csrf) {
    let data = {
        'csrf': csrf,
        'id': targetId
    };
    request(`/friend/${targetId}`, 'PUT', data);
}

function unfollowUser(targetId, csrf = csrf) {
    let data = {
        'csrf': csrf,
        'id': targetId
    };
    request(`/friend/${targetId}`, 'DELETE', data);
}

async function user_upload_photo (form) {
    console.log('request sended');
    try {
        const { url } = await fetch("/s3Url").then(res => res.json());
        console.log(url);
        const file = form.avatar_file.files[0];

        await fetch(url, { 
            method: "PUT",
            headers: {
                "Content-Type": "multipart/form-data"
            },
            body: file
        })
        const imageUrl = url.split('?')[0];
        document.getElementById('img_avatar').setAttribute('src', imageUrl);
        console.log(imageUrl);
    }
    catch (e) {
        console.warn(e);
    }
};

function confirm_delete_request (id, method = 'DELETE', data = null) {
    if (confirm("Do you really want to delete this user?")) {
        let token = document.getElementById("_csrf");
        request(`../admin/api/users/${id}`, 'DELETE', {csrf: token.value});     
    } else return false
};

function user_create (data) {
    let form_user_data = new User ('new_user', data.user_name.value, data.user_location.value, data.user_status.value, data.img_avatar.value, data.user_password.value);
    console.dir(form_user_data);
    form_user_data._csrf = data._csrf.value;
    console.log(`Form has been readed and request is created \n`);
    console.dir(form_user_data)
    let action;
    if (data._registration) {
        action = '../../auth/registration'
    }   else {
        action = '../../admin/api/users'
    }
    request(action, 'POST', form_user_data);
};

function user_edit_request (id, data = null){
    console.log(id);
    console.log(data.img_avatar.src);
    let body = {
        avatar: data.img_avatar.src,
        status: data.user_status.value,
        location: data.user_location.value,
        csrf: data._csrf.value,
        id: id
    }
    console.log(body);
    if (confirm("Do you really want to edit your profile?")) {
        request(`/edit_profile`, 'PUT', body);
    } else return false
    alert('Changes has been saved')
};

function admin_user_edit_request (id, data = null){
    console.log(id);
    /* let form_user_data = new User (id, data.user_name.value, data.user_location.value, data.user_status.value, data.img_avatar.src, data.user_password.value); */
    let body = {
        id: id,
        name: data.user_name.value,
        location: data.user_location.value,
        status: data.user_status.value,
        avatar: data.img_avatar.src,
        password:data.user_password.value
    }
    console.dir(body);
    if (data._csrf) {body.csrf = data._csrf.value}
    if (confirm("Do you really want to edit this user?")) {
        request(`../../admin/api/users/${id}`, 'PUT', body);
    } else return false
    alert('Changes has been saved')
};

async function request (url, method = 'GET', data = null, csrf = null) {
    try {
        let headers = {};
        let body;
        if (data) {
            headers['Content-Type'] = 'application/json';
            if (csrf) {
                console.log('1 token added to request headers')
                headers['CSRF-Token'] = csrf;
                console.log(headers);
            }
            if (data.csrf) {
                console.log('2 token added to request headers')
                headers['CSRF-Token'] = data.csrf;
                console.log(headers);
            }
            if (data._csrf) {
                console.log('3 token added to request headers')
                headers['CSRF-Token'] = data._csrf;
                console.log(headers);
            }
             console.dir(data);
            body = JSON.stringify(data);
             console.dir(body);
            console.log(`request have data ${data}`)
            console.log(`request method is ${method}`)
            console.log(`request URL is: ${url}`)
        }

        let response = await fetch(url, {
            method,
            headers,
            body
        });
        let result = await response.json();
        console.log(`Result of request is ${result}`);
        if (result.url) {
            window.location.replace(result.url)

        } return result
        
        
    } catch (e) {
        console.warn('Error:', e.message)
    }
};

function sendMsg (data, csrf = document.querySelector("#_csrf").value, roomId = document.querySelector("#roomId").value, 
target = document.querySelector("#target").value) 
    {
    console.dir(data);
    msg = {
        text: data,
        roomId,
        target
    };
    console.log(`csrf: ` + csrf)
    request(`/messenger/${roomId}`, 'POST', msg, csrf);
};