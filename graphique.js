function PointCroisement (pointA, segmentA, pointB, segmentB){
    if(segmentA.x * segmentB.y == segmentA.y * segmentB.x){
        this.x=false;
        this.y=false;
    }
    else {
        var m = ((pointA.y - pointB.y) * segmentA.x + (pointB.x - pointA.x) * segmentA.y ) / ( segmentB.y * segmentA.x - segmentB.x * segmentA.y );
        var k = ((pointB.y - pointA.y) * segmentB.x + (pointA.x - pointB.x) * segmentB.y ) / ( segmentA.y * segmentB.x - segmentA.x * segmentB.y );
        if (m > 0 && m < 1 && k > 0 && k < 1){
            this.x = pointB.x + m * segmentB.x;
            this.y = pointB.y + m * segmentB.y;
        }
        else{
            this.x=false;
            this.y=false;
        }
    }
}

function toString(Number, count){
    var StringTemp = String(Number);
    var StringLength = String(Number).length;
    while(StringTemp.length<=count)
        StringTemp=" " +StringTemp;
    return StringTemp
}

function point(x,y){
    this.x=x;
    this.y=y;
}

function _a(pointA,pointB){
    return ( pointA.y - pointB.y)/(pointA.x - pointB.x);
}

function _b(pointA,pointB){
    return ( pointB.y * pointA.x -  pointA.y *pointB.x)/(pointA.x - pointB.x);
}

function segment(pointA,pointB){
    this.x = pointB.x - pointA.x;
    this.y = pointB.y - pointA.y;
}

function tocm(px){   return px/118.1144781144781;}

function topx(cm){   return cm*118.1144781144781;}

function barycentre (Point1,Point2,Poid){
    this.x = (Point2.x - Point1.x)*Poid+Point1.x;
    this.y = (Point2.y - Point1.y)*Poid+Point1.y;
}

