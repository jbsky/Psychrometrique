function DocumentPsychrometrique(Document) {

    var Req = new XMLHttpRequest();
    var readFile = function (file)
    {
       // var f = new XMLHttpRequest();
        Req.open("GET", file, false);
 /*       Req.onreadystatechange = function () {
             Req.send(null);
             if (Req.readyState === 4) {
                 if (Req.status === 200 || Req.status == 0) {
                     return Req.responseText;
                 }
             }
         }*/
        Req.send(null);
        if(Req.readyState === 4)
            if(Req.status === 200 || Req.status == 0)
                return Req.responseText;

    }

    this.Psychro = new Psychrometrics();

    this.Graph = new GraphPsychrometrique(this.Psychro);

    this.Calc = function  () {
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
        Document.getElementById("Rapport").innerHTML = parseFloat(this.Psychro.RapportMolaireEauSurAir).toFixed(4);
        Document.getElementById("Enthalpie").value = parseFloat(this.Psychro.Enthalpie).toFixed(2);
        Document.getElementById("Pression").value = parseFloat(this.Psychro.Pression).toFixed(2);
        Document.getElementById("Tr").value = parseFloat(this.Psychro.Tr).toFixed(2);
        Document.getElementById("Th").value = parseFloat(this.Psychro.Th).toFixed(2);
        Document.getElementById("Vs").value = parseFloat(this.Psychro.Vs).toFixed(2);

    }

   this.calcMair = function () {
        if (parseFloat(Document.getElementById("N2").value) + parseFloat(Document.getElementById("O2").value) == 100)
            Document.getElementById("Mair").innerHTML = (parseFloat(Document.getElementById("O2").value) * parseFloat(Document.getElementById("MO2").innerHTML) +
                parseFloat(Document.getElementById("N2").value) * parseFloat(Document.getElementById("MN2").innerHTML)) / 100;
        Document.getElementById("Rapport").innerHTML = parseFloat(Document.getElementById("Meau").innerHTML) / parseFloat(Document.getElementById("Mair").innerHTML);
    }
    var newPathname="";


    this.OnLoad = function(event){

        var pathArray = window.location.href.split( '/' );
        for (i = 0; i < pathArray.length-1; i++) {
            newPathname += pathArray[i];
            newPathname += "/";
        }

        var res = readFile.call(this, newPathname + 'psychrometrique.json');
        var b = JSON.parse(res);

        var R = this.Psychro.calcR(parseFloat(b[2].valeur),parseFloat(b[1].valeur),parseFloat(b[0].valeur*100));

        this.Graph.draw("graph");

        this.Graph.drawPointGraph(new point(b[1].valeur,R*1000),'#ff00ca',50);

    }

    this.OnClick = function (e){
        var x = e.clientX - this.Graph.canvas.offsetLeft + Document.body.scrollLeft + Document.documentElement.scrollLeft;
        var y = e.clientY - this.Graph.canvas.offsetTop + Document.body.scrollTop + Document.documentElement.scrollTop;
        rPoint = new point(this.Graph.GraphtoX(x).toFixed(2),this.Graph.GraphtoY(y).toFixed(2));
        Document.getElementById("Tsec").value = parseFloat(rPoint.x);
        Document.getElementById("R").value = parseFloat(rPoint.y)/1000;
        this.Calc();
        this.Graph.drawPointGraph(rPoint,'#FF0000',20);
        var res = readFile('http://localhost:63342/Psychrometrique/psychrometrique.json');
        var b = JSON.parse(res);

        var R = this.Psychro.calcR(parseFloat(b[2].valeur),parseFloat(b[1].valeur),parseFloat(b[0].valeur*100));

        this.Graph.drawPointGraph(new point(b[1].valeur,R*1000),'#ff00ca',50);
    }
    Document.onload = this.calcMair();
    Document.onload = this.Calc();
    Document.onload = this.Graph.draw("graph");
}
