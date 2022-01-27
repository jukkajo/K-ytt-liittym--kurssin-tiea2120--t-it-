"use strict";
// seuraavat estävät jshintin narinat jqueryn ja leafletin objekteista
/* jshint jquery: true */
/* globals L */

let raahattava;
let edCirc;
let marker;
let mymap;
let r = 150;
let joukkueet1 = {"size": 0};
let rastit1 = {"size": 0};

// kirjoita tänne oma ohjelmakoodisi
$(document).ready(function() {
    luoKartta();
    luoKentat();
    ympyratKartalle(data.rastit);
});


/**
 * haetaan kartta/lisätään
 */
function luoKartta() {
    mymap = new L.map('map', {
        crs: L.TileLayer.MML.get3067Proj()
    }).setView([62.2333, 25.7333], 11);
    L.tileLayer.mml_wmts({layer: "maastokartta", key : "02d3f9e0-a548-455f-a6a1-358e94abf76d" }).addTo(mymap);
}


/**
 * flexillä containerit ja niille käsittelijät
 */
function luoKentat() {
    // LAatikko listaelementeille
    $("<div id='flex'></div>").insertAfter("#map");

    $("<div class='container' id='joukkueet'><h2>Joukkueet</h2><ul></ul></div>").appendTo($("#flex"));
    let div = $("#joukkueet").get(0);
    div.addEventListener("drop", pudotus);
    div.addEventListener("dragover", raahaaYli);

    let parent = $("#joukkueet").children().eq(1);
    let lajiteltu = data.joukkueet.sort(function(a, b) {
        return compare(a.nimi, b.nimi);
    });

    // Lista elementit joukkueista aakkosjärjestyksessä
    for (let i = 0; i < lajiteltu.length; i++) {
        let color = rainbow(lajiteltu.length, i);
        let koordinaatit = haeKoordinaatit(lajiteltu[i]);

        let li = $("<li>" + lajiteltu[i].nimi.trim() + " (" + laskeMatka(koordinaatit) + " km)</li>");
        li.css("backgroundColor", color);
        li.attr("draggable", "true");
        li.attr("id", "joukkue" + i);
        
        // Kuuntelija raahauksen aloitukselle
        li.get(0).addEventListener("dragstart", raahaus);
        li.appendTo(parent);

        // Objekti, joka linkittää lista elementin joukkueeseen ja muihin tietoihin
        joukkueet1["joukkue"+i] = {
            "lista": li.get(0),
            "joukkue": lajiteltu[i],
            "koordinaatit": koordinaatit
        };
        joukkueet1.size++;
    }

    $("<div class='container' id='kartalla'><h2>Kartalla</h2><ul></ul></div>").appendTo($("#flex"));
//======================================================
    let drop = document.getElementById("kartalla");
    drop.addEventListener("dragover", raahaaYli);
    drop.addEventListener("drop", kartallaPudotus);
//======================================================
    $("<div class='container' id='rastit'><h2>Rastit</h2><ul></ul></div>").appendTo($("#flex"));
    div = $("#rastit").get(0);
    div.addEventListener("drop", pudotus);
    div.addEventListener("dragover", raahaaYli);
//======================================================
    parent = $("#rastit").children().eq(1);
    lajiteltu = data.rastit.sort(function(a, b) {
        return compare(b.koodi, a.koodi);
    });

    // käänt.järjestys/rastielem
    for (let i = 0; i < lajiteltu.length; i++) {
        let li = $("<li>" + lajiteltu[i].koodi + "</li>");
        let color = rainbow(lajiteltu.length, i);
        li.css("backgroundColor", color);
        li.attr("draggable", "true");
        li.attr("id", "rasti" + i);

        li.get(0).addEventListener("dragstart", raahaus);
        li.appendTo(parent);
        rastit1["rasti"+i] = {
            "lista": li.get(0),
            "rasti": lajiteltu[i]
        };
        rastit1.size++;
    }
}


/**
 * Piirtää joukkueen kulkeman matkan kartalle, lisää viittauksen polylineen pois-
 * toa ajatellen
 */
function piirraReitti(objekti) {
    if (objekti.polyline === undefined || objekti.polyline === "") {
        let hexa = rgbHexaksi(objekti.lista.style.backgroundColor);
        let polyline = L.polyline(objekti.koordinaatit, {
            color: hexa
        }).addTo(mymap);
        objekti["polyline"] = polyline;
    }
}


