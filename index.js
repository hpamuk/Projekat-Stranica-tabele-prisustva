let express = require('express');
let bodyParser = require('body-parser');
let fs = require('fs');
let bcrypt = require('bcrypt');
let expressSession = require('express-session');
let db = require('./db');

const server = express();
const parser = bodyParser.json();
const publicFolder = express.static(__dirname + '/public');

server.use(parser);
server.use(publicFolder);
server.use(expressSession({
    secret: 'hena-pamuk',
    resave: true,
    saveUninitialized: true
}));

server.post('/novi-nastavnik', ({body}, res) => {
   if(!body)
       return res.status(400).send({ poruka: 'Nedostaje tijelo zahtjeva' });

   if(!body.username || !body.password || !body.predmeti || !Array.isArray(body.predmeti)) {
       return res.status(400).send({ poruka: 'Neispravno tijelo zahtjeva' });
   }

    db.Nastavnik.findOne({where: {username: body.username}}).then((nastavnik) => {
        if(nastavnik) {
            return res.status(400).send({poruka: 'Nastavnik vec postoji'});
        }

        bcrypt.hash(body.password, 10, (e, hash) => {
            if(e) return res.status(400).send({poruka: 'Greska u hashiranju passworda'});

            db.Nastavnik.create({username: body.username, password_hash: hash}).then(() => {
                db.Predmet.findAll().then((predmeti) => {
                    let noviPredmeti = [];

                    for(let i = 0; i < body.predmeti.length; i++) {
                        let postoji = false;
                        for(let j = 0; j < predmeti.length; j++) {
                            if(predmeti[j].naziv === body.predmeti[i]) {
                                postoji = true;
                            }
                        }
                        if(!postoji) {
                            noviPredmeti.push({naziv: body.predmeti[i]});
                        }
                    }

                    db.Predmet.bulkCreate(noviPredmeti).then(() => {
                        db.Predmet.findAll().then((sviPredmeti) => {
                            let nastavnikPredmetVeze = [];

                            for(let i = 0; i < body.predmeti.length; i++) {
                                let index = -1;

                                for(let j = 0; j < sviPredmeti.length; j++) {
                                    if(body.predmeti[i] === sviPredmeti[j].naziv) {
                                        index = j;
                                    }
                                }

                                if(index !== -1) {
                                    nastavnikPredmetVeze.push({
                                        predmet: sviPredmeti[index].naziv,
                                        nastavnik: body.username
                                    });
                                }
                            }

                            db.NastavnikPredmet.bulkCreate(nastavnikPredmetVeze).then(() => {
                                res.send({poruka: 'Nastavnik uspjesno kreiran' });
                            }).catch((e) => {
                                res.status(400).send({poruka: 'Greska prilikom pravljenja novih nastavnik predmet veza'});
                            });
                        }).catch((e) => {
                            res.status(400).send({poruka: 'Greska prilikom citanja tabele "Podaci"'});
                        });
                    }).catch((e) => {
                        res.status(400).send({poruka: 'Greska prilikom pravljenja novih predmeta'});
                    });
                }).catch((e) => {
                    res.status(400).send({poruka: 'Greska prilikom citanja tabele "Podaci"'});
                });
            }).catch((e) => {
                res.status(400).send({poruka: 'Greska prilikom pravljenja novog nastavnika'});
            });
        });
    }).catch((e) => {
        res.status(400).send({poruka: 'Greska prilikom citanja tabele "Nastavnik"'});
    });
});

