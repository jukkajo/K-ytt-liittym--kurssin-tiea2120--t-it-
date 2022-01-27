"use strict";
console.log(data);
/**
 * Sovelluksen "pää"-komponentti
 */
class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.kopioi_sarja = this.kopioi_sarja.bind(this);
    this.kopioi_joukkue = this.kopioi_joukkue.bind(this);
    this.kopioi_rastit = this.kopioi_rastit.bind(this);
    //kilpailun kopioiminen
    let kilpailu = {
      nimi: data.nimi,
      alkuaika: data.alkuaika,
      loppuaika: data.loppuaika,
      kesto: data.kesto,
      leimaustavat: Array.from(data.leimaustavat),
      rastit: Array.from(data.rastit),
      joukkueet: Array.from(data.joukkueet, this.kopioi_joukkue),
      sarjat: Array.from(data.sarjat, this.kopioi_sarja),
    };

    //Joukkueiden lajittelu sarjojen keston perusteella
    kilpailu.sarjat.sort((a, b) => {
      return a.kesto - b.kesto;
    });
    let deftila = this.palautaDefault(kilpailu);
    deftila.kilpailu = kilpailu;
    this.state = deftila;

    //============================================================
    this.rasMuutosHandler = this.rasMuutosHandler.bind(this);
    this.blurHandler = this.blurHandler.bind(this);
    this.muutosHandler = this.muutosHandler.bind(this);
    this.koodiBHandler = this.koodiBHandler.bind(this);
    //============================================================
    this.submitHandler = this.submitHandler.bind(this);
    //============================================================
    this.otherClick = this.otherClick.bind(this);
    this.koordClickHandler = this.koordClickHandler.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
    this.rastinClickHandler = this.rastinClickHandler.bind(this);
    //============================================================
    this.palautaDefault = this.palautaDefault.bind(this);
  }

  componentDidMount() {
    window.addEventListener("click", this.otherClick);
  }

  ComponentWillUnmount() {
    window.removeEventListener("click", this.otherClick);
  }

  /**
   * Palauttaa lomakkeen default-tilan
   */
  palautaDefault(kilpailu) {
    let tila = {
      nimi: "",
      leimaustavat: [],
      sarja: kilpailu.sarjat[0].id,
      jasenet: ["", ""],
      rastit: [],
      onUusiJoukkue: true,
      id: undefined,
      epaValiditBoxit: [],
      mRId: undefined,
      mRK: undefined,
      kRastinId: undefined,
      mLat: undefined,
      mLon: undefined,
      kartta: undefined,
    };
    return tila;
  }

  /**
   * Syväkopioi ja palauttaa annetun joukkueen.
   */
  kopioi_joukkue(j) {
    let uudetRastit = this.kopioiJoukkueenRastit(j);
    let uusiJoukkue = {
      nimi: j.nimi,
      jasenet: Array.from(j.jasenet),
      id: j.id,
      rastit: uudetRastit,
      leimaustapa: Array.from(j.leimaustapa),
      sarja: j.sarja,
    };
    return uusiJoukkue;
  }

  /**
   * Syväkopioi ja palauttaa annetun sarjan.
   */
  kopioi_sarja(sarja) {
    let uusiSarja = {
      nimi: sarja.nimi,
      kesto: sarja.kesto,
      alkuaika: sarja.alkuaika,
      loppuaika: sarja.loppuaika,
      id: sarja.id,
    };
    return uusiSarja;
  }


  /**
   * Syväkopioi ja palauttaa syväkopion joukkueen rastilistasta.
   */
  kopioiJoukkueenRastit(joukkue) {
    let rastitKopio = [];
    for (let rasti of joukkue.rastit) {
      rastitKopio.push({
        aika: rasti.aika,
        rasti: rasti.rasti,
      });
    }
    return rastitKopio;
  }

  /**
   * palauttaa kopion kilpailun rasteista
   */
  kopioi_rastit(kilpailu) {
    let rastitU = kilpailu.rastit;
    let palautettava = [];
    for (let i = 0; i < rastitU.length; i++) {
      let kopio = {
        id: rastitU[i].id,
        koodi: rastitU[i].koodi,
        lat: rastitU[i].lat,
        lon: rastitU[i].lon
      };
      palautettava.push(kopio);
    }

    return palautettava;
  }

  /**
   *antaa joukkueen klikkausta seuraavaan tilan muutokseen
   *leimaustavat oikeassa muodossa
   */
  palautaCBValidData(L, S) {
    let leimaustapa = [];
    if (Number.isInteger(L[0]) === true) {
      for (let i = 0; i < L.length; i++) {
        leimaustapa.push(S[i]);
      }
      return leimaustapa;
    }

    else {
      return L;
    }
  }

  /**
   * Kutsuu joukkuelomakkeen input-kohtaista käsittelijää.
   */
  blurHandler(event) {
    let syote = event.target;
    if (syote.name === "nimi") {
      this.nimenBHandler(event);
    } else if (/jasen.*/.test(syote.name)) {
      this.blurHandler(event);
    }
  }

  /**
   * Käsittelee lomakkeen nimi-kentän "blurrin"
   */
  nimenBHandler(event) {
    let syote = event.target;
    let onTyhja = this.validoiSyote(syote);
    if (!onTyhja) {
      this.onkoOlemassa(syote);
    }
    let uusiNimi = syote.value.trim();
    this.setState({ nimi: uusiNimi });
  }

  /**
   * Käy läpi joukkueiden nimet, jos löytyy sama niin ilmoitus
   */
  onkoOlemassa(syote) {
    let validi = this.testaaNimi(syote.value);
    let ilmoitus = validi ? "" : "Joukkue on jo olemassa, anna eriävä nimi";
    syote.setCustomValidity(ilmoitus);
    if (!validi) {
      syote.reportValidity();
    }
    return validi;
  }

  /**
   * Tarkistaa onko kentässä syöte, space ei kelpaa
   */
  validoiSyote(syote) {
    let arvoPuuttuu = syote.validity.valueMissing;
    let tyhja = arvoPuuttuu || syote.value.trim() === '';
    let ilmoitus = tyhja ? "Anna kenttään syöte" : '';
    syote.setCustomValidity(ilmoitus);
    if (tyhja) {
      syote.reportValidity();
    }
    return tyhja;
  }

  /**
   * Testaa nimen uniikkiuden
   */
  testaaNimi(joukkueenNimi) {
    let kasiteltyNimi = joukkueenNimi.trim().toLowerCase();
    for (let joukkue of this.state.kilpailu.joukkueet) {
      if (joukkue.nimi.trim().toLowerCase() === kasiteltyNimi && joukkue.id !== this.state.id) {
        return false;
      }
    }
    return true;
  }

  /**
   * Käsittelee jäsenkentän "blurrin"
   */
  blurHandler(event) {
    let input = event.target;
    let jasenIndeksi = input.name[5] - 1; //'jasen2' --> 1
    let uudetJasenet = Array.from(this.state.jasenet);
    uudetJasenet[jasenIndeksi] = input.value.trim();
    this.setState({ jasenet: uudetJasenet });
  }

  /**
   * Käsittelee lomakkeen inputtien muutoksen, esim.
   * tilan päivityksen tai käsittelijöiden kutsumisen.
   */
  muutosHandler(event) {
    let input = event.target;
    let arvo = input.value;
    let kentanNimi = input.name;
    if (kentanNimi === 'nimi') {
      this.setState({ nimi: arvo });
      input.setCustomValidity('');
    } else if (kentanNimi === 'leimaustapa') {
      this.kasitteleBoxinChange(event);
    } else if (kentanNimi === 'sarja') {
      this.setState({ sarja: +arvo });
    } else if (/jasen.*/.test(kentanNimi)) {
      this.kasitteleJasenenChange(event);
    }
  }


  /**
   * Käsittelee lomakkeen checkbox-inputtien muutoksen
   */
  kasitteleBoxinChange(event) {
    let input = event.target;
    let arvo = input.value;
    let valitutBoxit = new Set(Array.from(this.state.leimaustavat));
    if (input.checked) {
      valitutBoxit.add(arvo);
    } else {
      valitutBoxit.delete(arvo);
    }
    let uudetLeimaustavat = Array.from(valitutBoxit);
    if (uudetLeimaustavat.length === 0) {
      this.validoiLeimaustavat(input.form);
    } else {
      this.poistaCBvirhetila();
    }
    this.setState({ leimaustavat: uudetLeimaustavat });
  }

  /**
   * Poistaa leimaustavan checkboxeista customValidityt sekä poistaa "epävaliditboksit"
   * ohjelman tilasta.
   */
  poistaCBvirhetila() {
    for (let box of this.state.epaValiditBoxit) {
      box.setCustomValidity('');
    }
    this.setState({ epaValiditBoxit: [] });
  }

  /**
   * Hoitaa lomakkeen jäsenten text-inputtien muutoksen
   */
  kasitteleJasenenChange(event) {
    let input = event.target;
    let jasenIndeksi = input.name[5] - 1; //'jasen2' --> 1
    let uudetJasenet = Array.from(this.state.jasenet);
    uudetJasenet[jasenIndeksi] = input.value;
    let kaikissaTekstia = this.mjonoValidointi(uudetJasenet);
    if (kaikissaTekstia && uudetJasenet.length < 5) {
      uudetJasenet.push('');
    }
    input.setCustomValidity('');
    this.setState({ jasenet: uudetJasenet });
  }

  /**
   * Tarkistaa, ovatko kaikki merkkijonon alkiot tyhjiä vai ei
   */
  mjonoValidointi(jonot) {
    for (let jono of jonot) {
      if (!jono || jono.length === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Päivittää klikatun joukkueen tiedot stateen.
   */
  clickHandler(event) {
    event.preventDefault();
    let kohde = event.target;
    let joukkue = JSON.parse(kohde.dataset.joukkue);
    let uudetJasenet = joukkue.jasenet;
    if (uudetJasenet.length < 5) {
      uudetJasenet.push('');
    }
    let L = joukkue.leimaustapa; let S = this.state.kilpailu.leimaustavat;
    this.poistaCBvirhetila();
    this.setState({
      nimi: joukkue.nimi,
      leimaustavat: this.palautaCBValidData(L, S),
      sarja: joukkue.sarja,
      jasenet: uudetJasenet,
      rastit: this.kopioiJoukkueenRastit(joukkue),
      onUusiJoukkue: false,
      id: joukkue.id,
    });
  }

  /**
   * Käsittelee joukkuelomakkeen tietojen tallentamisen tilan kilpailun
   * joukkueeksi.
   */
  submitHandler(event) {
    event.preventDefault();
    if (this.state.leimaustavat.length === 0) {
      let lomake = event.target;
      this.validoiLeimaustavat(lomake);
      return;
    }
    let onUusiJoukkue = this.state.onUusiJoukkue;
    let uusiIidee = onUusiJoukkue
      ? this.luoIidee(this.state.kilpailu)
      : this.state.id;

    let uudetRastit = onUusiJoukkue ? [] : Array.from(this.state.rastit);

    let uusiJoukkue = {
      nimi: this.state.nimi,
      jasenet: this.state.jasenet.filter((jasen) => jasen !== ''),
      id: uusiIidee,
      rastit: uudetRastit,
      leimaustapa: this.state.leimaustavat,
      sarja: this.state.sarja,
    };

    let kilpailu = this.state.kilpailu;
    let uusiKilpailu = {
      nimi: kilpailu.nimi,
      alkuaika: kilpailu.alkuaika,
      loppuaika: kilpailu.loppuaika,
      kesto: kilpailu.kesto,
      leimaustavat: Array.from(kilpailu.leimaustavat),
      rastit: Array.from(kilpailu.rastit),
      sarjat: Array.from(kilpailu.sarjat, this.kopioi_sarja),
      joukkueet: Array.from(kilpailu.joukkueet, this.kopioi_joukkue),
    };
    // joukkue poistetaan
    if (!onUusiJoukkue) {
      for (let i = 0; i < uusiKilpailu.joukkueet.length; i++) {
        if (uusiKilpailu.joukkueet[i].id === uusiIidee) {
          uusiKilpailu.joukkueet.splice(i, 1);
          break;
        }
      }
    }
    uusiKilpailu.joukkueet.push(uusiJoukkue);
    let uusiTila = this.palautaDefault(uusiKilpailu);
    uusiTila.kilpailu = uusiKilpailu;
    this.setState(uusiTila);
  }

  /**
   * Ilmoitus jos leimaustapaa ei ole valittu
   */
  validoiLeimaustavat(lomake) {
    let checkboxit = this.palautaCheckBoxit(lomake);
    for (let box of checkboxit) {
      box.setCustomValidity("Valittava vähintään yksi leimaustapa");
      box.reportValidity();
    }
    this.setState({ epaValiditBoxit: checkboxit });
  }

  /**
   * Luo joukkueelle tunnisteen
   */
  luoIidee(kilpailu) {
    let suurinId = 0;
    for (let joukkue of kilpailu.joukkueet) {
      if (suurinId < joukkue.id) {
        suurinId = joukkue.id;
      }
    }
    return suurinId + 1;
  }

  /**
   * Palauttaa checkboxien syötteen
   */
  palautaCheckBoxit(lomake) {
    let checkboxit = [];
    for (let elem of lomake.elements) {
      if (elem.name === "leimaustapa") {
        checkboxit.push(elem);
      }
    }
    return checkboxit;
  }

  /**
   *Lisää koodin tilaan, jos se on muutettu
   */
  koodiBHandler(event) {
    let inpKentta = event.target;
    let kilpailu = this.state.kilpailu;
    //testaa ettei epävalideja merkkejä
    if (/^\d.*/.test(this.state.mRK)) {
      inpKentta.setCustomValidity("");
      let uudetRastit = this.kopioi_rastit(kilpailu);

      for (let R of uudetRastit) {
        if (R.id === this.state.mRId) {
          R.koodi = this.state.mRK;
          break;
        }
      }

      let uusiKilpailu = {
        nimi: kilpailu.nimi,
        alkuaika: kilpailu.alkuaika,
        loppuaika: kilpailu.loppuaika,
        kesto: kilpailu.kesto,
        leimaustavat: Array.from(kilpailu.leimaustavat),
        rastit: uudetRastit,
        sarjat: Array.from(kilpailu.sarjat, this.kopioi_sarja),
        joukkueet: Array.from(kilpailu.joukkueet, this.kopioi_joukkue),
      };
      this.setState({
        kilpailu: uusiKilpailu,
        mRId: undefined,
        mRK: undefined,
      });
    } else {
      inpKentta.setCustomValidity("Rastin ensimmäisen merkin on oltava numero");
      inpKentta.reportValidity();
    }
  }

  /**
   * Käsittelee rastin koodin klikkauksen
   */
  rastinClickHandler(event) {
    let id = +event.target.id.substring(5);
    let koodi = this.palautaRKoodi(id);
    this.setState({ mRId: id, mRK: koodi });
  }

  /**
   * Palauttaa kilpailun rastin koodin
   */
  palautaRKoodi(id) {
    for (let rasti of this.state.kilpailu.rastit) {
      if (rasti.id === id) {
        return rasti.koodi;
      }
    }
    return undefined;
  }

  /**
   * Käsittelee listatun rastin koodin syötteen muutoksen
   */
  rasMuutosHandler(event) {
    let input = event.target;
    input.setCustomValidity("");
    this.setState({ mRK: input.value });
  }

  /**
   * Käsittelee rastien koordinaattien klikkauksen
   */
  koordClickHandler(event) {
    let edKartta = this.state.kartta;
    if (edKartta) {
      this.kartanPoisto(edKartta);
    }

    let id = +event.target.id.substring(5);
    let rasti = this.palautaRasti(id);
    let kartta = this.alustaKartta(rasti);
    this.setState({
      kartta: kartta,
      kRastinId: id,
      mLat: rasti.lat,
      mLon: rasti.lon,
    });

  }

  /**
   * Asettaa kartan h ja w arvot nollaksi ja poistaa kartan.
   */
  kartanPoisto(kartta) {
    let div = kartta.getContainer();
    div.style.height = "0vh";
    div.style.width = "0vw";
    kartta.remove();
  }

  /**
   * Palauttaa kilpailun rastin
   */
  palautaRasti(id) {
    for (let rasti of this.state.kilpailu.rastit) {
      if (rasti.id === id) {
        return rasti;
      }
    }
    return undefined;
  }

  /**
   * Lisää rastilistan yhteyteen leaflet-kartan rastin koordinaattien muuttamiseksi
   * kokeilin tässä miten tuo markerin vaihto onnistuu defaultista toiseen
   */
  alustaKartta(rasti) {
    let kartta = new L.map('kartta' + rasti.id).setView([rasti.lat, rasti.lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>' }).addTo(kartta);
    let markeri = this.palautaMarkeri(rasti);
    markeri.addTo(kartta);
    return kartta;
  }

  /**
   * palauttaa markerin, jossa rastin koordinaatit
   */
  palautaMarkeri(rasti) {

    //====================================================
    let omaIkoni = L.icon({ iconUrl: "pointteri.png", iconSize: [55, 85], iconAnchor: [22, 94], popupAnchor: [-3, -76] });
    let ominaisuudet = { draggable: true, autoPan: true, icon: omaIkoni };
    let markeri = L.marker([rasti.lat, rasti.lon], ominaisuudet);
    //====================================================
    markeri.bindTooltip();
    markeri.on("drag", function () {
      let { lat, lng } = markeri.getLatLng();
      markeri.setTooltipContent(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    });
    markeri.on("dragend", () =>
      this.markerDropHandler(markeri.getLatLng(), rasti.id));
    return markeri;
  }

  /**
   * Lisää muuttuneet koordinaatit tilaan
   */
  markerDropHandler({ lat, lng }, id) {
    let kilpailu = this.state.kilpailu;
    this.state.kartta.setView([lat, lng]);
    let uudetRastit = this.kopioi_rastit(kilpailu);

    for (let rasti of uudetRastit) {
      if (rasti.id === id) {
        rasti.lat = lat.toFixed(6);
        rasti.lon = lng.toFixed(6);
        break;
      }
    }

    let uusiKilpailu = {
      nimi: kilpailu.nimi,
      alkuaika: kilpailu.alkuaika,
      loppuaika: kilpailu.loppuaika,
      kesto: kilpailu.kesto,
      leimaustavat: Array.from(kilpailu.leimaustavat),
      rastit: uudetRastit,
      sarjat: Array.from(kilpailu.sarjat, this.kopioi_sarja),
      joukkueet: Array.from(kilpailu.joukkueet, this.kopioi_joukkue),
    };

    this.setState({
      kilpailu: uusiKilpailu,
      mLat: lat.toFixed(6),
      mLon: lng.toFixed(6),
    });
  }

  /**
   * kuuntelee kartan ja koordinaattitekstin ulkopuolisen click-tapahtuman.
   */
  otherClick(event) {
    if (!this.state.kartta) {
      return;
    }
    let kartanDivi = this.state.kartta.getContainer();
    let ulkopuolella = !kartanDivi.contains(event.target);
    let eiKoordinaattiElem = event.target.id.substring(0, 5) !== "koord";
    if (eiKoordinaattiElem && ulkopuolella) {
      this.kartanPoisto(this.state.kartta);
      this.setState({
        kRastinId: undefined,
        kartta: undefined,
        mLat: undefined,
        mLon: undefined,
      });
    }
  }

  render() {
    return (
      <div id="container">
        <Joukkuelomake
          kilpailu={this.state.kilpailu}
          nimi={this.state.nimi}
          leimaustavat={this.state.leimaustavat}
          sarja={this.state.sarja}
          jasenet={this.state.jasenet}
          onBlur={this.blurHandler}
          onChange={this.muutosHandler}
          onSubmit={this.submitHandler}
        />
        <Joukkuelistaus
          kopioi_joukkue={this.kopioi_joukkue}
          kilpailu={this.state.kilpailu}
          onClick={this.clickHandler}
        />
        <Rastilistaus
          kilpailu={this.state.kilpailu}
          muokattavanId={this.state.mRId}
          muokattavanKoodi={this.state.mRK}
          mLat={this.state.mLat}
          mLon={this.state.mLon}
          kRastinId={this.state.kRastinId}
          kartta={this.state.kartta}
          onBlur={this.koodiBHandler}
          onKoodiClick={this.rastinClickHandler}
          onKoordClick={this.koordClickHandler}
          onChange={this.rasMuutosHandler}
        />
      </div>
    );
  }
}

/**
 * Lomake joukkueen tietojen syöttämiselle.
 */
class Joukkuelomake extends React.PureComponent {
  constructor(props) {
    super(props);
    this.submitHandler = this.submitHandler.bind(this);
  }

  submitHandler(e) {
    this.props.onSubmit(e);
  }

  render() {
    return (
      <div id="lomakkeenDivi">
        <form action="" id="lomake" onSubmit={this.submitHandler}>
          <h2>Lisää joukkue</h2>
          <JoukkueenKentat
            kilpailu={this.props.kilpailu}
            nimi={this.props.nimi}
            leimaustavat={this.props.leimaustavat}
            sarja={this.props.sarja}
            onBlur={this.props.onBlur}
            onChange={this.props.onChange}
          />
          <JasenetInputit
            jasenet={this.props.jasenet}
            onBlur={this.props.onBlur}
            onChange={this.props.onChange}
          />
          <input
            type="submit"
            id="lomakkeenButton"
            form="lomake"
            value="Tallenna"
          />
        </form>
      </div>
    );
  }
}

/**
 * Joukkueen tietojen input-elementit.
 */
class JoukkueenKentat extends React.PureComponent {
  constructor(props) {
    super(props);
    this.blurHandler = this.blurHandler.bind(this);
    this.muutosHandler = this.muutosHandler.bind(this);
  }

  blurHandler(event) {
    this.props.onBlur(event);
  }

  muutosHandler(event) {
    this.props.onChange(event);
  }

  render() {
    return (
      <fieldset id="fsetti">
        <legend>Joukkueen tiedot</legend>
        <div id="ylempi">
          <label htmlFor="nimi">Nimi</label>
          <input
            type="text"
            id="nimi"
            name="nimi"
            value={this.props.nimi}
            required
            onBlur={this.blurHandler}
            onChange={this.muutosHandler}
          />
          <label>Leimaustapa</label>
          <LtapaRuudut
            leimaustavat={this.props.kilpailu.leimaustavat}
            valitutLeimaustavat={this.props.leimaustavat}
            onChange={this.props.onChange}
            onBlur={this.props.onBlur}
          />
          <label>Sarja</label>
          <SarjaButtonit
            sarjat={this.props.kilpailu.sarjat}
            onChange={this.props.onChange}
            valittuSarja={this.props.sarja}
          />
        </div>
      </fieldset>
    );
  }
}

/**
 * Lomakkeen checkboxit leimaustavoille
 */
class LtapaRuudut extends React.PureComponent {
  constructor(props) {
    super(props);
    this.blurHandler = this.blurHandler.bind(this);
    this.muutosHandler = this.muutosHandler.bind(this);
  }

  blurHandler(event) {
    this.props.onBlur(event);
  }

  muutosHandler(event) {
    this.props.onChange(event);
  }

  render() {
    return (
      <div id="leimaustapa1">
        {this.props.leimaustavat.map((tapa) => {
          return (
            <p key={tapa}>
              <label htmlFor={tapa}>{tapa}</label>
              <input
                type="checkbox"
                name="leimaustapa"
                id={tapa}
                value={tapa}
                checked={this.props.valitutLeimaustavat.includes(tapa)}
                onChange={this.props.onChange}
                onBlur={this.blurHandler}
              />
            </p>
          );
        })}
      </div>
    );
  }
}

/**
 * Lomakkeen radiobuttonit sarjoille
 */
class SarjaButtonit extends React.PureComponent {
  constructor(props) {
    super(props);
    this.muutosHandler = this.muutosHandler.bind(this);
  }

  muutosHandler(e) {
    this.props.onChange(e);
  }

  render() {
    return (
      <div id="sarjanChooseri">
        {this.props.sarjat.map((sarja, index) => {
          return (
            <p key={sarja.id}>
            <label htmlFor={sarja.nimi}>{sarja.nimi}</label>
            <input
              type="radio"
              name="sarja"
              id={sarja.nimi}
              value={sarja.id}
              checked={sarja.id === this.props.valittuSarja}
              onChange={this.muutosHandler}/>
            </p>
          );
        })}
      </div>
    );
  }
}

/**
 * Lomakkeen jäsenkenttien inputit.
 */
class JasenetInputit extends React.PureComponent {
  constructor(props) {
    super(props);
    this.blurHandler = this.blurHandler.bind(this);
    this.muutosHandler = this.muutosHandler.bind(this);
  }

  blurHandler(e) {
    this.props.onBlur(e);
  }

  muutosHandler(e) {
    this.props.onChange(e);
  }

  render() {
    return (
      <fieldset id="jasenet">
        <legend>Jäsenet</legend>
        {this.props.jasenet.map((jasen, index) => {
          let nro = index + 1;
          return (
            <p key={nro}>
              <label htmlFor={'jasen' + nro}>{'Jäsen ' + nro}</label>
              <input
              type="text"
              id={'jasen' + nro}
              name={'jasen' + nro}
              value={this.props.jasenet[index]}
              required={index < 2 ? true : false}
              onBlur={this.blurHandler}
              onChange={this.muutosHandler}/>
            </p>
          );
        })}
      </fieldset>
    );
  }
}

/**
 * Komponentti Joukkuelistaukselle
 */
class Joukkuelistaus extends React.PureComponent {
  constructor(props) {
    super(props);
    this.annaSarjanNimi = this.annaSarjanNimi.bind(this);
  }

  /**
   * Palauttaa järjestetyt joukkueet 
   */
  annaJarjestetytJoukkueet() {
    let joukkueet = Array.from(
      this.props.kilpailu.joukkueet,
      this.props.kopioi_joukkue
    );
    joukkueet.sort((a, b) => {  //määrätään kieleksi suomi, eli sisällytetään esim. Ä
      return a.nimi.localeCompare(b.nimi, "fi", {
        sensititity: "accent",
      });
    });
    return joukkueet;
  }

  /**
   * Palauttaa sarjan
   */
  annaSarjanNimi(id) {
    for (let sarja of this.props.kilpailu.sarjat) {
      if (sarja.id === id) {
        return sarja.nimi;
      }
    }
    return "";
  }

  render() {
    let joukkueet = this.annaJarjestetytJoukkueet();
    return (
      <div id="joukkuelistausDiv">
        <h2>Joukkueet</h2>
        <ul>
          {joukkueet.map((joukkue) => {
            return (
              <JoukkueenTiedot
                key={joukkue.id}
                joukkue={joukkue}
                kilpailu={this.props.kilpailu}
                sarjanNimi={this.annaSarjanNimi(joukkue.sarja)}
                onClick={this.props.onClick} />);
          })}
        </ul>
      </div>
    );
  }
}

/**
 * Joukkueen tiedot(lista)
 */
class JoukkueenTiedot extends React.PureComponent {
  constructor(props) {
    super(props);
    this.clickHandler = this.clickHandler.bind(this);
    this.palauta2ndListaTeksti = this.palauta2ndListaTeksti.bind(this);
  }

  /**
   * Käsittelee joukkueen nimen linkin klikkauksen
   */
  clickHandler(event) {
    this.props.onClick(event);
  }

  /**
   * Palauttaa tekstin, jossa lukee joukkueen sarja ja käytetyt leimaustavat.
   */
  palauta2ndListaTeksti(sarja, leimaustavat, kilpailu) {
    let teksti2 = "";
    let ltavat = kilpailu.kilpailu.leimaustavat;

    //jos leimaustavat numeroita =>
    if (Number.isInteger(leimaustavat[0]) === true) {
      teksti2 += sarja + " (";
      for (let i = 0; i < leimaustavat.length; i++) {
        teksti2 += ltavat[i] + ", ";
      }
      teksti2 = teksti2.slice(0, -2);
      teksti2 += ")";
      return teksti2;
    }
    //jos leimaustavat nimiä =>
    else {
      teksti2 = sarja;
      let teksti = leimaustavat.reduce((S, T) => S + T + ", ", "");
      let string1 = teksti.substr(0, teksti.length - 2);
      teksti2 += " (" + string1 + ")";
      return teksti2;
    }

  }


  /**
 * Palauttaa joukkueen matkan ja pisteet => palautaListaTeksti(joukkue)-funktiolle.
 * aloitetaan laskemaan jos löytyy "LÄHTÖ", jos lisäksi "MAALI"-rasti => palautetaan pisteet ja matka
 */
  palautaKmP(joukkue, kilpailu) {
    let rastienClone = this.palautaClone(kilpailu); /* vastaavanlainen(eriniminen) funktio löytyi ylempään, 
    mutta en saaaut toimimaan tässä*/

    let pisteet = 0;
    let matka = 0;
    let edRasti;
    let loytyyLahtoRasti = false;
    let loytyyMaaliRasti = false;
    //käydään läpi joukkueen rastit
    for (let jRasti of joukkue.rastit) {

      //jos löytyy id-avain, jatketaan
      if(jRasti.rasti.hasOwnProperty("id") === true) {
      let rasti = {};
        for (let ras of rastienClone) {
          //jos löytyy kilpailun rasteista niin =>
           if (jRasti.rasti.id === ras.id) {
            rasti = ras;
            if (/^\d.*/.test(rasti.koodi)) {
              pisteet += parseInt(rasti.koodi[0]);
            }
            if(rasti.koodi === "LAHTO") {
              loytyyLahtoRasti = true;
              pisteet = 0;
              matka = 0;
              edRasti = rasti;
            }
            else {
              //ei tässä varmaan kommenttiakaan tarvitsisi olla
            }
            if(loytyyLahtoRasti === true) {
              matka += this.getDistanceFromLatLonInKm(rasti.lat, rasti.lon, edRasti.lat, edRasti.lon);
            }
            if (rasti.koodi === "MAALI") {
              loytyyMaaliRasti = true;
            }
            if(loytyyLahtoRasti === true && loytyyMaaliRasti === true) {
              matka += this.getDistanceFromLatLonInKm(rasti.lat, rasti.lon, edRasti.lat, edRasti.lon);
              return { matka: matka, pisteet: pisteet };
            }

          }
        }
      }  
    }
    return { matka: 0, pisteet: 0 };
  }

  /**
   * Palauttaa merkkijonon, missä joukkueen pisteet ja kuljettu matka.
   */
  palautaListaTeksti(joukkue, kilpailu) {
    let tulos = this.palautaKmP(joukkue, kilpailu);
    let pisteet1 = tulos.pisteet;
    let kuljettuMatka = tulos.matka;
    let palautus = "(" + pisteet1.toString() + " p, " + kuljettuMatka.toString() + " km)";
    return palautus;
  }

  palautaClone(kilpailu) {
    let rastitU = kilpailu.rastit;
    let palautettava = [];
    for (let i = 0; i < rastitU.length; i++) {
      let kopio = {
        id: rastitU[i].id,
        koodi: rastitU[i].koodi,
        lat: rastitU[i].lat,
        lon: rastitU[i].lon
      };
      palautettava.push(kopio);
    }
    return palautettava;
  }

  /**
   * Mallifunktio, laskee koordinaattien välisen etäisyyden kilometreiksi
   */
  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    let R = 6371; // Radius of the earth in km

    let dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    let dLon = this.deg2rad(lon2 - lon1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d;
  }
  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  render() {
    let listanTekstiPM = this.palautaListaTeksti(
      this.props.joukkue, this.props.kilpailu
    );
    let listanTekstiSL = this.palauta2ndListaTeksti(this.props.sarjanNimi, this.props.joukkue.leimaustapa, this.props);
    return (
      <li key={this.props.joukkue.id}>
        <p>
          <a
            href=""
            onClick={this.clickHandler}
            data-joukkue={JSON.stringify(this.props.joukkue)}
          >
            {this.props.joukkue.nimi}
          </a>
          {listanTekstiPM}
          <br />
          {listanTekstiSL}
        </p>
        <Jasenlistaus joukkue={this.props.joukkue} />
      </li>
    );
  }
}

/**
 * Komponentti joukkueen jäsenlistaukselle.
 */
class Jasenlistaus extends React.PureComponent {
  render() {
    return (
      <ul className="jasLista">
        {this.props.joukkue.jasenet.map((jasen, index) => {
          return <li key={index}>{jasen}</li>;
        })}
      </ul>
    );
  }
}

/**
 * Listaus kilpailun rasteista.
 */
class Rastilistaus extends React.PureComponent {
  render() {
    return (
      <div id="rastienDivi">
        <h2>Rastit</h2>
        <ul id="rastilistaus">
          {this.props.kilpailu.rastit.map((rasti) => {
            let koordMuutos =
              this.props.kRastinId === rasti.id;
            let mLat = koordMuutos
              ? this.props.mLat
              : undefined;
            let mLon = koordMuutos
              ? this.props.mLon
              : undefined;
            return (
              <RastinTiedot
                key={rasti.id}
                rasti={rasti}
                muokattavanId={this.props.muokattavanId}
                muokattavanKoodi={this.props.muokattavanKoodi}
                mLat={mLat}
                mLon={mLon}
                kRastinId={this.props.kRastinId}
                kartta={this.props.kartta}
                onBlur={this.props.onBlur}
                onKoodiClick={this.props.onKoodiClick}
                onKoordClick={this.props.onKoordClick}
                onChange={this.props.onChange}
              />
            );
          })}
        </ul>
        <div id="kartta"></div>
      </div>
    );
  }
}

/**
 * Rastin tiedot
 */
class RastinTiedot extends React.PureComponent {
  constructor(props) {
    super(props);
    this.koodiBHandler = this.koodiBHandler.bind(this);
    this.rastinClickHandler = this.rastinClickHandler.bind(this);
    this.rasMuutosHandler = this.rasMuutosHandler.bind(this);
    this.koordClickHandler = this.koordClickHandler.bind(this);
  }

  koodiBHandler(event) {
    this.props.onBlur(event);
  }

  rasMuutosHandler(event) {
    this.props.onChange(event);
  }

  koordClickHandler(event) {
    this.props.onKoordClick(event);
  }

  rastinClickHandler(event) {
    this.props.onKoodiClick(event);
  }

  /**
   * kartan containerin laajennus/kartan kohdistus
   */
  componentDidUpdate() {
    let koordMuutos =
      this.props.kRastinId === this.props.rasti.id;
    let kartta = this.props.kartta;
    if (kartta && koordMuutos) {
      let div = kartta.getContainer();
      div.style.height = "11vw";
      div.style.width = "18vw";
      kartta.invalidateSize();
    }
  }

  /**
   * Palauttaa inputin tai tekstin
   */
  palautaKoodiElem() {
    let rasti = this.props.rasti;
    let koodiaMuokataan = this.props.muokattavanId === rasti.id;
    let koodiElem = koodiaMuokataan ? (
      <input type="text" name="koodi" value={this.props.muokattavanKoodi} onChange={this.rasMuutosHandler} onBlur={this.koodiBHandler} autoFocus={true} />
    ) : (<p id={"koodi" + rasti.id} className="rastinkoodi" onClick={this.rastinClickHandler}>{rasti.koodi} </p>);
    return koodiElem;
  }
  /**
   * Palauttaa tekstin, jossa rastin omat tai
   muokattavana olevan rastin koordinaatit
   */
  palautaKoordElem() {
    let rasti = this.props.rasti;
    let koordMuutos = this.props.kRastinId === rasti.id;
    let mLat = this.props.mLat;
    let mLon = this.props.mLon;
    let koordTeksti = koordMuutos ? `${mLat}, ${mLon}` : `${rasti.lat}, ${rasti.lon}`;
    return (<p id={"koord" + rasti.id} className="koordinaatit" onClick={this.koordClickHandler}>{koordTeksti}</p>);
  }

  render() {
    let koodiElem = this.palautaKoodiElem();
    let koordElem = this.palautaKoordElem();
    return (
      <li className="rastinLiElem">
        {koodiElem}
        {koordElem}
        <div id={"kartta" + this.props.rasti.id}></div>
      </li>
    );

  }
}
ReactDOM.render(<App />, document.getElementById('root'));
