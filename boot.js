const status=document.getElementById('loadStatus');
const showError=message=>{status.hidden=true;const panel=document.getElementById('error');panel.hidden=false;panel.textContent=message;};
addEventListener('error',event=>showError(`Porch War could not finish loading: ${event.message}. Reload the page after starting the local server.`));
import('./game.js').then(()=>{status.hidden=true;}).catch(error=>showError(`Porch War could not start: ${error.message}. Run node server.mjs in the game folder, then open http://localhost:4175.`));