server.post('/novo-prisustvo', ({body}, res) => {
    if(!body)
        return res.status(400).send({ poruka: 'Nedostaje tijelo zahtjeva' });

    if(!body.predmet || !body.brojPredavanjaSedmicno || !body.brojVjezbiSedmicno || !Array.isArray(body.prisustva) || !Array.isArray(body.studenti)) {
        return res.status(400).send({ poruka: 'Neispravno tijelo zahtjeva' });
    }

    db.Predmet.findOne({where: {naziv: body.predmet}}).then((predmet) => {
        if(!predmet) {
            return res.status(400).send({poruka: 'Navedeni predmet ne postoji'});
        }

        if(predmet.brojVjezbiSedmicno || predmet.brojPredavanjaSedmicno) {
            return res.status(400).send({poruka: 'Navedeni predmet vec ima unesene inicijalne podatke!'});
        }

        predmet.brojVjezbiSedmicno = body.brojVjezbiSedmicno;
        predmet.brojPredavanjaSedmicno = body.brojPredavanjaSedmicno;

        predmet.save().then((predmet) => {
            db.Student.findAll().then((studenti) => {
                let noviStudenti = [];

                for(let i = 0; i < body.studenti.length; i++) {
                    let postoji = false;

                    for(let j = 0; j < studenti.length; j++) {
                        if( body.studenti[i].index === studenti[j].index ) {
                            postoji = true;
                        }
                    }

                    if(!postoji) {
                        noviStudenti.push(body.studenti[i]);
                    }
                }

                db.Student.bulkCreate(noviStudenti).then(() => {
                    db.Student.findAll().then((studenti2) => {
                        let studentPredmetVeze = [];

                        for(let i = 0; i < studenti2.length; i++) {
                            let postoji = false;

                            for(let j = 0; j < body.studenti.length; j++) {
                                if(body.studenti[j].index === studenti2[i].index) {
                                    postoji = true;
                                }
                            }

                            if(postoji) {
                                studentPredmetVeze.push({
                                    index: studenti2[i].index,
                                    predmet: predmet.naziv
                                });
                            }
                        }

                        db.StudentPredmet.bulkCreate(studentPredmetVeze).then(() => {
                            let prisustva = [];

                            for(let i = 0; i < body.prisustva.length; i++) {
                                prisustva.push({
                                    vjezbe: body.prisustva[i].vjezbe,
                                    predavanja: body.prisustva[i].predavanja,
                                    sedmica: body.prisustva[i].sedmica,
                                    index: body.prisustva[i].index,
                                    predmet: predmet.naziv
                                });
                            }

                            db.Prisustvo.bulkCreate(prisustva).then(() => {
                                res.send({poruja: 'Prisustva uspjesno kreirana'});
                            }).catch((e) => {
                                res.status(400).send({poruka: 'Greska prilikom pisanja u tabelu "Prisustvo"'});
                            });
                        }).catch((e) => {
                            res.status(400).send({poruka: 'Greska prilikom pisanja u tabelu "Student_Predmet"'});
                        })
                    });
                }).catch((e) => {
                    res.status(400).send({poruka: 'Greska prilikom pisanja u tabelu "Student"'});
                });
            }).catch((e) => {
                res.status(400).send({poruka: 'Greska prilikom citanja tabele "Student"'});
            });
        }).catch((e) => {
            res.status(400).send({poruka: 'Greska prilikom pisanja u tabelu "Predmet"'});
        });
    }).catch((e) => {
        res.status(400).send({poruka: 'Greska prilikom citanja tabele "Predmet"'});
    });
});

