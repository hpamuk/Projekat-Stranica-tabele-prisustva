let TabelaPrisustvo = (div, podaci) => {

    let trenutnaSedmica = 1;
    let posljednjaSedmica = 1;

    let zaokruziNaDvijeDecimale = (broj) => Math.round(broj * 100) / 100;

    // dodavanje naslova ; naziv predmeta
    let dodajNaslove = () => {
        let nazivPredmeta = document.createElement('h1');
        nazivPredmeta.innerHTML = podaci.predmet;

        div.append(nazivPredmeta);
    }

  

    let dodajTabelu = () => {
        let tabela = document.createElement('table');
        tabela.classList.add('tabela');

        let redNaslovi = document.createElement('tr');

        for(let i = 0; i < podaci.prisustva.length; i++)
            if(podaci.prisustva[i].sedmica > posljednjaSedmica)
                posljednjaSedmica = podaci.prisustva[i].sedmica;

        // Naslovi tabele
        let imePrezimeNaslov = document.createElement('th');
        imePrezimeNaslov.innerHTML = 'Ime i prezime';

        let indexNaslov = document.createElement('th');
        indexNaslov.innerHTML = 'Index';

        redNaslovi.append(imePrezimeNaslov);
        redNaslovi.append(indexNaslov);

        for(let i = 0; i < posljednjaSedmica; i++) {
            let naslov = document.createElement('th');
            naslov.innerHTML = i+1;
            redNaslovi.append(naslov);
        }

        tabela.append(redNaslovi);

        // Redovi tabele
        for(let i = 0; i < podaci.studenti.length; i++) {
            
            let index = podaci.studenti[i].index;
            let ime = podaci.studenti[i].ime;

            let red = document.createElement('tr');

            let kolonaIme = document.createElement('td');
            kolonaIme.innerHTML = ime;

            let kolonaIndex = document.createElement('td');
            kolonaIndex.innerHTML = index;

            red.append(kolonaIme);
            red.append(kolonaIndex);

            for(let j = 1; j <= posljednjaSedmica; j++) {

                let indexPrisustva = -1;

                for(let k = 0; k < podaci.prisustva.length; k++) {
                    if( podaci.prisustva[k].index === index && podaci.prisustva[k].sedmica === j ) {
                        indexPrisustva = k;
                        break;
                    }
                }

                let prisustvo = {
                    index,
                    sedmica: j,
                };

                if(indexPrisustva !== -1) prisustvo = podaci.prisustva[indexPrisustva];

                if(j !== trenutnaSedmica) {
                    let kolona = document.createElement('td');
                    if(prisustvo.hasOwnProperty('predavanja') && prisustvo.hasOwnProperty('vjezbe'))
                        kolona.innerHTML = `${zaokruziNaDvijeDecimale(
                            ((prisustvo.predavanja + prisustvo.vjezbe)
                                / (podaci.brojPredavanjaSedmicno + podaci.brojVjezbiSedmicno)) * 100
                        )}%`;
                    red.append(kolona);
                } else {
                    let kolona = document.createElement('td');
                    kolona.style.padding = 0;

                    // Kreiranje detaljne tabele prisustva
                    let prisustvoTabela = document.createElement('table');
                    prisustvoTabela.classList.add('mala-tabela');
                    let nasloviRed = document.createElement('tr');

                    for(let l = 1; l <= podaci.brojPredavanjaSedmicno; l++) {
                        let naslov = document.createElement('th');
                        naslov.append('P');
                        naslov.append(document.createElement('br'));
                        naslov.append(l);
                        nasloviRed.append(naslov);
                    }

                    for(let l = 1; l <= podaci.brojVjezbiSedmicno; l++) {
                        let naslov = document.createElement('th');
                        naslov.append('V');
                        naslov.append(document.createElement('br'));
                        naslov.append(l);
                        nasloviRed.append(naslov);
                    }

                    let prisustvaRed = document.createElement('tr');

                    for(let l = 1; l <= podaci.brojPredavanjaSedmicno; l++) {
                        let prisustvoKolona = document.createElement('td');
                       
                            if(l <= prisustvo.predavanja) prisustvoKolona.classList.add('zeleno');
                            else prisustvoKolona.classList.add('crveno');

                            prisustvoKolona.onclick = () => {
                                if( prisustvoKolona.classList.contains('zeleno') ) {
                                    prisustvoKolona.classList.remove('zeleno');
                                    prisustvoKolona.classList.add('crveno');
                                    PoziviAjax.postPrisustvo(podaci.predmet, podaci.studenti[i].index,
                                        { sedmica: trenutnaSedmica, predavanja: prisustvo.predavanja - 1, vjezbe: prisustvo.vjezbe }, (greska, serverPodaci) => {
                                            if(!greska) {
                                                podaci = serverPodaci;
                                                inicijaliziraj();
                                            } else {
                                                console.log(greska);
                                            }
                                        });
                                } else {
                                    prisustvoKolona.classList.remove('crveno');
                                    prisustvoKolona.classList.add('zeleno');
    
                                    let body = {
                                        sedmica: trenutnaSedmica
                                    }
    
                                    if(!prisustvo.hasOwnProperty('predavanja')) {
                                        body.predavanja = 1;
                                    } else {
                                        body.predavanja = prisustvo.predavanja + 1;
                                        body.vjezbe = prisustvo.vjezbe;
                                    }
    
                                    PoziviAjax.postPrisustvo(podaci.predmet, podaci.studenti[i].index,
                                        body, (greska, serverPodaci) => {
                                            if(!greska) {
                                                podaci = serverPodaci;
                                                inicijaliziraj();
                                            } else {
                                                console.log(greska);
                                            }
                                        });
                                }
                            }
                        
                        prisustvaRed.append(prisustvoKolona);
                    }

                    for(let l = 1; l <= podaci.brojVjezbiSedmicno; l++) {
                        let prisustvoKolona = document.createElement('td');
                      
                            if(l <= prisustvo.vjezbe) prisustvoKolona.classList.add('zeleno');
                            else prisustvoKolona.classList.add('crveno');

                            prisustvoKolona.onclick = () => {
                                if( prisustvoKolona.classList.contains('zeleno') ) {
                                    prisustvoKolona.classList.remove('zeleno');
                                    prisustvoKolona.classList.add('crveno');
                                    PoziviAjax.postPrisustvo(podaci.predmet, podaci.studenti[i].index,
                                        { sedmica: trenutnaSedmica, predavanja: prisustvo.predavanja, vjezbe: prisustvo.vjezbe - 1 }, (greska, serverPodaci) => {
                                            if(!greska) {
                                                podaci = serverPodaci;
                                                inicijaliziraj();
                                            } else {
                                                console.log(greska);
                                            }
                                        });
                                } else {
                                    prisustvoKolona.classList.remove('crveno');
                                    prisustvoKolona.classList.add('zeleno');
    
                                    let body = {
                                        sedmica: trenutnaSedmica
                                    }
    
                                    if(!prisustvo.hasOwnProperty('vjezbe')) {
                                        body.vjezbe = 1;
                                    }  else {
                                        body.predavanja = prisustvo.predavanja;
                                        body.vjezbe = prisustvo.vjezbe + 1;
                                    }
    
                                    PoziviAjax.postPrisustvo(podaci.predmet, podaci.studenti[i].index,
                                        body, (greska, serverPodaci) => {
                                            if(!greska) {
                                                podaci = serverPodaci;
                                                inicijaliziraj();
                                            } else {
                                                console.log(greska);
                                            }
                                        });
                                }
                            }

                        prisustvaRed.append(prisustvoKolona);
                    }

                    prisustvoTabela.append(nasloviRed);
                    prisustvoTabela.append(prisustvaRed);

                    kolona.append(prisustvoTabela);

                    red.append(kolona);
                }


            }

            tabela.append(red);
        }

        div.append(tabela);
    }

    let prethodnaSedmica = () => {
        if(trenutnaSedmica !== 1) {
            trenutnaSedmica--;
            inicijaliziraj();
        }
    }

    let sljedecaSedmica = () => {
        if(trenutnaSedmica !== posljednjaSedmica) {
            trenutnaSedmica++;
            inicijaliziraj();
        }
    }

    let dodajStrelice = () => {
        let strelice = document.createElement('div');
        strelice.classList.add('strelice');

        let lijevo = document.createElement('img');
        lijevo.src = './arrow-left-solid.svg';
        lijevo.classList.add('strelica');
        lijevo.onclick = prethodnaSedmica;

        let desno = document.createElement('img');
        desno.src = './arrow-right-solid.svg';
        desno.classList.add('strelica');
        desno.onclick = sljedecaSedmica;

        strelice.append(lijevo);
        strelice.append(desno);
        div.append(strelice);
    }

    let validacija = () => {
        if(!podaci) return 'Nema podataka';
        if(!podaci.hasOwnProperty('predmet')) return 'Nedostaje naziv predmeta';
        if(!podaci.hasOwnProperty('brojPredavanjaSedmicno')) return 'Nedostaje broj predavanja sedmicno';
        if(!podaci.hasOwnProperty('brojVjezbiSedmicno')) return 'Nedostaje broj vjezni sedmicno';
        if(!podaci.hasOwnProperty('studenti')) return 'Podaci o prisustvu nisu validni - Nedostaju studenti';
        if(!podaci.hasOwnProperty('prisustva')) return 'Podaci o prisustvu nisu validni - Nedostaju prisustva';

        // Validacija studenata
        if(!Array.isArray(podaci.studenti)) return 'Podaci o prisustvu nisu validni - Studenti nisu niz';

        for(let i = 0; i < podaci.studenti.length; i++)
            if( !podaci.studenti[i].ime || !podaci.studenti[i].index)
                return 'Podaci o prisustvu nisu validni - Svi studenti nemaju polje "ime" i "index"';

        for(let i = 0; i < podaci.studenti.length; i++)
            for(let j = i + 1; j < podaci.studenti.length; j++)
                if( podaci.studenti[i].index === podaci.studenti[j].index )
                    return 'Podaci o prisustvu nisu validni - Postoji vise studenata sa istim poljem "index"';

        // Validacija prisustva
        if(!Array.isArray(podaci.prisustva)) return 'Podaci o prisustvu nisu validni - Prisustva nisu niz';

        for(let i = 0; i < podaci.prisustva.length; i++)
            if(!podaci.prisustva[i].hasOwnProperty('sedmica') || !podaci.prisustva[i].hasOwnProperty('predavanja')
            || !podaci.prisustva[i].hasOwnProperty('vjezbe') || !podaci.prisustva[i].hasOwnProperty('index'))
                return 'Podaci o prisustvu nisu validni - Sva prisustva nemaju polje "sedmica", "predavanja", "vjezbe" i "index"';

        for(let i = 0; i < podaci.prisustva.length; i++) {
            if( podaci.prisustva[i].predavanja > podaci.brojPredavanjaSedmicno
                || podaci.prisustva[i].vjezbe > podaci.brojVjezbiSedmicno)
                return 'Podaci o prisustvu nisu validni - ' +
                    'Broj predavanja/vjezbi u prisustvu je veci od sedmicnog broja predavanja/vjezbi';

            if( podaci.prisustva[i].predavanja < 0 || podaci.prisustva[i].vjezbe < 0)
                return 'Podaci o prisustvu nisu validni - ' +
                    'Broj predavanja/vjezbi u prisustvu je manji od 0';
        }

        for(let i = 0; i < podaci.prisustva.length; i++)
            for(let j = i + 1; j < podaci.prisustva.length; j++)
                if( podaci.prisustva[i].sedmica === podaci.prisustva[j].sedmica &&
                podaci.prisustva[i].index === podaci.prisustva[j].index)
                    return 'Podaci o prisustvu nisu validni - ' +
                        'Isti student ima unesene podatke o prisustvu u istoj sedmici vise puta';

        for(let i = 0; i < podaci.prisustva.length; i++) {
            let indexPostoji = false;

            for(let j = 0; j < podaci.studenti.length; j++) {
                if( podaci.prisustva[i].index === podaci.studenti[j].index ) {
                    indexPostoji = true;
                    break;
                }
            }

            if( !indexPostoji ) return 'Podaci o prisustvu nisu validni - ' +
                'Uneseno prisustvo za studenta sa indexom koji se ne nalazi u listi studenata';
        }

        if(podaci.prisustva.length) {
            let maxSedmica = podaci.prisustva[0].sedmica;

            for(let i = 1; i < podaci.prisustva.length; i++)
                if(podaci.prisustva[i].sedmica > maxSedmica)
                    maxSedmica = podaci.prisustva[i].sedmica;

            for(let i = 1; i <= maxSedmica; i++) {
                let postojiSedmica = false;

                for(let j = 0; j < podaci.prisustva.length; j++) {
                    if( podaci.prisustva[j].sedmica === i ) {
                        postojiSedmica = true;
                        break;
                    }
                }

                if(!postojiSedmica) return 'Podaci o prisustvu nisu validni - ' +
                    'Prisustvo za sedmicu ' + i + ' nije uneseno';
            }
        }

        return '';
    }

    let generisiGresku = (tekstGreske) => {
        let greska = document.createElement('h1');
        greska.classList.add('greska');
        greska.innerHTML = tekstGreske;

        div.append(greska);
    }

    let inicijaliziraj = () => {
        if(!div) return;
        
        div.innerHTML = '';

        let porukaValidacije = validacija();

        if(porukaValidacije) {
            generisiGresku(porukaValidacije);
            return;
        }

        dodajNaslove();
        dodajTabelu(); 
        dodajStrelice();
    }

    inicijaliziraj();

    return {
        prethodnaSedmica,
        sljedecaSedmica
    }
    
}