let div = document.getElementById('kontejner');

let podaci = {
    studenti: [
        {
            ime: "Neko Nekic",
            index: 1234
        },
        {
            ime: "Neko Drugi",
            index: 4321
        }
    ],
    prisustva: [
        {
            sedmica: 1,
            predavanja: 2,
            vjezbe: 2,
            index: 1234
        },
        {
            sedmica: 2,
            predavanja: 2,
            vjezbe: 0,
            index: 1234
        },
        {
            sedmica: 2,
            predavanja: 2,
            vjezbe: 0,
            index: 4321
        },
        {
            sedmica: 3,
            predavanja: 0,
            vjezbe: 0,
            index: 4321
        },
        {
            sedmica: 4,
            predavanja: 1,
            vjezbe: 1,
            index: 1234
        },
    ],
    predmet: "Razvoj Programskih Rjesenja",
    brojPredavanjaSedmicno: 3,
    brojVjezbiSedmicno: 3
}

let prisustvo = TabelaPrisustvo(div, podaci);