function graphique (Psychrometrique){

    this.context;

    this.canvas;

// X pour la température
// Y pour la quantité d'eau pour 1kg air sec

    this.Origin = new point(2,2);


// Taille de l'image en cm soit une feuille A4
    this.Longueur = 29.7*Math.sqrt(2);

    this.Largeur = 29.7;

    this.Xmin = -15;

    this.Xmax = 55;

    this.Ymin = 0;

    this.Ymax = 30;

    this.Orthonormal=true;

    /* Balayage dans les boucles for*/
    var step=0.5;

    /*Taux de réduction de l'image*/
    var ReductionImage=1.3;

    var RapportX=this.Longueur/(this.Xmax-this.Xmin);
    var RapportY=this.Largeur/(this.Ymax-this.Ymin);
    if(this.Orthonormal==true){
        if(RapportX>RapportY){
            this.Longueur=RapportY*(this.Xmax-this.Xmin);
            RapportX=this.Longueur/(this.Xmax-this.Xmin);

        }
        else{
        this.Largeur=RapportX*(this.Ymax-this.Ymin);
        RapportY=this.Largeur/(this.Ymax-this.Ymin);
    }
    }

    /* Calcul de convertion de l'axe X vers le dession pour l'appel des fonctions Draw ou Write*/
    var XtoGraph=function(X){ return                      topx(RapportX*(X-this.Xmin) + this.Origin.x);    }

    /* Calcul de convertion de l'axe Y vers le dession pour l'appel des fonctions Draw ou Write*/
    var YtoGraph=function(Y){ return this.canvas.height - topx(RapportY*(Y-this.Ymin) + this.Origin.y);    }

    var drawTitle = function(){
        X = new point(this.Ymin ,this.Ymax);
        this.writeTextGraph("Diagramme\nPsychrométrique",X,100);

    }

    /* Todo*/
    var drawBackground = function (color){
        if (color === undefined)
            color = "#FFFFFF";


        this.context.strokeStyle = color;
        this.context.lineWidth   = 0;
        this.context.lineJoin    = 'round';

        this.context.strokeRect(XtoGraph.call(this,this.Xmin),YtoGraph.call(this,this.Ymin),XtoGraph.call(this,this.Xmax),YtoGraph.call(this,this.Ymax));
    }

    var drawEnthalpie = function (){//drawHR
       var Rsat=    Psychrometrique.calcR(100,this.Xmax);
        var indexT = this.Xmin; // boucle while
        var croisement=new point(false,false);       // boucle while
        var EnthalpieMin = Math.round(Psychrometrique.calcEnthalpie(this.Xmin,this.Ymin/1000));
        var EnthalpieMax = Math.round(Psychrometrique.calcEnthalpie(this.Xmax,this.Ymax/1000));

        for (var Enthalpie=EnthalpieMin;Enthalpie<=EnthalpieMax;Enthalpie+=1) {

            var T = Psychrometrique.calcTsecDepuisEnthalpie (Enthalpie,Rsat);
			var Tsec = Psychrometrique.calcTsecDepuisEnthalpie(Enthalpie,0);

			var firstPoint = new point(T, Rsat*1000);
            var secondPoint = new point(Tsec,0);

            if(Tsec> this.Xmax)
                var secondPoint = new barycentre(secondPoint,firstPoint,(this.Xmax-Tsec)/(T-Tsec));
        
			if(firstPoint.y > this.Ymax){
                var firstPoint = new barycentre(secondPoint,firstPoint,(this.Ymax-secondPoint.y)/(firstPoint.y-secondPoint.y));
			}	
			if(firstPoint.x < this.Xmin){
                var firstPoint = new barycentre(secondPoint,firstPoint,(this.Xmin-secondPoint.x)/(firstPoint.x-secondPoint.x));
			}

            var R = Psychrometrique.calcR(100,indexT)*1000;

			if(firstPoint.y>R){

                var segmentI = new segment(firstPoint,secondPoint);

                while((indexT<=this.Xmax) && (croisement.x==false)){
                    var X = new point(indexT,R);

                    var R = Psychrometrique.calcR(100,indexT+1)*1000;
                    var Y = new point(indexT+1,R);

                    var segmentJ = new segment(X,Y);
                    var croisement = new PointCroisement(firstPoint,segmentI,X,segmentJ);
                    if(croisement.x==false)
                        indexT++;
                }
                if(croisement.x!=false)
                    var firstPoint=new point(croisement.x,croisement.y);
                var croisement=new point(false,false);
            }
            if(Enthalpie==EnthalpieMin){// Calcul de l'axe des enthalpies, soit 2 segments donc 3 points

                var a = -1/_a( firstPoint, secondPoint);
                var b = _b( firstPoint, secondPoint);

                Rtmp =Psychrometrique.calcR(100,this.Xmin)*1000;
                var AxeP1=new point(this.Xmin-2,Rtmp);

                // y = ax + b => b = y - ax
                var b = Rtmp - (this.Xmin - 2 )* a ;

                var AxeP2=new point((this.Ymax+2-b)/a,this.Ymax+2);
                this.drawLineGraph(AxeP1,AxeP2,'#A75B62',5);
                var segmentAxe1 = new segment(AxeP1,AxeP2);

                var AxeP3=new point(this.Xmax,this.Ymax+2);

                this.drawLineGraph(AxeP3,AxeP2,'#A75B62',5);
                var segmentAxe2 = new segment(AxeP2,AxeP3);


            }
  			if( (firstPoint.x  < this.Xmax || firstPoint.y  < this.Ymax )&&
                (secondPoint.x < this.Xmax || secondPoint.y < this.Ymax )&&
                (secondPoint.x > this.Xmin || firstPoint.y  < this.Ymax )){

                if(Enthalpie/5 == Math.round(Enthalpie/5))
                    this.drawLineGraph(firstPoint,secondPoint,'#ffb600');
                var a = _a( firstPoint, secondPoint);
                var b =  _b( firstPoint, secondPoint);

                var PTmp = new point(this.Xmin-5,(this.Xmin-5)*a+b);

                var segmentTmp=new segment(secondPoint,PTmp);
                var Pcroisement = new PointCroisement(secondPoint,segmentTmp,AxeP1,segmentAxe1);

                if(Pcroisement.x!=false){
                    if(Enthalpie/5 === Math.round(Enthalpie/5) ){
                        var PTmp2 = new point(Pcroisement.x+0.5,a*(Pcroisement.x+0.5)+b);
                        this.writeTextGraph(toString(Enthalpie,3),new point(PTmp2.x-2.5,PTmp2.y+2),40,a);
                        this.drawLineGraph(Pcroisement,PTmp2,'#000000',5);

                    }
                    else{
                       var PTmp2 = new point(Pcroisement.x+0.2,a*(Pcroisement.x+0.2)+b);
                        this.drawLineGraph(Pcroisement,PTmp2);
                    }
                }
                else{
                    var Pcroisement = new PointCroisement(secondPoint,segmentTmp,AxeP2,segmentAxe2);

                    if(Pcroisement.x!=false){
                        if(Enthalpie/5 === Math.round(Enthalpie/5) ) {
                            var PTmp2 = new point(Pcroisement.x + 1, a * (Pcroisement.x + 1) + b);
                            this.drawLineGraph(Pcroisement,PTmp2,'#000000',5);

                            this.writeTextGraph(toString(Enthalpie,3),new point(PTmp2.x-0.3,PTmp2.y+3.1),40,-60);
                        }
                        else {
                            var PTmp2 = new point(Pcroisement.x+0.5,a*(Pcroisement.x+0.5)+b);
                            this.drawLineGraph(Pcroisement,PTmp2);


                        }


                    }
                }
            }
		}
	}

	var drawHR = function (){//drawHR
        var ListHR= [100,10,15,20,25,30,35,40,50,60,70,80,90,5];
        for(var k in ListHR){
            var j= ListHR[k];
            for(var T = this.Xmin ;T < this.Xmax; T++) {
                var R1 = Psychrometrique.calcR(j,T)*1000;
                var X = new point(T,R1);//good
                var R2 = Psychrometrique.calcR(j,T+1)*1000;//Renvoi des g/kg
                if(R2> this.Ymin){
                    var Y = new point(T+1,R2);
                    if(T==Math.round((3-j/1000)*this.Xmax*3/16)){
                        var angle = (Y.y - X.y)/(Y.x-X.x);
                        this.writeTextGraph(String(j+"%"),X,50,angle);
                    }
                    if (this.Ymax<R2){
                        T = this.Xmax;
                        var poid = (this.Ymax-R1)/(R2-R1);           	//Barycentre
                        var Xreel = X.x+(Y.x-X.x)*poid;                 //Barycentre
                        var Y= new point(Xreel,this.Ymax);
                    }
                    if (R1<this.Ymin){
                        var poid = (this.Ymin-R2)/(R2-R1);           	//Barycentre
                        var Xreel = Y.x+(Y.x-X.x)*poid;                 //Barycentre
                        var X= new point(Xreel,0);
                    }
                    if(j==100)
                        this.drawLineGraph(X,Y,'#FF0000',5);
                    else
                        this.drawLineGraph(X,Y,'#FF0000');
                }
            }
        }
    }

    var drawAxeT = function(){
        var X = new point(0,0);
        var Y = new point(this.Ymax,0);
        this.drawLineGraph(X,Y,'#2dff00');
        for(var T = this.Xmin;T <= this.Xmax; T+=step) {
            // Objectif avoir Kgeau/Kgair à HR=100% pour T = (i+this.Xmin)

            X = new point(T,0);

            R = Psychro.calcR(100,T)*1000;
            if (R > this.Ymax)
                R = this.Ymax;

            if (R < this.Ymin)
                R  = this.Ymin;

            Y = new point(T,R);

            if(T/5 == Math.round(T/5)){
                this.drawLineGraph(X,Y,'#2dff00',6);
                this.writeTextGraph(toString(T,3),new point(X.x-2,X.y));// Write legende
            }
            else if(T==Math.round(T))
                this.drawLineGraph(X,Y,'#2dff00');

        }
    }

    var drawAxeR = function (){
        var X = new point(this.Xmax,0);
        var Y = new point(this.Xmax,this.Ymax);
        this.drawLineGraph(X,Y,'#0000ff');// tracer vertical
        for(var R = this.Ymin;R <= this.Ymax; R+=step) {
            // Objectif avoir Tsec avec HR=100% pour Kgeau/Kgair = (i)
            Tsec  = Psychro.calcTsecAutre(100,R/1000);
            if (Tsec < this.Xmin)
                Tsec = this.Xmin;
            if (Tsec > this.Xmax)
                Tsec = this.Xmax;

            X = new point(Tsec ,R);
            Y = new point(this.Xmax, R);

            if(R/5 == Math.round(R/5)){
                this.drawLineGraph(X,Y,'#0000ff',5);// tracer horizontal
                this.writeTextGraph(String(R),new point(Y.x-0.7,Y.y+0.7));
            }
            else if(R==Math.round(R))
                this.drawLineGraph(X,Y,'#0000ff');// tracer horizontal
        }
    };

    this.getPos = function (e,id){
        var x=e.clientX-this.canvas.offsetLeft+ document.body.scrollLeft + document.documentElement.scrollLeft;
        var y=e.clientY-this.canvas.offsetTop + document.body.scrollTop + document.documentElement.scrollTop;
        cursor="(" + String(this.GraphtoX(x).toFixed(2))+"/"+String(tocm(this.canvas.clientWidth).toFixed(2)) + "," + String(this.GraphtoY(y).toFixed(2))+")" ;
        document.getElementById(id).innerHTML=cursor;
    }

    var PointtoGraph=function(X) {  return new point(XtoGraph.call(this,X.x),YtoGraph.call(this,X.y));}

    var drawAxeX = function(){
        var X = new point(0,0);
        var Y = new point(this.Ymax,0);
        this.drawLineGraph(X,Y,'#2dff00');
        for(var X = this.Xmin;X <= this.Xmax; X+=step) {
            // Objectif avoir Kgeau/Kgair à HR=100% pour T = (i+this.Xmin)

            P1 = new point(X,this.Ymin);
            P2 = new point(X,this.Ymax);
            if(X==0)
                this.drawLineGraph(P1,P2,'#000000',15);
            else
            if(X==Math.round(X))
                this.drawLineGraph(P1,P2,'#2dff00');

        }
    }

    var drawAxeY = function (){
        var X = new point(this.Xmax,0);
        var Y = new point(this.Xmax,this.Ymax);
        this.drawLineGraph(X,Y,'#0000ff');// tracer vertical
        for(var Y = this.Ymin;Y <= this.Ymax; Y+=step) {

            P1 = new point(this.Xmin ,Y);
            P2 = new point(this.Xmax, Y);
            if(Y==0)
                this.drawLineGraph(P1,P2,'#000000',15);
            else
            if(Y==Math.round(Y))
                this.drawLineGraph(P1,P2,'#0000ff');// tracer horizontal
        }
    };

    /* TODO Calcul de convertion du dessin <=> axe X */
    this.GraphtoX=function(X){
        /* TODO : Return the correct X from Graph   0       -> this.canvas.clientWidth
                                                    Xmin    -> Xmax
        */
        return X;
    }

    /* TODO Calcul de convertion du dessin <=> axe Y */
    this.GraphtoY=function(Y){
        return Y;
    }

    this.drawPointGraph = function (Point,color,width ) {
        if (color === undefined)
            var color = '#000000';
        if (width === undefined)
            var width = 10;
        this.context.beginPath();
        this.context.arc(XtoGraph.call(this,Point.x),YtoGraph.call(this,Point.y),2,0,2*Math.PI);
        this.context.strokeStyle = color;
        this.context.lineWidth = width;
        this.context.stroke();
    }

    this.drawLineGraph = function (X,Y,color,width ) {
        if (color === undefined)
            color = '#000000';
        if (width === undefined)
            width = 2;
        this.context.beginPath();
        var x=XtoGraph.call(this,X.x);var y=YtoGraph.call(this,X.y);
        this.context.moveTo(x, y);
        x=XtoGraph.call(this,Y.x);y=YtoGraph.call(this,Y.y);
        this.context.lineTo(x, y);
        this.context.strokeStyle = color;
        this.context.lineWidth = width;
        this.context.stroke();
    }

    this.writeTextGraph = function (Text,Point,Width,Rotate){
        if (Width === undefined)
            Width = 50;
        if (Rotate === undefined)
            Rotate = 0;

        this.context.save();
        this.context.font = String(Width)+"px Arial";
        this.context.translate(XtoGraph.call(this,Point.x),YtoGraph.call(this,Point.y));

        this.context.rotate(-Math.atan(Rotate));
        this.context.fillText( Text, 50, 50);
        this.context.restore();

    }

    this.draw = function(graph){

        this.canvas = document.getElementById(graph);

		/* Pixelisation de l'image*/
        this.canvas.width = topx(this.Longueur*ReductionImage);
        this.canvas.height = topx(this.Largeur*ReductionImage);

        /* Style du canvas, taille en cm de l'image*/
		this.canvas.style.width = String(this.Longueur)+"cm";
		this.canvas.style.height = String(this.Largeur)+"cm";


	    this.context = this.canvas.getContext("2d");
        drawTitle.call(this);
		drawAxeT.call(this);
		drawAxeR.call(this);
        drawHR.call(this);
        drawEnthalpie.call(this);

        // drawBackground.call(this);
        // drawAxeX.call(this);
        // drawAxeY.call(this);

    }
}