/**
 * Laskee rastie välisen matkan, desimaalin tarkkuudeksi yksi
 */
function laskeMatka(koord) {
    let matka = 0;
    for (let i = 0, j = 1; j < koord.length; i++, j++) {
        matka += mymap.distance([koord[i].lat, koord[i].lon],
                                [koord[j].lat, koord[j].lon]);
    }

    return (matka/1000).toFixed(1);
}

/**
 * rastit kartalle
 */
 function ympyratKartalle(rastit) {
    let pLat = 180;
    let iLat = -180;
    let pLon = 180;
    let iLon = -180;

    for (let i = 0; i < rastit.length; i++) {
        let lat = rastit[i].lat;
        let lon = rastit[i].lon;

        let circle = L.circle([lat, lon], {
            color: 'red',
            radius: r,
            fillOpacity: 0,
            
        }).addTo(mymap);

        let popup = L.popup({
            autoPan: false,
            closeButton: false,
            autoClose: false,
            closeOnEscapeKey: false,
            closeOnClick: false,
            className: 'rastiNum',
            maxWidth: "1em",
            maxHeight: "1em",
            offset: [0, 9],
        }).setContent('<p>' + rastit[i].koodi + '</p>')
          .setLatLng(circle.getLatLng());
        circle.bindPopup(popup);
        popup.openOn(circle).bringToBack();

        // Poistaa leafletin lisäämän marginin
        $(".leaflet-popup-content p").css("margin", "0");

        rastit1["rasti"+i].ympyra = circle;

        circle.on("click", rastiKlikkaus);

        // etsitään min-max koord.
        if (lat < pLat) {
            pLat = lat;
        }
        if (lat > iLat) {
            iLat = lat;
        }
        if (lon < pLon) {
            pLon = lon;
        }
        if (lon > iLon) {
            iLon = lon;
        }
    }
    //zoomataan näkymä kattamaan rastit
    mymap.fitBounds([
        [pLat, pLon],
        [iLat, iLon]
    ]);
}


/**
 * Etsitään joukkueen käymät rastit, jos tyhjä tai epävalidi,
 * niin jää catchiin
 */
function haeKoordinaatit(joukkue) {
    let rastiId = [];
    for (let i = 0; i < data.rastit.length; i++) {
        rastiId.push(data.rastit[i].id);
    }

    let rastit = joukkue.rastit;
    let koordinaatit = [];
    for (let i = 0; i < rastit.length; i++) {
        let j = -1;
        try {
            let id = parseInt(rastit[i].rasti);
            j = rastiId.indexOf(id);
        } catch (e) {
            //
        }
        if (j > -1) {
            koordinaatit.push(data.rastit[j]);
        }
    }

    return koordinaatit;
}


/**
 * merkkijonojen vertailu aakkosjärjestykselle
 */
function compare(a, b) {
	for (let i = 0; i < a.length; i++) {
		if (a.toLowerCase().charAt(i) > b.toLowerCase().charAt(i)) { return 1; }
		if (a.toLowerCase().charAt(i) < b.toLowerCase().charAt(i)) { return -1; }
	}
	return 0;
}

/**
 * joukkueen kulkeman reitin pituuden päivitys
 */
 function matkat() {
    for (let i = 0; i < joukkueet1.size; i++) {
        let joukkue = joukkueet1["joukkue"+i];
        $(joukkue.lista).text(joukkue.joukkue.nimi.trim() + " (" + laskeMatka(joukkue.koordinaatit) + " km)");
        if (joukkue.polyline !== undefined) {
            joukkue.polyline.remove();
            joukkue.polyline = "";
            piirraReitti(joukkue);
        }
    }
}


/**
 * raahattavan elementin käsittelijä
 */
function raahaus(e) {
    raahattava = e.target;
    e.dataTransfer.setData("text/plain", e.target.getAttribute("id"));
}


/**
 * Käsitellään elementin pudotus kartalle => lasketaan lokaatio
 */
function kartallaPudotus(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("text");

    if (e.target.tagName === "UL") {
        let sijainti = $(e.target.parentNode).offset();
    
        $(raahattava).css("left", e.pageX - sijainti.left + "px");
        $(raahattava).css("top", e.pageY - sijainti.top + "px");
        e.target.appendChild(document.getElementById(data));
    } else {
        return;
    }
    let objekti = joukkueet1[raahattava.id];
    if (raahattava.id.startsWith("joukkue")) {
        piirraReitti(objekti);
    }
}


