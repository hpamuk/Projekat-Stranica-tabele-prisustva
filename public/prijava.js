let prijava = document.getElementById('prijava');
let odjava = document.getElementById('odjava');
let predmeti = document.getElementById('predmeti');

prijava.onclick = () => {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    PoziviAjax.postLogin(username, password, (greska, podaci) => {
       if(greska) {
            let greskaTekst = document.getElementById('greska-tekst');
            greskaTekst.className = '';
            greskaTekst.classList.add('greska-tekst');
            greskaTekst.innerHTML = greska.poruka;

            if(greska.poruka === 'Vec ste prijavljeni') {
                let dodatno = document.getElementById('dodatno');
               dodatno.style.display = 'grid';
               document.getElementById('username').disabled = true;
               document.getElementById('username').value = '';
               document.getElementById('password').disabled = true;
                document.getElementById('password').value = '';
                prijava.disabled = true;
            }
       } else {
            window.location.replace('http://localhost:3000/predmeti.html');
       }
    });
}

odjava.onclick = () => {
    PoziviAjax.postLogout((greska, podaci) => {
        if(greska) {
            let greskaTekst = document.getElementById('greska-tekst');
            greskaTekst.className = '';
            greskaTekst.classList.add('greska-tekst');
            greskaTekst.innerHTML = greska.poruka;
        } else {
            let greskaTekst = document.getElementById('greska-tekst');
            greskaTekst.innerHTML = '';
            let dodatno = document.getElementById('dodatno');
            dodatno.style.display = 'none';
            document.getElementById('username').disabled = false;
            document.getElementById('password').disabled = false;
            prijava.disabled = false;
        }
    });
}

predmeti.onclick = () => {
    window.location.replace('http://localhost:3000/predmeti.html');
}