import { ConectWS } from '../Mutation/ConectionWs.js';
import { ControlUI } from '../Controller/ControlUI.js';
import { ControllerThree } from '../Controller/ControllerThree.js';

let UserUIX = `
<div id="back-UserInit"></div>
<div id="back-UserInitAnimation"></div>

<div id="shadow-bg-cntr">
    <div id="shadow-bg">
        <div id="InitUserConection-cntr">
            <h1>User Name</h1>
            <div id="cntr-inputing">
                <input id="UserName" type="text" placeholder="Enter your Name">
                <button id="Join">Join</button>
            </div>
            <p id="ErrorMessage" ></p>
        </div>
    </div>
</div>
`;

function InitUser(){
    let User = document.getElementById('UserName').value;
    if(Validation(User)){
        Join(User);
    }else{
        errorInitUser(`Error your Name`);
    }
}

function Join(user){
    let conectionWebsocket  = ConectWS(user);
    if(conectionWebsocket != true){
        errorInitUser(`Error creating WebSocket ${conectionWebsocket}`);
    }else{
        ControlUI();
        ControllerThree();
    }
}

function errorInitUser(text){
    let error = document.getElementById("ErrorMessage");
    error.innerHTML = text;
    error.style.display = 'block';
}

function Validation(user){
    if(user && typeof user == 'string' && user != ""){
        return true;
    }else{
        return false;
    }
}

export function Initial(){
    DoonUser();
    listennersInitUser();
}

function DoonUser(){
    document.querySelector('body').innerHTML = UserUIX;
}

function listennersInitUser(){
    document.getElementById('Join').addEventListener('click', () =>{ InitUser() });

    let inputElement = document.getElementById("UserName");
    let buttonElement = document.getElementById("Join");
    inputElement.addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        buttonElement.click();
    }
    });
}