/**
 * funktio joukkue/rasti-elem raahaukselle
 */
function raahaaYli(e) {
    e.preventDefault();
    let id = raahattava.id.replace(/\d/g, "");
    switch (id) {
        case "joukkue":
            if (e.target.parentNode.id === "kartalla" || e.target.parentNode.parentNode.id === "joukkueet" || e.target.parentNode.id === "joukkueet") {
                e.dataTransfer.dropEffect = "move";
                break;
            }
            e.dataTransfer.dropEffect = "none";
            break;
        case "rasti":
            if (e.target.parentNode.id === "kartalla" || e.target.parentNode.parentNode.id === "rastit" || e.target.parentNode.id === "rastit") {
                e.dataTransfer.dropEffect = "move";
                break;
            }
            e.dataTransfer.dropEffect = "none";
            break;
    }
}


/**
 * funktio ympyrän klikkaukselle
 */
function rastiKlikkaus(ev) {
    if (marker === undefined) {
        marker = L.marker(ev.target.getLatLng(), {
            "draggable": true
        }).addTo(mymap);
        marker.on("dragend", markerRaahaus);
    } else {
        marker.setLatLng(ev.target.getLatLng());
    }

    if (edCirc !== undefined) {
        edCirc.options.fillOpacity = "0";
        edCirc.setStyle();
    }

    ev.target.options.fillOpacity = "1.0";
    ev.target.setStyle();
     
    //keskitetään rastin nimi-kenttä ympyrän sisään
    ev.target.getPopup().setLatLng(ev.target.getLatLng());
    $(".leaflet-popup-content p").css("margin", "0");

    edCirc = ev.target;
}


//funktio markerin siirrolle
function markerRaahaus(ev) {
    edCirc.setLatLng(ev.target.getLatLng());
    ev.target.remove();
    
    edCirc.options.fillOpacity = "0";
    edCirc.setStyle();

    let latLng = edCirc.getLatLng();
    for (let i = 0; i < rastit1.size; i++) {
        if (rastit1["rasti"+i].ympyra === edCirc) {
            rastit1["rasti"+i].rasti.lat = latLng.lat.toString();
            rastit1["rasti"+i].rasti.lon = latLng.lng.toString();
            break;
        }
    }

    matkat();

    marker = undefined;
    edCirc = undefined;
}

/**
 * Kun elem pudotetaan kohdealueelle, niin minne lisätään/poisto yms.
 */
 function pudotus(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("text");

    if (raahattava.id.startsWith("joukkue")) {
        if (e.target.tagName === "LI" && e.target.parentNode.parentNode.id === "joukkueet") {
            e.target.parentNode.insertBefore(document.getElementById(data), e.target);
            joukkueet1[raahattava.id].polyline.remove();
            joukkueet1[raahattava.id].polyline = "";
        }
        else if (e.target.parentNode.id === "joukkueet") {
            e.target.appendChild(document.getElementById(data));
            joukkueet1[raahattava.id].polyline.remove();
            joukkueet1[raahattava.id].polyline = "";
        }
    }
    if (raahattava.id.startsWith("rasti")) {
        if (e.target.tagName === "LI" && e.target.parentNode.parentNode.id === "rastit") {
            e.target.parentNode.insertBefore(document.getElementById(data), e.target);
        }
        else if (e.target.parentNode.id === "rastit") {
            e.target.appendChild(document.getElementById(data));
        }
    }
}

/**
 * Muuttaa string muodossa olevan desimaaliluvun hexaksi
 */
 function desToHex(vari) {
    let hexa = parseInt(vari).toString(16);
    if (hexa.length == 1) {
        return "0" + hexa;
    } else {
        return hexa;
    }
}


/**
 * Muuttaa "rgb(0, 0, 0)" muodossa olevan merkkijono värimallin 
 * hexadesimaali muotoiseksi merkkijonoksi
 */
function rgbHexaksi(rgb) {
    rgb = rgb.replace(/[^\d ]/g, "").trim().split(" ");
    return "#" + desToHex(rgb[0]) + desToHex(rgb[1]) + desToHex(rgb[2]);
}


/**
 * mallin funktio väreille
 */
function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    let r, g, b;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}

console.log(data);