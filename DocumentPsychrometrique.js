function DocumentPsychrometrique(Document) {

    this.Psychro = new CalculPsychrometrique();

    this.Graph = new GraphPsychrometrique(this.Psychro);

    var newPathname = "";

    var Req = new XMLHttpRequest();
    this.Ajax = new XMLHttpRequest();
    var OptionMassMolaire = false;

    var divListPoint ;
    this.setListPoint = function(div){
        divListPoint = Document.getElementById(div);
    }
    var pathArray = window.location.href.split('/');
    for (i = 0; i < pathArray.length - 1; i++) {
        newPathname += pathArray[i];
        newPathname += "/";
    }
    this.URL = newPathname + 'psychrometrique.json';

    this.writeOptionMassMolaire = function (div) {
        OptionMassMolaire = true;
        var theDiv = Document.getElementById(div);
        var content = '<h1>Masse molaire</h1> \
        <div>\
        <div class="align">\
            <div>Nom</div>\
            <div>Masse Molaire</div>\
        <div>%</div>\
        </div>\
        <div class="align">\
            <div>O2</div>\
            <div id="MO2">32</div>\
            <div><input type="text" id="O2" value="20" onchange="calcMair();"></input></div>\
            </div>\
            <div class="align">\
            <div>N2</div>\
            <div id="MN2">28</div>\
            <div><input type="text" id="N2" value="80" onchange="calcMair();"></input></div>\
            </div>\
            <div class="align">\
            <div>Air</div>\
            <div id="Mair"></div>\
            <div>g/mol</div>\
            </div>\
            <div class="align">\
            <div>Eau</div>\
            <div id="Meau">18.02</div>\
            <div>g/mol</div>\
            </div>\
            <div class="align">\
            <div>Meau/Mair</div>\
            <div id="Rapport"></div>\
            <div>g/mol</div>\
            </div>\
            </div>';
        theDiv.innerHTML = content;
    }

    this.writeCalculateur = function (div) {
        var theDiv = Document.getElementById(div);
        var content = '<div>\
            <div class="align"><div class="dimension">Pression atmosphérique</div><div class="dimension2">[Pa]</div><div><input type="text" id="Pression" value="101325"  readonly="true" class="right"></input></div></div>\
            <div class="align"><div class="dimension">Altitude</div><div class="dimension2">[m]</div><div><input type="text" id="Altitude" value="0" class="right"></input></div></div>\
            <div class="align"><div class="dimension">Temperature du bulbe sec</div><div class="dimension2">[C]</div><div><input type="text" id="Tsec" value="25" class="right"></input></div></div>\
            <div class="align"><div class="dimension">Pression de vapeur saturante</div><div class="dimension2">[Pa]</div><div><input type="text" id="Pvs" value="" readonly="true" class="right"></input></div></div>\
            <div class="align"><div class="dimension">Pression partielle de vapeur</div><div class="dimension2">[Pa]</div><div><input type="text" id="Pv" value="" readonly="true" class="right"></input></div></div>\
            <div class="align"><div class="dimension">Temperature du bulbe humide</div><div class="dimension2">[C]</div><div><input type="text" id="Th" value="" readonly="true" class="right"></input></div></div>\
            <div class="align"><div class="dimension">Point de rosée</div><div class="dimension2">[C]</div><div><input type="text" id="Tr" readonly="true" class="right"></input></div></div>\
            <div class="align"><div class="dimension">Humidité Relative</div><div class="dimension2">[%]</div><div><input type="text" id="HR" value="50" pattern="[0-9]{.}" class="right"></input></div></div>\
            <div class="align"><div class="dimension">Humidité spécifique</div><div class="dimension2">[kgH2O/kgAIR]</div><div><input type="text" id="R" value="0.010" pattern="[0-9]{.}" class="right"></input></div></div>\
            <div class="align"><div class="dimension">Enthalpy de l\'air sec</div><div class="dimension2">[kJ/kg]</div><div><input type="text" id="Enthalpie" readonly="true" class="right"></input></div></div>\
            <div class="align"><div class="dimension">Volume spécifique</div><div class="dimension2">[Kg/m3]</div><div><input type="text" id="Vs" readonly="true" class="right"></input></div></div>\
            <BR>\
            <div class="align"><div><select class="select" name="option" id="option"><option value="R">Humidité Absolue</option><option value="HR">Humidité Relative</option></select></div><div></div><div><input type="button" onclick="DocumentPsychro.AddPoint(\'ListPoint\');" value="Add Point" class="button"></input></div></div></div>';
        theDiv.innerHTML = content;
    }
    this.AddPoint = function () {
        this.Psychro.setTsec(Document.getElementById("Tsec").value);
        this.Psychro.setAltitude(Document.getElementById("Altitude").value);
        switch (Document.getElementById("option").value) {
            case "HR":
                this.Psychro.setHR(Document.getElementById("HR").value);
                break;
            case "R":
                this.Psychro.setR(Document.getElementById("R").value);
                break;
        }
        this.Psychro.calc();
        var  newpoint=  new point(parseFloat(this.Psychro.Tsec), parseFloat(this.Psychro.R) * 1000);

        if(this.Graph.context!== undefined)
            this.Graph.drawPointGraph(newpoint, '#4eff00', 25);
        var content = '<div >\
        <div class="align"><div><input type="text" id="Pression" value="'+ String(parseFloat(this.Psychro.Pression).toFixed(0)) +'"  readonly="true" class="right"> </input></div></div>\
        <div class="align"><div><input type="text" id="Altitude" value="'+ String(parseFloat(this.Psychro.Altitude).toFixed(2)) +'" readonly="true" class="right">  </input></div></div>\
        <div class="align"><div><input type="text" id="Tsec" value="'+ String(parseFloat(this.Psychro.Tsec).toFixed(2)) +'" readonly="true" class="right">          </input></div></div>\
        <div class="align"><div><input type="text" id="Pvs" value="'+ String(parseFloat(this.Psychro.Pvs).toFixed(2)) +'" readonly="true" class="right">            </input></div></div>\
        <div class="align"><div><input type="text" id="Pv" value="'+ String(parseFloat(this.Psychro.Pv).toFixed(2)) +'" readonly="true" class="right">              </input></div></div>\
        <div class="align"><div><input type="text" id="Th" value="'+ String(parseFloat(this.Psychro.Th).toFixed(2)) +'" readonly="true" class="right">              </input></div></div>\
        <div class="align"><div><input type="text" id="Tr" value="'+ String(parseFloat(this.Psychro.Tr).toFixed(2)) +'"readonly="true" class="right">               </input></div></div>\
        <div class="align"><div><input type="text" id="HR" value="'+ String(parseFloat(this.Psychro.HR).toFixed(2)) +'" readonly="true"  class="right">             </input></div></div>\
        <div class="align"><div><input type="text" id="R" value="'+ String(parseFloat(this.Psychro.R).toFixed(4)) +'" readonly="true"  class="right">               </input></div></div>\
        <div class="align"><div><input type="text" id="Enthalpie" value="'+ String(parseFloat(this.Psychro.Enthalpie).toFixed(2)) +'" readonly="true" class="right"></input></div></div>\
        <div class="align"><div><input type="text" id="Vs" value="'+ String(parseFloat(this.Psychro.Vs).toFixed(2)) +'" readonly="true" class="right">              </input></div></div>\
        <BR>\
        <div id="aa" class="align"><div id="tt"><input type="button" class="button" value="DELETE ME" onclick="this.parentElement.parentElement.parentElement.remove();" readonly="true" class="right">              </input></div></div>\        </div>';
        divListPoint.innerHTML += content;
    }

    var readFile = function (file) {
        Req.open("GET", file, true);
        Req.send(null);
        if (Req.readyState === 4)
            if (Req.status === 200 || Req.status == 0)
                return Req.responseText;

    }

    this.Calc = function () {
        this.Psychro.setTsec(Document.getElementById("Tsec").value);
        this.Psychro.setAltitude(Document.getElementById("Altitude").value);
        switch (Document.getElementById("option").value) {
            case "HR":
                this.Psychro.setHR(Document.getElementById("HR").value);
                break;
            case "R":
                this.Psychro.setR(Document.getElementById("R").value);
                break;
        }
        this.Psychro.calc();

        Document.getElementById("Pvs").value = parseFloat(this.Psychro.Pvs).toFixed(2);
        Document.getElementById("Pv").value = parseFloat(this.Psychro.Pv).toFixed(2);
        Document.getElementById("R").value = parseFloat(this.Psychro.R).toFixed(4);
        Document.getElementById("HR").value = parseFloat(this.Psychro.HR).toFixed(2);
        Document.getElementById("Tsec").value = parseFloat(this.Psychro.Tsec).toFixed(2);
        if (OptionMassMolaire == true)
            Document.getElementById("Rapport").innerHTML = parseFloat(this.Psychro.RapportMolaireEauSurAir).toFixed(4);
        Document.getElementById("Enthalpie").value = parseFloat(this.Psychro.Enthalpie).toFixed(2);
        Document.getElementById("Pression").value = parseFloat(this.Psychro.Pression).toFixed(0);
        Document.getElementById("Tr").value = parseFloat(this.Psychro.Tr).toFixed(2);
        Document.getElementById("Th").value = parseFloat(this.Psychro.Th).toFixed(2);
        Document.getElementById("Vs").value = parseFloat(this.Psychro.Vs).toFixed(2);
        var  newpoint=  new point(parseFloat(this.Psychro.Tsec), parseFloat(this.Psychro.R) * 1000);
        if(this.Graph.context!== undefined)
            this.Graph.drawPointGraph(newpoint, '#4eff00', 25);


    }

    this.calcMair = function () {
        if (parseFloat(Document.getElementById("N2").value) + parseFloat(Document.getElementById("O2").value) == 100)
            Document.getElementById("Mair").innerHTML = (parseFloat(Document.getElementById("O2").value) * parseFloat(Document.getElementById("MO2").innerHTML) +
                parseFloat(Document.getElementById("N2").value) * parseFloat(Document.getElementById("MN2").innerHTML)) / 100;
        Document.getElementById("Rapport").innerHTML = parseFloat(Document.getElementById("Meau").innerHTML) / parseFloat(Document.getElementById("Mair").innerHTML);
    }
    this.getCapteur = function () {
        var res = readFile.call(this, this.URL);
        var b = JSON.parse(res);
        var R = this.Psychro.calcR(parseFloat(b.Humidite_Relative), parseFloat(b.Temperature), parseFloat(b.Pression * 100));
        this.Graph.drawPointGraph(new point(b.Temperature, R * 1000), '#001fff', 25);
    }

    this.OnClick = function (e) {

        var rPoint = this.Graph.getPos(e);
        Document.getElementById("Tsec").value = parseFloat(rPoint.x);
        Document.getElementById("R").value = parseFloat(rPoint.y) / 1000;
        this.AddPoint();
        this.Graph.drawPointGraph(rPoint, '#FF0000', 25);
    }
}

