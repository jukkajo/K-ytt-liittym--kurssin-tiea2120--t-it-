/* global React */
/* global ReactDOM */

"use strict";

class Jatkanshakki extends React.PureComponent {
    constructor(props) {
        super(props);

//===========================
this.aloitaPeli = this.aloitaPeli.bind(this);
this.resetoi = this.resetoi.bind(this);
this.laudanKoonHandler = this.laudanKoonHandler.bind(this);
this.nimen1Handler = this.nimen1Handler.bind(this);
this.nimen2Handler = this.nimen2Handler.bind(this);
this.asetaVoittorivi = this.asetaVoittorivi.bind(this);
this.ruudunKoonMuutos = this.ruudunKoonMuutos.bind(this);
this.annaFontinKoko = this.annaFontinKoko.bind(this);
this.annasbLeveys = this.annasbLeveys.bind(this);
//===========================

//tila ennen käyttäjän syötteitä
// oletusarvoja, jotka muuttuvat myöhemmin
this.state = {
    peliKaynnissa : false,
    //==käyttäjän syöte===
    pelaaja1 : "",
    pelaaja2 : "",
    voittorivinPituus : 3,
    laudanKoko : 10,
    //====================
    ruudunKoko : 70,
    fontinKoko : 60,
    ikkunanLeveys : 768,
    sbLeveys : 19
};
    }

componentDidMount() {
    window.addEventListener("resize", this.ruudunKoonMuutos);
}

componentWillUnMount() {
    window.removeEventListener("resize", this.ruudunKoonMuutos);
}

/*
* Jos nimien kentissä syöte niin pelin tila => käynnissä
*/
aloitaPeli(event) {
    event.preventDefault();
    //====================================
    let ruudunKoko = this.annaRuudunKoko();
    let fontinKoko = this.annaFontinKoko();
    let pel1 = this.state.pelaaja1.trim();
    let pel2 = this.state.pelaaja2.trim();
    if(pel1.length != 0  && pel2.length != 0) {
        this.setState({peliKaynnissa : true, ruudunKoko : ruudunKoko, fontinKoko : fontinKoko});
    }
}

/*
* alustaa tietoja lomakkeelle
*/
resetoi(event) {
    event.preventDefault();
    this.setState({ peliKaynnissa : false,
        pelaaja1 : "",
        pelaaja2 : "",
        laudanKoko : 10,
        voittorivinPituus : 3});
}

/*
* päivittää skaalautuvat arvot tilaan
*/
ruudunKoonMuutos() {
    let ruudunKoko = this.annaRuudunKoko();
    let ikkunanLeveys = this.annaIkkunanLeveys();
    let fontinKoko = this.annaFontinKoko();
    let sbLeveys = this.annasbLeveys();
    this.setState({ruudunKoko : ruudunKoko, ikkunanLeveys : ikkunanLeveys, fontinKoko : fontinKoko, sbLeveys : sbLeveys});

}

/*
*Laskee yksittäisen ruudun koon. En halunnut että scrollbar
menee laudan viimeisen sarakkeen ruutujen päälle, niin se huomoitu.
*/
annaRuudunKoko() {

    let scrollbarLeveys = this.state.sbLeveys;
    console.log(scrollbarLeveys);
    let ikkunanLeveys = this.annaIkkunanLeveys();
    let lkoko = this.state.laudanKoko;
    let ruudunKoko = (ikkunanLeveys - (scrollbarLeveys * 2)) / lkoko;

    ruudunKoko = Math.floor(ruudunKoko);
    return ruudunKoko;

}

annasbLeveys() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

/*
* palauttaa ikkunan leveyden
*/
annaIkkunanLeveys() {
    return (
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
      );
  
}

/*
* laskee fontin koon suhteessa ruudun sivuun
*/
annaFontinKoko() {
    let fkoko = this.annaRuudunKoko();
    return Math.floor(fkoko/2.5);
}

/*
* nimikentän 1 validointi
*/
nimen1Handler(event) {
    this.setState({pelaaja1 : event.target.value });

    if(this.state.pelaaja1.length === 0) {
        event.target.setCustomValidity("Anna tähän pelaaja");
        event.target.reportValidity();
    } 
    else {
        event.target.setCustomValidity("");
    }

}

/*
* nimikentän 2 validointi
*/
nimen2Handler(event) {
    this.setState({pelaaja2 : event.target.value });

    if(this.state.pelaaja2.length === 0) {
        event.target.setCustomValidity("Anna tähänkin pelaaja");
        event.target.reportValidity();
    } else {
        event.target.setCustomValidity("");
    }
}

/*
* päivittää laudan koon tilaan
*/
laudanKoonHandler(event) {
    this.setState({laudanKoko : parseInt(event.target.value) });
    //this.ruudunKoonMuutos();
}

/*
* voittorivin pituuden tilaan
*/
asetaVoittorivi(event) {
    this.setState({voittorivinPituus : parseInt(event.target.value) });
}

/*
* palauttaa tekstin sliderin muutokselle
*/
palautaT1(luku) {
let koko = " " + luku + " X " + luku;
return koko;
}

//===========================
    render() {
        let teksti1 = this.palautaT1(this.state.laudanKoko);
        let teksti2 = " " + this.state.voittorivinPituus;

        if(this.state.peliKaynnissa === true) {
            return (
                <div id="uloin">
                <h1>Jätkänshakki</h1>
                <div id="muutosalue2">
                <form id="peliformi" onSubmit={this.resetoi}><button id="paluuPainike" type="submit">Palaa alkunäkymään</button></form>
                <Lauta fontinKoko={this.state.fontinKoko} ruudunKoko={this.state.ruudunKoko} vrivinPituus={this.state.voittorivinPituus} laudanKoko={this.state.laudanKoko} pelaaja1={this.state.pelaaja1} pelaaja2={this.state.pelaaja2}></Lauta>
                </div>
                </div>
            );

        }

        else {
        return (
            <div id="uloin">
            <h1>Jätkänshakki</h1>
            <div id="muutosalue1">
            <form action="" id="lomake" onSubmit={this.aloitaPeli}>
            <h2>Pelin Asetukset</h2>
            <fieldset>

            <div id="pelaajat">
            <label id="pel1">Pelaaja1
            <input type="text" id="pelaaja1" name="pelaaja1" value={this.state.pelaaja1} onChange={this.nimen1Handler}/>
            </label>
            <label>Pelaaja2
            <input type="text" id="pelaaja2" name="pelaaja2"  value={this.state.pelaaja2} onChange={this.nimen2Handler}/>
            </label>
            </div>

            <div>
            <p>Pelilaudan koko:</p>
            <input type="range" min="10" max="20" step="1" id="slider1" value={this.state.laudanKoko} onChange={this.laudanKoonHandler}/>
            <label htmlFor="slider1">{teksti1}</label>

            <p>Voittorivin pituus:</p>
            <input type="range" min="3" max="10" step="1" id="slider2" value={this.state.voittorivinPituus} onChange={this.asetaVoittorivi}/>
            <label htmlFor="slider2">{teksti2}</label>
            </div>

            <input
            type="submit"
            id="lomakkeenButton"
            form="lomake"
            value="Aloita peli"
            />
            </fieldset>
            </form>
            </div>
            </div>
        );
        }
    }
}

