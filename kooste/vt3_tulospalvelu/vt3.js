"use strict";  // pidä tämä ensimmäisenä rivinä
//@ts-check

console.log(data);
//lomake joka lisää kenttiä input tapahtuman yhteydessä
window.addEventListener("load", function() {
    toteutaListaus();
    let lom = document.getElementById("form1");
    lom.addEventListener('submit', lisaaJoukkue);
    lom.addEventListener("click", function(){

        let montako = 0;
        let valid_kentat = document.forms[0].getElementsByTagName("fieldset")[1].getElementsByTagName("input");
        for(let i = 0; i < valid_kentat.length; i++) {
            if (valid_kentat[i].value != "") {
                montako += 1;
            }
        }
        if(montako < 2) {
            valid_kentat[0].setCustomValidity("Anna vähintään kaksi jäsentä");
        }
        else {
            valid_kentat[0].setCustomValidity("");
        }

    });

//===============validointi nimelle====================================
    let nimikentta = document.getElementById("Joukkueen_nimi");
    nimikentta.addEventListener("input", lisaaValidointi);

    function lisaaValidointi() {
        let nimikentta = document.getElementById("Joukkueen_nimi");
        let nimi2 = "";
    
        for(let i = 0; i < data.joukkueet.length; i++) {
            nimi2 = data.joukkueet[i].nimi.trim().toUpperCase();
            let nimikenttakaksi = nimikentta.value.trim().toUpperCase();
            if (nimikenttakaksi == nimi2) {
                nimikentta.setCustomValidity("Tämän niminen joukkue on jo olemassa, keksi uusi nimi.");
            }

            else if (nimikentta.value == "") {
                nimikentta.setCustomValidity("Anna joukkueelle nimi");
            }

            else if (nimikentta.value.trim().length < 2) {
                nimikentta.setCustomValidity("Joukkueen nimen on oltava yli kaksi merkkiä pitkä");
            }

            else {
                nimikentta.setCustomValidity("");
        }
    
    }
    }
//=============================================================================== 


    let inp_kentta = document.getElementById("form1") .getElementsByTagName("fieldset")[1].getElementsByTagName("input");
    inp_kentta[1].addEventListener("input", lisaaKentta);
//Lisätään ja poistetaab kenttiä tarpeen mukaan
    function lisaaKentta() {
        let tyhja = false;
        for(let i=inp_kentta.length-1 ; i>-1; i--) {
            let input = inp_kentta[i];
            if(input.value.trim() == "" && tyhja) {
                inp_kentta[i].parentNode.previousSibling.remove();
                inp_kentta[i].parentNode.remove();

            }

            //Tarkastetaan onko syötetty välilyöntejä/onko tyhjä
            if (input.value.trim() == "") {
                tyhja = true;
            }

            //Jos ei tyhjä, niin luodaan elementit ja kuuntelija uudelle jäsenelle
            if (!tyhja) {
                let br = document.createElement("br");
                document.getElementsByTagName("fieldset")[1].appendChild(br);
                let divi = document.createElement("div");
                document.getElementsByTagName("fieldset")[1].appendChild(divi);
                let label = document.createElement("label");
                label.textContent = "Jäsen";
                let input = document.createElement("input");
                input.setAttribute("type", "text");
                input.setAttribute("class","inp1");
                input.addEventListener("input", lisaaKentta);
                let div_elem_maara =  document.getElementsByTagName("fieldset")[1].getElementsByTagName("div").length;
                document.getElementsByTagName("fieldset")[1].getElementsByTagName("div")[div_elem_maara-1].appendChild(label);
                document.getElementsByTagName("fieldset")[1].getElementsByTagName("div")[div_elem_maara-1].appendChild(input);

            }

            let pituus = document.getElementById("form1") .getElementsByTagName("fieldset")[1].getElementsByTagName("label").length;
            for(let i=0; i<pituus; i++){
                    let label = document.getElementById("form1") .getElementsByTagName("fieldset")[1].getElementsByTagName("label")[i];
                    label.textContent = "Jäsen" + (i+1);
                    //kuuntelija labelilla, jos klikattu niin valitaan sen tekstikenttä aktiiviseksi
                    label.addEventListener("click", function(e) {
                        label.nextSibling.select();
                    });
            }
        }
    }

});

