"use strict";
//@ts-check 

window.onload = function() {

        let svg = document.getElementById("svg1");
        lisaaPingviini(svg);
        piirraPollo();
        piirraSkrolleri();
        lisaaPalkit(svg);
        //lisaaAallot();

    let recti = document.getElementById("svg1").getElementsByTagName("rect");
    recti[recti.length-1].addEventListener("animationiteration", vaihdaVari);

};

//manipuloidaan gradientin keskimmäistä väriä iteraation mukaan
let j = 0;
let colors = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#ffff00",
"#00ff00", "#00ffff", "#ffffff"];

function vaihdaVari() {

    let saannot = document.styleSheets[0].cssRules;

    for (let i = 0; i < saannot.length; i++) {

    if (saannot[i].selectorText == ".stop2") {
        saannot[i].style.setProperty("stop-color", colors[j]);
        j += 1;
    }
}

    if (j == colors.length) {
        colors.reverse();
        j = 0;
    }
}

//lisätään kaksi pingviiniä "tyhmällä" tavalla
function lisaaPingviini(svg) {
    let pingviiniKuva2 = document.createElement("img");
    pingviiniKuva2.src = "https://appro.mit.jyu.fi/tiea2120/vt/vt4/penguin.png";
    pingviiniKuva2.setAttribute("alt", "Kuva pingviinistä");
    pingviiniKuva2.id = "pingviini2";

    let pingviiniKuva1 = document.createElement("img");
    pingviiniKuva1.src = "https://appro.mit.jyu.fi/tiea2120/vt/vt4/penguin.png";
    pingviiniKuva1.id = "pingviini1";
    pingviiniKuva1.setAttribute("alt", "Kuva toisesta pingviinistä");

    document.body.insertBefore(pingviiniKuva2, svg);
    document.body.insertBefore(pingviiniKuva1, svg);

}

//piirretään pöllö kanvakselle
function piirraPollo() {

    let polloKuva = document.createElement("img");
    polloKuva.src = "https://appro.mit.jyu.fi/tiea2120/vt/vt4/owl.png";
    polloKuva.setAttribute("alt", "Kuva pöllöstä");

    polloKuva.onload = function() {
  
        let w = polloKuva.naturalWidth;
        let h = polloKuva.naturalHeight;

        //==============================
        let canvakset = document.getElementsByTagName("canvas");

        for (let i = 0; i < canvakset.length-1; i++) {
            canvakset[i].style.width = (w/2) + "px";
            canvakset[i].style.height = (h/2) + "px";
        }
        //==============================
    
        let sWidth = w / 2;
        let sHeight = h / 2;
    
        let c1 = document.getElementById("canvas1");
        let ctx1 = c1.getContext('2d');
        ctx1.drawImage(polloKuva, 0, 0, sWidth, sHeight, 0, 0 ,c1.width, c1.height);

        let c2 = document.getElementById("canvas2");
        let ctx2 = c2.getContext('2d');
        ctx2.drawImage(polloKuva, sWidth, 0, sWidth, sHeight, 0, 0, c1.width, c1.height);

        let c3 = document.getElementById("canvas3");
        let ctx3 = c3.getContext('2d');
        ctx3.drawImage(polloKuva, sWidth, sHeight, sWidth, sHeight, 0, 0, c1.width, c1.height);

        let c4 = document.getElementById("canvas4");
        let ctx4 = c4.getContext('2d');
        ctx4.drawImage(polloKuva, 0, sHeight, sWidth, sHeight, 0, 0, c1.width, c1.height);
    };
}

function piirraSkrolleri() {
    let skrollerincanvas = document.getElementById("skrolleri");
    skrollerincanvas.style.height = "100vh";
    skrollerincanvas.style.width = 30 + "vw";
    let skrolleri2d = skrollerincanvas.getContext("2d");

    let y = skrollerincanvas.height / 19;
    let x = skrollerincanvas.width / 2;

    skrolleri2d.fillStyle = "white";
    skrolleri2d.textAlign = 'center';
    //ei kai tarvii olla skaalautuva niin pikseleitä yksikkönä
    skrolleri2d.font = "10px arial";


    //tulostetaan kunnes piste => kokonainen lause
    let kalavale = kalevala();
    while(kalavale.includes(".") == false) {
        skrolleri2d.fillText(kalavale, x, y);
        y += 20;
        kalavale = kalevala();
    }
    skrolleri2d.fillText(kalavale, x, y);
}

//lisätään palkit
function lisaaRektit(svg, tunniste) {
    let montako = 11;
    let rectosa = "rect";
    let kasvu = 1;
    let iidee = "";
    let viive = 0.0;
    let nolla = 0;
    let sheet = window.document.styleSheets[0];

    if (tunniste == 0) {
    while(montako > 0)  {
        montako -=1;
        let rect = document.createElementNS("http://www.w3.org/2000/svg","rect");

        svg.appendChild(rect);
        rect.setAttribute("x", nolla);
        rect.setAttribute("y", "0");
        rect.setAttribute("width","0");
        rect.setAttribute("height","100");
        let stringkaksi = kasvu.toString();
        iidee = iidee.concat(rectosa,stringkaksi);
        rect.setAttribute("id", iidee);

        sheet.insertRule("#" + iidee + " { animation-delay: " + viive + "s;" +
        " animation-name: move3;" + " animation-duration: 6s;" + " animation-iteration-count: infinite;" +
        " animation-direction: alternate;" + "fill: url(#Gradient1); }", sheet.length);
        viive += 0.13;
        }
        kasvu += 1;
        iidee = "";
        nolla += 80;
    }
}


/*
function lisaaAallot() {
    let svg2 = document.getElementById("svg2");
    let tunniste = 1;
    lisaaRektit(svg2,tunniste);
}
*/

function lisaaPalkit(svg) {
    let tunniste = 0;
    lisaaRektit(svg,tunniste);
}