import { apiURL } from "./apiURL.js";
const myForm = document.getElementById("myForm");

async function postMyForm (mail, pass) {
    const dataForm = {
        email: mail,
        password: pass
      }
    const postForm = await fetch (`${apiURL}users/login`,{body: JSON.stringify(dataForm),method: "post",headers: {"Content-Type" : "application/json"}});
    const result = await postForm.json();

    if (!result.token) {
        alert('Erreur dans l’identifiant ou le mot de passe');
    }
    else {
        localStorage.setItem('token', result.token);
        window.location.replace("index.html")
    }
}

myForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    postMyForm (email, password); 
})