function lisaaJoukkue(event) {

    event.preventDefault();
    let sarja2 = "";
    let sarja = 0;
    let leimaustapa = [0];
    let nimi = document.forms[0].getElementsByTagName("fieldset")[0].getElementsByTagName("input")[0].value.toString();
    //haetaan sarjan nimeä vastaava id
    let sarjat = document.forms[0].getElementsByTagName("fieldset")[0].getElementsByTagName("p")[1].getElementsByTagName("input");
    for (let r of sarjat) {
        if (r.checked) {
            sarja2 = r.getAttribute("value");
        }
     }

    for (let i = 0; i < data.sarjat.length; i++) {
        if (data.sarjat[i].nimi == sarja2) {
           sarja = data.sarjat[i].id;
        }

    }
    /*Jos sarjaa ei löydy valmiina, luodaan se. Koska sarjojen id ei pysy vakiona sivua päivittäessä,
    luodaan jatkoa ajatellen uusi id ja sille sarja/lisätään tietokantaan.
    */
    if (sarja == 0) {
        let iidee = [];
        for (let i = 0; i < data.sarjat.length; i++) {
            iidee.push(data.sarjat[i].id);
         }
         iidee.sort();

        let lisattavaSarja = { 
            "alkuaika": null,
            "id": iidee[iidee.length-1]+1,
            "kesto": Math.floor(Math.random() * 10),
            "loppuaika": null,
            "nimi": sarja2,
         }; 

         data.sarjat.push(lisattavaSarja);

         for (let i = 0; i < data.sarjat.length; i++) {
            if (data.sarjat[i].nimi == sarja2) {
               sarja = data.sarjat[i].id;
            }
    
        }


    }

    let rastit = [];

//luodaan uusi/suurin id
    let id2 = [];
    for (let i = 0; i < data.joukkueet.length; i++) {
       id2.push(data.joukkueet[i].id);
    }
    id2.sort();
    let id = id2[id2.length - 1];
    id = id + 1;


    //haetaan jasenet taulukkoon
    let jasenet = [];
    let pituus = document.getElementById("form1").getElementsByTagName("fieldset")[1].getElementsByTagName("input");
    for (let i=0; i < pituus.length; i++) {
        let jasen = pituus[i].value;
        let arvo = jasen.trim();
        if (arvo.length != 0) {
        jasen = jasen.toString();
        jasenet.push(jasen);
        }
    }
    jasenet.sort();
    let joukkue = { 
        "nimi": nimi,
        "jasenet": jasenet,
        "leimaustapa": leimaustapa,
        "id": id,
        "rastit": rastit,
        "sarja": sarja
     };

     /*
     *Lisätään joukkue tietokantaan,
     *resetoidaan lomake ja
     *poistetaan ylim. input-elementit
     */
     data.joukkueet.push(joukkue);
     document.forms[0].reset();
     poistaKenttia();

     //poistetaan entinen listaus
     let minkaLapset = document.getElementById("ulli");
     poistaLapsiNodet(minkaLapset);
     //uusi listaus
     toteutaListaus();
     console.log(data);

}

//Funktio jäseniä varten lisättyjen elementtien poistoon 
function poistaKenttia() {
    let kentat = document.forms[0].getElementsByTagName("fieldset")[1].getElementsByTagName("div");
    let jas1 = 1;
    let jas2 = 2;
    let verrattava = 0;

while (document.forms[0].getElementsByTagName("fieldset")[1].getElementsByTagName("div").length > 2) {
    for (let i=2; i < kentat.length; i++) {
        verrattava = kentat[i].firstChild.textContent.charAt(5);

    if(verrattava != jas1 || jas2) {
        if (kentat[i].nextSibling != null) {
        kentat[i].nextSibling.remove();
        }
        kentat[i].remove();
    }

}

}

}

//Joukkuelistaus lomakkeen alle
function toteutaListaus() {
    let joukkueet = data.joukkueet;
    joukkueet = joukkueet.sort((a, b) => a.nimi.localeCompare(b.nimi));

    let uloin = document.getElementById("ulli");
    for (let i=0; i < joukkueet.length; i++) {
    let li = document.createElement("li");
    li.textContent = joukkueet[i].nimi;
    uloin.appendChild(li);
    let vahva = document.createElement("strong");

    let sarjanro = joukkueet[i].sarja;
    let strongsisalto = "";

    for (let ind = 0; ind < data.sarjat.length; ind++) {
    if (sarjanro == data.sarjat[ind].id) {
       strongsisalto = data.sarjat[ind].nimi;
       vahva.textContent = " " + strongsisalto.charAt(0) + " " + strongsisalto.charAt(1);
    }
    }

    li.appendChild(vahva);

    let ul = document.createElement("ul");
    li.appendChild(ul);
    let sailo = [];
    for (let j=0; j < joukkueet[i].jasenet.length; j++) {
        sailo.push(joukkueet[i].jasenet[j]);
    }
    
    sailo.sort();
    for (let j=0; j < joukkueet[i].jasenet.length; j++) {
    let li2 = document.createElement("li");
    li2.textContent = sailo[j];
    ul.appendChild(li2);
    }

    }

}

//Funktio joukkue-listauksen poistoon
function poistaLapsiNodet(minkaLapset) {
    while (minkaLapset.firstChild) {
        minkaLapset.removeChild(minkaLapset.firstChild);
    }
}