server.post('/login', ({body, session}, res) => {
    if(session.username || session.predmeti)
        return res.status(400).send({poruka: 'Vec ste prijavljeni'});

    if(!body)
        return res.status(400).send({ poruka: 'Nedostaje tijelo zahtjeva' });

    if(!body.username || !body.password) {
        return res.status(400).send({ poruka: 'Neuspjesna prijava' });
    }

    db.Nastavnik.findOne({where: {username: body.username}}).then((nastavnik) => {
        if(!nastavnik) {
           return res.status(400).send({poruka: 'Neuspjesna prijava'});
       }

        bcrypt.compare(body.password, nastavnik.password_hash, (e, podaci) => {
            if(e) return res.status(400).send({poruka: 'Neuspjesna prijava'});

            if(podaci) {
                db.NastavnikPredmet.findAll({where: {nastavnik: nastavnik.username}}).then((nastavnikPredmetVeze) => {
                    db.Predmet.findAll().then((predmeti) => {
                        let naziviPredmeta = [];

                        for(let i = 0; i < nastavnikPredmetVeze.length; i++) {
                            let postoji = false;


                            for(let j = 0; j < predmeti.length; j++) {
                                if(nastavnikPredmetVeze[i].predmet === predmeti[j].naziv) {
                                    postoji = true;
                                }
                            }

                            if(postoji) {
                                naziviPredmeta.push(nastavnikPredmetVeze[i].predmet);
                            }
                        }

                        session.username = body.username;
                        session.predmeti = naziviPredmeta;
                        res.send({poruka: 'Uspjesna prijava'});
                    }).catch((e) => {
                        res.status(400).send({poruka: 'Greska prilikom citanja tabele "Predmet"'});
                    });
                }).catch((e) => {
                    res.status(400).send({poruka: 'Greska prilikom citanja tabele "Nastavnik_Predmet"'});
                });
            }
            else {
                res.send({poruka: 'Neuspjesna prijava'});
            }
        });
    }).catch((e) => {
        res.status(400).send({poruka: 'Greska prilikom citanja tabele "Nastavnik"'});
    });
});

server.post('/logout', ({session}, res) => {
    if(!session.username || !session.predmeti)
        return res.status(400).send({poruka: 'Morate biti prijavljeni da biste se mogli odjaviti'});

    session.username = null;
    session.predmeti = null;

    res.send({poruka: 'Uspjesna odjava'});
});

server.get('/predmeti', ({session}, res) => {
    if(!session.username || !session.predmeti)
        return res.status(400).send({poruka: 'Nastavnik nije loginovan'});

    res.send(session.predmeti);
});

server.get('/predmet/:NAZIV', ({params}, res) => {
    if(!params)
        return res.status(400).send({ poruka: 'Nedostaju parametri zahtjeva' });

    if(!params.NAZIV) {
        return res.status(400).send({ poruka: 'Nedostaje parametar "NAZIV"' });
    }

    let povratnaInformacija = {
        predmet: '',
        brojPredavanjaSedmicno: 0,
        brojVjezbiSedmicno: 0,
        studenti: [],
        prisustva: []
    };

    db.Predmet.findOne({where: {naziv: params.NAZIV}}).then((predmet) => {
        if(!predmet) {
            return res.status(400).send({poruka: 'Predmet ne postoji'});
        }

        povratnaInformacija.predmet = predmet.naziv;
        povratnaInformacija.brojPredavanjaSedmicno = predmet.brojPredavanjaSedmicno;
        povratnaInformacija.brojVjezbiSedmicno = predmet.brojVjezbiSedmicno;

        db.StudentPredmet.findAll({where: {predmet: predmet.naziv}}).then((studentPredmetVeze) => {
            db.Student.findAll().then((studenti) => {
                for(let i = 0; i < studentPredmetVeze.length; i++) {
                    let index = -1;
                    for(let j = 0; j < studenti.length; j++) {
                        if(studentPredmetVeze[i].index === studenti[j].index) {
                            index = j;
                            break;
                        }
                    }

                    if(index !== -1) {
                        povratnaInformacija.studenti.push(studenti[index]);
                    }
                }

                db.Prisustvo.findAll({where: { predmet: predmet.naziv }}).then((prisustva) => {
                    for(let i = 0; i < prisustva.length; i++) {
                        let index = -1;
                        for(let j = 0; j < studenti.length; j++) {
                            if(prisustva[i].index === studenti[j].index) {
                                index = i;
                                break;
                            }
                        }

                        if(index !== -1) {
                            povratnaInformacija.prisustva.push({
                                index: prisustva[index].index,
                                sedmica: prisustva[index].sedmica,
                                predavanja: prisustva[index].predavanja,
                                vjezbe: prisustva[index].vjezbe
                            });
                        }
                    }

                    res.send(povratnaInformacija);
                }).catch((e) => {
                    res.status(400).send({poruka: 'Greska prilikom citanja tabele "Prisustvo"'});
                });
            }).catch((e) => {
                res.status(400).send({poruka: 'Greska prilikom citanja tabele "Student_Predmet"'});
            });
        }).catch((e) => {
            res.status(400).send({poruka: 'Greska prilikom citanja tabele "Student_Predmet"'});
        });
    }).catch((e) => {
        res.status(400).send({poruka: 'Greska prilikom citanja tabele "Predmet"'});
    });
});

