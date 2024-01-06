import { SendMessageWS } from '../Mutation/ConectionWs.js'
let UserUIX = `
    <div id="Join-cntr">
        <div id="Status-cntr">
            <h1>Status</h1>
            <p id="StatusUserName">username</p>
            <span id="UserName"></span>
            <p id="StatusUserId">User Id</p>
            <span id="UserId"></span>
        </div>
        <div id="map-cntr"></div>

        <div id="Back-PopUpChat">
            <div id="SectionPopUpChat">
                <div id="ChatSectionBacCtnr-bg">                
                    <div id="sectionIconsChatPopUp">
                        <div id="IconCloseChatPopUp-cntr">
                        <div id="IconCloseChatPopUp"></div>
                        </div>
                    </div>
                    <div id="PopUp-cntr">
                        <div id="PopUpCntr-Chat"></div>
                        <div id="PopUpCntr-Input">
                            <div id="ChatSectionInput">
                                <input id="MsgChat" type="text" placeholder="Write your msg">
                                <button id="SendChat">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="Chat-cntr">
         <div id="chatIcon"></div>
        </div>
        <div id="top-cntr">
            <h2>Top</h2>
            <ol>
                <li>none</li>
                <li>none</li>
            </ol>   
            <p id="topUserconected">User conected</p>
            <span id="Userconected">--</span>
        </div>
    </div>
`;

function Initial(){
    DoonUser();
    listennersInit();
}

function DoonUser(){
    document.querySelector('body').innerHTML = UserUIX;
}

function listennersInit(){
    //document.getElementById('Join').addEventListener('click', () =>{ InitUser() });
    document.getElementById('Chat-cntr').addEventListener('click', () =>{ StatusChat(true)});
    document.getElementById('IconCloseChatPopUp-cntr').addEventListener('click', () =>{ StatusChat(false)});

    document.getElementById('SendChat').addEventListener('click', () =>{ SendMessage()});
    document.getElementById('MsgChat').addEventListener('keydown', (e) =>{ handleEnterKey(e)});
}

function StatusChat(status){
    if(status == true) {
        document.getElementById('Back-PopUpChat').style.display = "flex";
        document.getElementById('map-cntr').style.position = "absolute";
    }else{
        document.getElementById('Back-PopUpChat').style.display = "none";
        document.getElementById('map-cntr').style.position = "static";
    }
}

function handleEnterKey(event) {
    // Verificar si la tecla presionada es "Enter" (código 13)
    if (event.keyCode === 13) {
        // Prevenir el comportamiento predeterminado (por ejemplo, evitar que se envíe un formulario)
        event.preventDefault();
        // Llamar a la función que maneja el clic en el botón
        document.getElementById("SendChat").click();
    }
}

function SendMessage(){
    let msgInput = document.getElementById('MsgChat');
    let message = msgInput.value;
    if (message.trim() !== '') {
        SendMessageWS(message);


        // Mostrar el mensaje localmente
        let chatContainer = document.getElementById('PopUpCntr-Chat');

        let templatedMessage = `
            <div class="sectionMessage mymsg">
                <div class="message">
                    <p>${message}</p>
                </div>       
            </div>
        `;

        
        // Agregar el HTML directamente al contenedor del chat
        chatContainer.insertAdjacentHTML('beforeend', templatedMessage);

        // Limpiar el cuadro de entrada
        msgInput.value = '';
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}


export function ControlUI(){
    Initial();
}