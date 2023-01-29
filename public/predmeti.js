PoziviAjax.getPredmeti((greska, podaci) => {
    if(greska) {
        let dodatno = document.getElementById('dodatno');
        dodatno.style.display = 'grid';
        let odjava = document.getElementById('odjava');
        odjava.style.display = 'none';
    } else {
        let predmeti = document.getElementById('predmeti');
        for(let i = 0; i < podaci.length; i++) {
            let predmet = document.createElement('div');
            predmet.classList.add('predmet');
            predmet.innerHTML = podaci[i];
            predmet.onclick = () => {
                PoziviAjax.getPredmet(podaci[i], (greska, podaci) => {
                   TabelaPrisustvo( document.getElementById('prisustvo'), podaci );
                });
            }
            predmeti.append(predmet);
        }
        if(podaci.length === 0) predmeti.innerHTML = 'Nema predmeta';
    }
 });
 
 let prijava = document.getElementById('prijava');
 
 prijava.onclick = () => {
     window.location.replace('http://localhost:3000/prijava.html');
 }
 
 odjava.onclick = () => {
     PoziviAjax.postLogout(() => {
         window.location.replace('http://localhost:3000/prijava.html');
     });
 }