server.post('/prisustvo/predmet/:NAZIV/student/:index', ({params,body}, res) => {

    if(!body)
        return res.status(400).send({ poruka: 'Nedostaje tijelo zahtjeva' });

    if(!body.hasOwnProperty('sedmica') && (!body.hasOwnProperty('predavanja') || !body.hasOwnProperty('vjezbe'))) {
        return res.status(400).send({ poruka: 'Neispravno tijelo zahtjeva' });
    }

    if(!params)
        return res.status(400).send({ poruka: 'Nedostaju parametri zahtjeva' });

    if(!params.NAZIV || !params.index) {
        return res.status(400).send({ poruka: 'Nedostaju parametri zahtjeva' });
    }

    db.Predmet.findOne({where: { naziv: params.NAZIV }}).then((predmet) => {
        if(!predmet) {
            return res.status(400).send({poruka: 'Navedeni predmet ne postoji'});
        }

        db.Student.findOne({where: {index: params.index}}).then((student) => {
            if(!student) {
                return res.status(400).send({poruka: 'Navedeni student ne postoji'});
            }

            db.StudentPredmet.findOne({where: {index: params.index, predmet: params.NAZIV}}).then((studentPredmetVeza) => {
                if(!studentPredmetVeza) {
                    return res.status(400).send({poruka: 'Navedeni student nije upisan na navedeni predmet'});
                }

                db.Prisustvo.findOne({where: {index: params.index, predmet: params.NAZIV, sedmica: body.sedmica}}).then((prisustvo) => {
                    if(!prisustvo) {

                        db.Prisustvo.create({
                            predavanja: body.predavanja,
                            vjezbe: body.vjezbe,
                            index: params.index,
                            predmet: params.NAZIV,
                            sedmica: body.sedmica
                        }).then(() => {
                            // Potrebno kreirati isti format za vracanje
                            let povratnaInformacija = {
                                predmet: predmet.naziv,
                                brojPredavanjaSedmicno: predmet.brojPredavanjaSedmicno,
                                brojVjezbiSedmicno: predmet.brojVjezbiSedmicno,
                                studenti: [],
                                prisustva: []
                            };

                            db.StudentPredmet.findAll({where: {predmet: predmet.naziv}}).then((studentPredmetVeze) => {
                                db.Student.findAll().then((studenti) => {
                                    for(let i = 0; i < studentPredmetVeze.length; i++) {
                                        let index = -1;
                                        for(let j = 0; j < studenti.length; j++) {
                                            if(studentPredmetVeze[i].index === studenti[j].index) {
                                                index = j;
                                                break;
                                            }
                                        }

                                        if(index !== -1) {
                                            povratnaInformacija.studenti.push({
                                                ime: studenti[index].ime,
                                                index: studenti[index].index
                                            });
                                        }
                                    }

                                    db.Prisustvo.findAll({where: { predmet: predmet.naziv }}).then((prisustva) => {
                                        for(let i = 0; i < prisustva.length; i++) {
                                            let index = -1;
                                            for(let j = 0; j < studenti.length; j++) {
                                                if(prisustva[i].index === studenti[j].index) {
                                                    index = i;
                                                    break;
                                                }
                                            }

                                            if(index !== -1) {
                                                povratnaInformacija.prisustva.push({
                                                    index: prisustva[index].index,
                                                    sedmica: prisustva[index].sedmica,
                                                    predavanja: prisustva[index].predavanja,
                                                    vjezbe: prisustva[index].vjezbe
                                                });
                                            }
                                        }

                                        console.log(povratnaInformacija);

                                        res.send(povratnaInformacija);
                                    }).catch((e) => {
                                        res.status(400).send({poruka: 'Greska prilikom citanja tabele "Prisustvo"'});
                                    });
                                }).catch((e) => {
                                    res.status(400).send({poruka: 'Greska prilikom citanja tabele "Student_Predmet"'});
                                });
                            }).catch((e) => {
                                res.status(400).send({poruka: 'Greska prilikom citanja tabele "Student_Predmet"'});
                            });
                        }).catch((e) => {
                            res.status(400).send({poruka: 'Greska prilikom pisanja u tabelu "Prisustvo"'});
                        });
                    } else {

                        prisustvo.predavanja = body.predavanja;
                        prisustvo.vjezbe = body.vjezbe;

                        prisustvo.save().then(() => {
                            // Potrebno kreirati isti format za vracanje
                            let povratnaInformacija = {
                                predmet: predmet.naziv,
                                brojPredavanjaSedmicno: predmet.brojPredavanjaSedmicno,
                                brojVjezbiSedmicno: predmet.brojVjezbiSedmicno,
                                studenti: [],
                                prisustva: []
                            };

                            db.StudentPredmet.findAll({where: {predmet: predmet.naziv}}).then((studentPredmetVeze) => {
                                db.Student.findAll().then((studenti) => {
                                    for(let i = 0; i < studentPredmetVeze.length; i++) {
                                        let index = -1;
                                        for(let j = 0; j < studenti.length; j++) {
                                            if(studentPredmetVeze[i].index === studenti[j].index) {
                                                index = j;
                                                break;
                                            }
                                        }

                                        if(index !== -1) {
                                            povratnaInformacija.studenti.push({
                                                ime: studenti[index].ime,
                                                index: studenti[index].index
                                            });
                                        }
                                    }

                                    db.Prisustvo.findAll({where: { predmet: predmet.naziv }}).then((prisustva) => {
                                        for(let i = 0; i < prisustva.length; i++) {
                                            let index = -1;
                                            for(let j = 0; j < studenti.length; j++) {
                                                if(prisustva[i].index === studenti[j].index) {
                                                    index = i;
                                                    break;
                                                }
                                            }

                                            if(index !== -1) {
                                                povratnaInformacija.prisustva.push({
                                                    index: prisustva[index].index,
                                                    sedmica: prisustva[index].sedmica,
                                                    predavanja: prisustva[index].predavanja,
                                                    vjezbe: prisustva[index].vjezbe
                                                });
                                            }
                                        }

                                        res.send(povratnaInformacija);
                                    }).catch((e) => {
                                        res.status(400).send({poruka: 'Greska prilikom citanja tabele "Prisustvo"'});
                                    });
                                }).catch((e) => {
                                    res.status(400).send({poruka: 'Greska prilikom citanja tabele "Student_Predmet"'});
                                });
                            }).catch((e) => {
                                res.status(400).send({poruka: 'Greska prilikom citanja tabele "Student_Predmet"'});
                            });
                        });
                    }
                }).catch((e) => {
                    res.status(400).send({poruka: 'Greska prilikom pisanja u tabelu "Prisustvo"'});
                });
            }).catch((e) => {
                res.status(400).send({poruka: 'Greska prilikom citanja tabele "Student_Predmet"'});
            });
        }).catch((e) => {
            res.status(400).send({poruka: 'Greska prilikom citanja tabele "Student"'});
        });
    }).catch((e) => {
        res.status(400).send({poruka: 'Greska prilikom citanja tabele "Predmet"'});
    });
});

db.sync().then(() => {
    server.listen(3000);
});