class Lauta extends React.PureComponent {
    constructor(props) {
        super(props);
        this.ruudunClickHandler = this.ruudunClickHandler.bind(this);
        this.pelintilanne = this.pelintilanne.bind(this);
        this.laudanRivi = this.laudanRivi.bind(this);
        this.naytaSeuraavaSiirto = this.naytaSeuraavaSiirto.bind(this);
        this.laudanRuutu = this.laudanRuutu.bind(this);
        this.pelilauta = this.pelilauta.bind(this);
        //=================================================
        this.state = {
            lauta : Array(this.props.laudanKoko).fill().map(rivi => Array(this.props.laudanKoko).fill("")),
            pelaajan1Vuoro : true, //pelaaja1 => (merkki="risti")
            voittoRuutu : [],
            voittaja : 0
        }
    }

    /*
    * palauttaa tekstin siirtovuorosta
    */
    naytaSeuraavaSiirto() {
        let vuoro = this.state.pelaajan1Vuoro;
        if(vuoro) {
            return ("Pelaajan " + this.props.pelaaja1  + " vuoro, pelimerkki = X");
        } else { return ("Pelaajan " + this.props.pelaaja2 + " vuoro, pelimerkki = O"); }

    }

    /*
    * rivi laudalla
    */
    laudanRivi(pelinlauta, y) {
        let ruudut = [];
        let A = "R" + y;
        for(let indeksi in pelinlauta[y]) {
            ruudut.push(this.laudanRuutu(y, indeksi));
        }

        return ( <div key={A} className="laudanRivi"> {ruudut} </div> );
    }

    /*
    * tyhja || X || O, jos voittorivin pituus
      täyttyy, niin luokan nimi = "korostus"
     */
    laudanRuutu(y, x) {
        let luokka = "ruutu";
        let vR = this.state.voittoRuutu;
        let A = "A" + x;
        //============================
        if (this.state.voittaja > 0) {
            for(let i = 0; i < vR.length; i++) {
            if(parseInt(vR[i][0]) === parseInt(y) && parseInt(vR[i][1]) === parseInt(x)) luokka = "korostus"; }
            return(
                <Ruutu fontinKoko={this.props.fontinKoko} ruudunKoko={this.props.ruudunKoko} key={A} value={this.state.lauta[y][x]}  class={luokka}
                rivi={y} sarake={x} onClick={() => this.ruudunClickHandler(y,x)}/>
            );
  
        } else {
            return(
                <Ruutu fontinKoko={this.props.fontinKoko} ruudunKoko={this.props.ruudunKoko} key={A} value={this.state.lauta[y][x]}  class={luokka}
                rivi={y} sarake={x} onClick={() => this.ruudunClickHandler(y,x)}/>
            );
        }
    }


    pelilauta() {
        let pelinlauta = [...this.state.lauta];
        let rivit = [];
        for (let indeksi in pelinlauta) {
            rivit.push(this.laudanRivi(pelinlauta, indeksi));
        } return (<div id="laudanDivi" >{rivit}</div>);
    }

