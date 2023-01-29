const PoziviAjax = (()=>{
    let header = {
        tip: 'Content-Type',
        vrijednost: 'application/json'
    };

    let impl_getPredmet = (naziv,fnCallback) =>{
        let call = new XMLHttpRequest();

        call.open('GET', `predmet/${naziv}`, true);
        call.setRequestHeader(header.tip, header.vrijednost);
        call.send();

        call.onreadystatechange = () => {
            if(call.readyState === 4 && call.status === 200)
                fnCallback(undefined, JSON.parse(call.response));
            else if(call.readyState === 4 && call.status === 400)
                fnCallback(JSON.parse(call.response), undefined);
            else if(call.readyState === 4)
                fnCallback({poruka: 'Greska'}, undefined);
        }
    }

    let impl_postLogin = (username,password,fnCallback) => {
        let call = new XMLHttpRequest();

        call.open('POST', 'login', true);
        call.setRequestHeader(header.tip, header.vrijednost);
        call.send(JSON.stringify({
            username, password
        }));

        call.onreadystatechange = () => {
            if(call.readyState === 4 && call.status === 200)
                fnCallback(undefined, JSON.parse(call.response));
            else if(call.readyState === 4 && call.status === 400)
                fnCallback(JSON.parse(call.response), undefined);
            else if(call.readyState === 4)
                fnCallback({poruka: 'Greska'}, undefined);
        }
    }

    let impl_postLogout = (fnCallback) =>{
        let call = new XMLHttpRequest();

        call.open('POST', 'logout', true);
        call.setRequestHeader(header.tip, header.vrijednost);
        call.send();

        call.onreadystatechange = () => {
            if(call.readyState === 4 && call.status === 200)
                fnCallback(undefined, JSON.parse(call.response));
            else if(call.readyState === 4 && call.status === 400)
                fnCallback(JSON.parse(call.response), undefined);
            else if(call.readyState === 4)
                fnCallback({poruka: 'Greska'}, undefined);
        }
    }

    let impl_postPrisustvo = (naziv,index,prisustvo,fnCallback) => {
        let call = new XMLHttpRequest();

        call.open('POST', `prisustvo/predmet/${naziv}/student/${index}`, true);
        call.setRequestHeader(header.tip, header.vrijednost);
        call.send(JSON.stringify(prisustvo));

        call.onreadystatechange = () => {
            if(call.readyState === 4 && call.status === 200)
                fnCallback(undefined, JSON.parse(call.response));
            else if(call.readyState === 4 && call.status === 400)
                fnCallback(JSON.parse(call.response), undefined);
            else if(call.readyState === 4)
                fnCallback({poruka: 'Greska'}, undefined);
        }
    }

    let impl_getPredmeti = (fnCallback) => {
        let call = new XMLHttpRequest();

        call.open('GET', 'predmeti', true);
        call.setRequestHeader(header.tip, header.vrijednost);
        call.send();

        call.onreadystatechange = () => {
            if(call.readyState === 4 && call.status === 200)
                fnCallback(undefined, JSON.parse(call.response));
            else if(call.readyState === 4 && call.status === 400)
                fnCallback(JSON.parse(call.response), undefined);
            else if(call.readyState === 4)
                fnCallback({poruka: 'Greska'}, undefined);
        }
    }


   
    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getPredmet: impl_getPredmet,
        getPredmeti: impl_getPredmeti,
        postPrisustvo: impl_postPrisustvo
    };
})();