let UrlBackend = 'ws://localhost:3000';
import { CreateCubeUserMain, updateCubeLocation, handleNewUserCube, handleUserDisconnect} from '../Controller/ControllerThree.js'
export function SendMessageWS(message) {
    if (ws) {
      console.log('SendMessageWS '+message);
      ws.send(JSON.stringify({ type: 'NewMessage', message: message }));
    } else {
      console.error('WebSocket connection not established.');
    }
}
export async function sendDataUserCube(position, color) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('sendDataUserCube');
      ws.send(JSON.stringify({ type: 'DataUserCube', location: position, color: color }));
    } else if (ws && ws.readyState === WebSocket.CONNECTING) {
      // Esperar hasta que la conexión esté abierta
      await new Promise(resolve => {
        ws.addEventListener('open', resolve);
      });
      sendDataUserCube(position, color); // Llamar recursivamente después de que la conexión esté abierta
    } else {
      console.error('WebSocket connection not established.');
    }
}
  
export function UpdateDataUser(location, userId){
    ws.send(JSON.stringify({ type: 'UpdateDataUser', userId, location}));
}


function StatsUpdate(data){
    document.getElementById("UserName").innerHTML = data.userName;

    let userConectedElement = document.getElementById("UserId");

    let shortId = data.userId.slice(-4);
    userConectedElement.innerHTML = shortId;
    userConectedElement.title = data.userId;
    CreateCubeUserMain(data);

}
function TopUpdate(data){
    document.getElementById("Userconected").innerHTML = data.conections;
}

function firstInfo(data) {
    //stast update first init data
    StatsUpdate(data);
    //Top data first Init
    TopUpdate(data);
}
var ws;
export function ConectWS(user) {
    try {
        ws = new WebSocket(UrlBackend);

        ws.addEventListener('open', (event) => {
            console.log('Conexión establecida');
            // Ahora puedes enviar o recibir datos
            ws.send(JSON.stringify({ type: 'userInfo', user: user}));
        });

        ws.addEventListener('close', (event) => {
            console.log('Conexión cerrada');
        });

        ws.addEventListener('error', (event) => {
            console.error('Error en la conexión', event);
        });

        // Manejar mensajes del servidor
        ws.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'userConnected') {
                console.log(`userConnected: Nuevos usuarios conectados: ${data.conections}`)
            }else if( data.type === 'FirstInfo'){
                console.log(`FirstInfo: Users conectados: ${data.conections}, userid ${data.userId}, username ${data.userName}`);
                firstInfo(data);
            }else if( data.type === 'BeforeUserCube'){
                data.existingCubes.forEach((existingCubeData) => {
                    handleNewUserCube(existingCubeData);
                });
            }
            else if(data.type === 'userDesConnected'){
                console.log( `userDesConnected: users connect now: ${data.conections}`);
                handleUserDisconnect(data);
            }else if(data.type === 'NewMessageUser'){
                console.log( `NewMessageUser: new message ${data.message}`)
                NewMessageOthersUsers(data)
            }else if(data.type === 'NewCubeUser'){
                //nos llegara su id, locaclizacion y color
                console.log( `NewCubeUser: new cube creation ${data.CubeId}`)
                handleNewUserCube(data);
            }else if(data.type == 'UpdateLoactionCube'){
                //nos llegara la id del cubo y su nueva ubicacion
                console.log( `UpdateLoactionCube: update cube location ${data.CubeId}`);
                updateCubeLocation(data.CubeId, data.NewPosition);
            }
        });

        return true;
    } catch (error) {
        console.error(`Error creando WebSocket: ${error}`);
        throw error; // Lanzar el error para que pueda ser manejado externamente
    }
}
function NewMessageOthersUsers(data){
    // Mostrar el mensaje localmente
    let chatContainer = document.getElementById('PopUpCntr-Chat');

    let templatedYouMessage = `
    <div class="sectionMessage youmsg">
        <div class="UserNameMessage">${data.username}<div>
        <div class="message">
            <p>${data.message}</p>
        </div>       
    </div>
    `;
    
    // Agregar el HTML directamente al contenedor del chat
    chatContainer.insertAdjacentHTML('beforeend', templatedYouMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;

}