    /*
    * päivittää ruudun siällön click-tapahtumassa
    */
    ruudunClickHandler(y,x) {
        let vuoro = this.state.pelaajan1Vuoro;
        let lautaM = this.state.lauta;
    
        if(lautaM[y][x] === "" && this.state.voittaja === 0) {
            if(vuoro) {
                lautaM[y][x] = "X";
            }
            else {
                lautaM[y][x] = "O";
            }

            this.pelintilanne(lautaM, vuoro);
            this.setState({pelaajan1Vuoro : !vuoro, lauta : lautaM});
        }
    }

   /*
    * laskee merkkirivejä, jos vrivin pituus, täyttyy niin ilmoittaa voittajan
    */
    pelintilanne(lauta,pelaaja1) {
        let vrivi = this.props.vrivinPituus;
        let lkoko = this.props.laudanKoko;

        let vRuutu = []; let hRuutu = [];
        let tunniste = 0; let rivi = 0; let sarake = 0; let kenoSuunta1 = 0; let kenoSuunta2 = 0;
        let merkki = "";

        //========================================================

        if(pelaaja1) {
            merkki = "X";
            tunniste = 1;
        }
        else {
            merkki = "O";
            tunniste = 2;
        }

        for(let i = 0; i < lkoko ; i++) {
            for(let j = 0; j < lkoko ; j++) {
              if(lauta[i][j] === merkki) {
                for(let k = 0; k <= vrivi; k++) {
                  if(i+vrivi <= lkoko && i+k < lkoko ) {
                    if(lauta[i+k][j] === merkki) {
                        hRuutu.push([i, j]);
                        rivi++;
                    } else {
                        rivi = 0;
                      vRuutu = [];
                    }
                    if(rivi >= vrivi) {
                      for(let i = 0; i < vrivi; i++) {
                        vRuutu.push([(hRuutu[0][0]+i), hRuutu[0][1]]);
                      }
                      this.setState({voittaja : tunniste, voittoRuutu : vRuutu});
                      return;
                    }
                  }
                  if(j+vrivi <= lkoko && j+k < lkoko ) {
                    if(lauta[i][j+k] === merkki) {
                        sarake++;
                        hRuutu.push([i, j]);
                    } else {
                        sarake = 0;
                        hRuutu = [];
                    }
                    if(sarake >= vrivi) {
                      for(let i = 0; i < vrivi; i++) {
                        vRuutu.push([hRuutu[0][0], (hRuutu[0][1]+i)]);
                      }
                      this.setState({voittaja : tunniste, voittoRuutu : vRuutu});
                      return;
                    }
                  }
                  if((i+vrivi <= lkoko && j+vrivi <= lkoko ) && (i+k < lkoko && j+k < lkoko )){
                    if(lauta[i+k][j+k] === merkki) {
                        kenoSuunta1++;
                      hRuutu.push([i, j]);
                    } else {
                        kenoSuunta1 = 0;
                      hRuutu = [];
                    }
                    if(kenoSuunta1 >= vrivi) {
                      for(let i = 0; i < vrivi; i++) {
                        vRuutu.push([(hRuutu[0][0]+i), (hRuutu[0][1]+i)]);
                      }
                      this.setState({voittaja : tunniste, voittoRuutu : vRuutu});
                      return;
                    }
                  }
                  if((i-vrivi >= 0 && j+vrivi <= lkoko ) && j+k < lkoko ) {
                    if(lauta[i-k][j+k] === merkki) { 
                        kenoSuunta2++;
                      hRuutu.push([i, j]);
                    } else {
                        kenoSuunta2 = 0;
                      vRuutu = [];
                    }
                    if(kenoSuunta2 >= vrivi) {
                      for(let i = 0; i < vrivi; i++) {
                        vRuutu.push([(hRuutu[0][0]-i), (hRuutu[0][1]+i)]);
                      }
                      this.setState({voittaja : tunniste, voittoRuutu : vRuutu});
                      return;
                    }
                  }
                }
              }
            }
          }
        }
      

    render() {
        if(this.state.voittaja === 0) {
            return (
            <div id="pelilauta">
                <h3>{this.naytaSeuraavaSiirto()}</h3>
                {this.pelilauta()}
            </div>);
        }
        if(this.state.voittaja === 1) {
            return (
            <div id="pelilauta">
                <h3>Pelin voitti: {this.props.pelaaja1}</h3>
                {this.pelilauta()}
            </div>);
        }
        else {
            return (
                <div id="pelilauta">
                    <h3>Pelin voitti: {this.props.pelaaja2}</h3>
                    {this.pelilauta()}
                </div>);
        }
    }
}

class Ruutu extends React.PureComponent {
    render() {
        return(
            <button style={{width: this.props.ruudunKoko + "px", height: this.props.ruudunKoko + "px", fontSize: this.props.fontinKoko + "px"}} className={this.props.class} onClick={() => this.props.onClick()}>
            {this.props.value}
        </button>);
    }
}

ReactDOM.render(
    <Jatkanshakki />,
    document.getElementById("root")
)