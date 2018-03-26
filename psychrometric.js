/*
Rapport de mélange : r : [Kg/Kg] ou teneur en humidité [kgeau/kgair-sec]
Mv/Ma 0.622

r = mv / ma
r = Mv/Ma * e'/(p-e') = Mv/Ma * pv/(p-pv)
pv ou e' 	 : la pression partielle de la vapeur d'eau ;
p 	 : la pression absolue.

pv=Hygrometrie/100*pvst
Pvs : pression de vapeur saturante
Pvs=pv*100/Hygrometrie

m/V = P*M/(T*R) => density The absolute humidity is just the density of water vapor,

Soit la teneur en humidité
r=Mv/Ma * (hr/100*pvst)/(p-(hr/100*pvst))

P*V=nRT avec m/M=n

Soit x la fraction molaire
Soit v la vapeur d'eau
Soit a l'air sec
xv = nv / (na + nv);
xa = na / (na + nv);

mv / Ma = nv
mv / Mv = nv

Soit la relation des Gaz parfait:

KB = 1.38064852*pow(10,-23);//J/K
NA = 6.02214085774*pow(10,23);// mol−1.
R  = 8,314462 1 J mol−1 K−1
R = KB*NA;            // Universal gas constant in J/mol/K

P*V=nRT


Masse molaire : M : [g/mol]
Argon, 				Ar 		208 39,94
Dioxyde de carbone, CO2 	188,9 44,01
Monoxyde de carbone,CO 		297 28,01
Hélium, 			He 		2 077 4,003
Dihydrogène, 		H2 		4 124 2,016
Méthane, 			CH4  	518,3 16,05
Diazote, 			N2 		296,8 28,02
Dioxygène, 			O2 		259,8 31,999
Propane, 			C3H8 	189 44,09
Dioxyde de soufre, 	SO2 	130 64,07
Air 						287 28,97
Vapeur d'eau,       H2O     462 18,01

• Air sec
⇒ Hypothèse : mélange de gaz parfaits
⇒ Composition volumique (= composition molaire):
[O2] = 21.0% M[O2]=44,01 g/mol
[N2] = 78.1% M[N2]=28,02 g/mol
[Ar] =  0.9% M[ar]=39,94 g/mol

⇒ Chaleur massique : à 100 kPa entre 0 et 50 °C
28.96 / a M 	= kg kmole 8314.51 287.1 / /
28.96 a R 		= J kg K
1.009 / / pa c 	= kJ kg °C


*-*************************************************
Eau
⇒ Eau sous forme vapeur (faible pression) : gaz parfait
⇒ Masse molaire : Mv =18,02 g / mole
⇒ Chaleurs massiques :

Vapeur		1.854 = kJ/kg/°C
Liquide 	4.1868= kJ/kg/°C
Solide 		2.093 = kJ/kg/°C
⇒ Chaleurs de vaporisation et de fusion :
Vaporisation (0 °C) 2501.6 kJ/kg
Fusion (0 °C) 		 333.5 kJ/kg


-->
Normalement :   Pair=Pairsec+Pairhumide
m : mass en Kg et M : mass molaire g/molaire

      Pvs(T) > pvap : sublimation ; that is initiate the state of changment!
        Pvs(T) = pvap : équilibre ;
        pvap > Pvs(T) : condensation.
*/
//-----------------------------------------------------------------------------
function Psychrometrics() {
///////////////////////////////////////////////////////////////////////////////
// Constants
    var KB = 1.38064852*Math.pow(10,-23);//J/K
    var	NA = 6.02214085774*Math.pow(10,23);// mol−1.
    var Rgas = KB*NA;            // Universal gas constant in J/mol/K

    this.MassMolaireAir = 0.028964;     // mean molar mass of dry air in kg/mol
    this.MassMolaireEau = 0.01801;//0.0181
    this.RapportMolaireEauSurAir = this.MassMolaireEau/this.MassMolaireAir;

    var Cp = 1006;                  //J/kg/K
//	Chaleur latente de vaporisation
    var L = 2.470*Math.pow(10,6);

    this.TRose;
    this.TSec;
    this.Pvs;
    this.Pv;
    this.TWet;
    this.HR; //Humidity Relative
    this.R;// Humidité Absolue
    this.H; // Anthalpie
    this.Pression;
    this.Altitude;
    this.lastUpdate;

///////////////////////////////////////////////////////////////////////////////
// (i) All set variable, Test type else convert float
    this.setTsec    = function (Tsec)   {
        Tsec = parseFloat(Tsec);
        if (Tsec > 374)
            return;

        this.Tsec = Tsec;
    }
    this.setHR      = function (HR)     {
        HR = parseFloat(HR);
        if (HR <0 || HR >100) return;
        this.HR = HR;
        this.lastUpdate="HR";
    }
    this.setR       = function (R)      {
        R = parseFloat(R);
        if (R < 0) return;
        this.R = R;
        this.lastUpdate="R";
    }
    this.setPression = function (Pression){
        Pression = parseFloat(Pression);
        if (Pression <0 )
            return;

        this.Pression = Pression;
        // this.calcR();
    }
    this.setAltitude = function (altitude){
        altitude = parseFloat(altitude);
        if (altitude <0 )
            return;
        this.Altitude = altitude;
        this.Pression = 1013.25*Math.pow(1-0.0065*altitude/288.15,5.255)*100;
    }

// Calcul de Vapeur Saturation de l'air [Pa] Méthode Clapeyron
    var Clapeyron = function(T){ //retourne PVS
        P0 = 101325;
        T0 = 373.15;

        return P0*Math.exp(L0*this.MassMolaireEau/Rgas*(1/T0-1/(T+273.15)));
    }
/** 
Energie Interne
dU = Q + W
Q : Chaleur

Enthalpie
dH = dU + d(P*V)
  L´enthalpie de l´air humide est calculée par la relation exacte :
h = Cpa *T   + r * (L0 + Cpv *T )

Cpa est la chaleur massique de l´air sec,
la température de l´air humide en degrés Celsius,
r le rapport de mélange,
L0 la chaleur latente de vaporisation de l´eau à 0 °C
Cpv la chaleur massique de la vapeur d´eau à 0 °C et 101 325 Pa.
Cpa, Cpv et L0 sont calculées par les modèles suivants :

Cpa = 1.00567 + 1,6035 * Math.pow(10,-5)*T;
Cpv = 1.835 - 7.34 *Math.pow(10,-4)*T;
*/
  //  CARRIER  : Coordonnées rectangulaires   ( α= 90 ° ) avec h = 1,0045.θ + r . ( 2498 + 1,880.θ)
    var L0 = 2501.6;// kJ / kg;
    var Cpa = function(T){
        if (T === undefined)
            T=20;
        return 1.00567 + 1.6035 * Math.pow(10,-5)*T;
    }
    var Cpv = function(T){
        if (T === undefined)
            T=20;
        return 1.835 - 7.34 *Math.pow(10,-4)*T;
    }
    this.calcEnthalpie = function(T,r){
        var _Cpv=Cpv(T);
        var _Cpa=Cpa(T);
        return _Cpa*T + r*(L0 + _Cpv*T);
    }

    var getEnthalpie = function(){
        var _Cpv=Cpv(this.Tsec);
        var _Cpa=Cpa(this.Tsec);
        this.Enthalpie=_Cpa*this.Tsec + this.R*(L0 + _Cpv*this.Tsec);
    }

// Calcul de Vapeur Saturation de l'air [Pa] Méthode sur le Web
    var AutrePvs = function (T){
        // Pression de Vapeur Saturation de l'air [Pa]
         Pvs = 8.07131 - 1730.63 / (233.426 + T);
         if ( 99 < T && T <= 374)
             Pvs = 8.14019 - 1810.94 / (244.485 + T);
         Pvs = Math.pow(10, Pvs) / 0.0075;
         return Pvs.toFixed(4);

    }
	var calcTfromPvsAutre = function (Pvs){
        return  1730.63 /(8.07131 - Math.log10(Pvs * 0.0075 )) - 233.426 ;
    }
    this.calcTfromHR100fromEnthalpie = function(){

        return 1730.63/(8.07131  - Math.log10(this.Pression/(this.RapportMolaireEauSurAir + 1)*0.0075))- 233.426 ;

    }
	this.calcTfromPvs = function (Pvs){	return calcTfromPvsAutre(Pvs);}
	
// Return [T] sec en °C
// Reverse du calcul de la Vapeur Saturation de l'air Méthode sur le Web
    this.calcTsecAutre = function(HR,R){
        if(R<0)
          R=0;//  return 0;
        Pvs=100*R*this.Pression/((this.RapportMolaireEauSurAir+R)*HR);
        return 1730.63/(8.07131 - Math.log10(0.0075*Pvs)) - 233.426;
    }

// Entrée
// HR % :
// R    :  rapport masse eau sur mass mair    [Kg/Kg]
// Retour [T] sec en °C
// Reverse du calcul de la Vapeur Saturation de l'air Méthode Clapeyron
    this.calcTsecClapeyron = function(HR,R){
        Pvs=100*R*this.Pression/((this.RapportMolaireEauSurAir+R)*HR);
        return 1/(1/T0-(Rgas/this.MassMolaireEau)/L*Math.log(this.Pression/100/P0));
    }

    this.calcPvs = function (T) {
        return Pvs = AutrePvs(T);
   }

    this.calcR = function(HR,T){
        //à-15 et 100% HR?
        var Pvs = this.calcPvs(T);
        var Pv= HR/100*Pvs;
        return this.RapportMolaireEauSurAir * Pv/(this.Pression-Pv);
    }
	
	this.calcRsat = function(T){
        //à-15 et 100% HR?
        var Pvs = this.calcPvs(T);
        return this.RapportMolaireEauSurAir * Pvs/(this.Pression-Pvs);
    }

    this.calcPvstFromRHR = function (R,HumiditeRelative){
        return this.Pression/(this.RapportMolaireEauSurAir*HumiditeRelative/(100*R)+HumiditeRelative/100);

    }
    this.calcTsecDepuisEnthalpie = function (Enthalpie,r){
      //  HumiditeRelative
        _Cpa=Cpa.call(this);
        _Cpv=Cpv.call(this);
        return (Enthalpie -r*L0)/( _Cpa +  _Cpv*r);
    }

		
    this.calcRDepuisEnthalpie = function (Enthalpie,T){
        //  RapportMassEau/MassAir
        _Cpa=Cpa.call(this,T);
        _Cpv=Cpv.call(this,T);
        return (Enthalpie - _Cpa*T)/(L0 + _Cpv*T);
    }

    this.calcRapportMassEauAir = function(Enthalpie,T){
        return (Enthalpie-Cpa(T)*T)/(L0 + Cpv(T)*T) ;
    }

    this.calcHR = function (R,T,P){
        if(P===undefined)
            P=this.Pression;
        return 100*(P*R/(this.RapportMolaireEauSurAir+R))/this.calcPvs(T);
    }


    // Calcul Interne
    var getPvs= function (){ this.Pvs= AutrePvs(this.Tsec);                                                  }
    var getHR = function (){ this.HR = 100*(this.Pression*this.R/(this.RapportMolaireEauSurAir+this.R))/this.Pvs;     }
    var getR  = function (){ this.R  = this.RapportMolaireEauSurAir * this.Pv/(this.Pression-this.Pv);                 }
    var getPv = function (){ this.Pv = this.HR/100*this.Pvs;                                                  }

    this.calc = function(){
        getPvs.call(this);
        // Always first!
        if(this.lastUpdate=="R") {  //Humidity Abs OK
            getHR.call(this);
            getPv.call(this);
        }
        else{
            getPv.call(this);
            getR.call(this);
        }
        getEnthalpie.call(this);
    }

}
