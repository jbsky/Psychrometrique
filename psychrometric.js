/*
Eau
⇒ Eau sous forme vapeur (faible pression) : gaz parfait
⇒ Masse molaire : Mv =18,02 g / mole

Normalement :   Pair=Pairsec+Pairhumide
m : mass en Kg et M : mass molaire g/molaire

m/V = P*M/(T*R) => density The absolute humidity is just the density of water vapor,
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

*/

/* Compatibilité Internet Explorer */
if (Math.log10 === undefined) {
    Object.prototype.log10 = function (n) {
        return Math.log(n) / Math.log(10);
    }
}

//-----------------------------------------------------------------------------
function Psychrometrics() {
///////////////////////////////////////////////////////////////////////////////
// Constants
    var KB = 1.38064852 * Math.pow(10, -23);//J/K
    var NA = 6.02214085774 * Math.pow(10, 23);// mol−1.
    var Rgas = KB * NA;            // Universal gas constant in J/mol/K

    this.MassMolaireAir = 0.028964;     // mean molar mass of dry air in kg/mol
    this.MassMolaireEau = 0.01801;//0.0181
    this.RapportMolaireEauSurAir = this.MassMolaireEau / this.MassMolaireAir;

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
    this.Vs;

///////////////////////////////////////////////////////////////////////////////
// (i) All set variable, Test type else convert float
    this.setTsec = function (Tsec) {
        Tsec = parseFloat(Tsec);
        if (Tsec > 374)
            return;

        this.Tsec = Tsec;
    }
    this.setHR = function (HR) {
        HR = parseFloat(HR);
        if (HR < 0 || HR > 100) return;
        this.HR = HR;
        this.lastUpdate = "HR";
    }
    this.setR = function (R) {
        R = parseFloat(R);
        if (R < 0) return;
        this.R = R;
        this.lastUpdate = "R";
    }
    this.setPression = function (Pression) {
        Pression = parseFloat(Pression);
        if (Pression < 0)
            return;

        this.Pression = Pression;
        // this.calcR();
    }
    this.setAltitude = function (altitude) {
        altitude = parseFloat(altitude);
        if (altitude < 0)
            return;
        this.Altitude = altitude;
        this.Pression = 1013.25 * Math.pow(1 - 0.0065 * altitude / 288.15, 5.255) * 100;
    }

// Calcul de Vapeur Saturation de l'air [Pa] Méthode Clapeyron
    var Clapeyron = function (T) { //retourne PVS
        P0 = 101325;
        T0 = 373.15;

        return P0 * Math.exp(L0 * this.MassMolaireEau / Rgas * (1 / T0 - 1 / (T + 273.15)));
    }

    /**
     Q = m * C * dT
     [J] = [Kg] * [J/Kg/T] * [T]

     Pvs(T) > pvap : sublimation ; that is initiate the state of changment!
     Pvs(T) = pvap : équilibre ;
     pvap > Pvs(T) : condensation.

     ⇒ Chaleurs massiques :
     Vapeur		1.854 = kJ/kg/°C
     Liquide 	4.1868= kJ/kg/°C
     Solide 		2.093 = kJ/kg/°C
     ⇒ Chaleurs de vaporisation et de fusion :
     Vaporisation (0 °C) 2501.6 kJ/kg
     Fusion (0 °C) 		 333.5 kJ/kg
     */
    /*  L0 [kJ/kg] la chaleur latente de vaporisation de l´eau à 0 °C*/
    var L = 2.470 * Math.pow(10, 6);
    var L0 = 2501.6;// kJ / kg;

    var Cp = 1006;                  //J/kg/K ??

    var Cpa = function (T) {
        if (T === undefined)
            T = 20;
        return 1.00567 + 1.6035 * Math.pow(10, -5) * T;
    }
    var Cpv = function (T) {
        if (T === undefined)
            T = 20;
        return 1.835 - 7.34 * Math.pow(10, -4) * T;
    }

    //  CARRIER  : Coordonnées rectangulaires   ( α= 90 ° ) avec h = 1,0045.θ + r . ( 2498 + 1,880.θ)
    /* Calcule de l'enthalpie de l´air humide
    @FORMULE
    =>  dH = dU + d(P*V)
    =>  H = Cpa *T   + r * (L0 + Cpv *T )
    T [C] la température de l´air humide,
    r [Kg/Kg] le rapport de mélange de l'eau / l'air sec,
    Cpa [kJ/kg] la chaleur massique de l´air sec,
    Cpv [kJ/kg] la chaleur massique de la vapeur d´eau à 0 °C et a pression absolue de 101 325 Pa.
    L0  [kJ/kg] la chaleur latente de vaporisation de l´eau à 0 °C*/
   this.calcEnthalpie = function (T, r) {
        var _Cpv = Cpv(T);
        var _Cpa = Cpa(T);
        return _Cpa * T + r * (L0 + _Cpv * T);
    }

// Calcul de Vapeur Saturation de l'air [Pa] Méthode sur le Web
   var AutrePvs = function (T) {
        // Pression de Vapeur Saturation de l'air [Pa]
        Pvs = 8.07131 - 1730.63 / (233.426 + T);
        if (99 < T && T <= 374)
            Pvs = 8.14019 - 1810.94 / (244.485 + T);
        Pvs = Math.pow(10, Pvs) / 0.0075;
        return Pvs.toFixed(4);

    }

   var calcTfromPvsAutre = function (Pvs) {
        return 1730.63 / (8.07131 - Math.log10(Pvs * 0.0075)) - 233.426;
    }

    /*
    * @RETURN Pvs la pression de vapeur saturante, possibilité de switch entre Claperon ou une autre formule
    *         @PARAM T la Température du bulbe sèc [C°]
    */
    this.calcPvs = function (T) {
        return AutrePvs.call(this, T);
    }

    /* Choix entre Claperone ou Autre */
   this.calcTfromPvs = function (Pvs) {
        return calcTfromPvsAutre.call(this,Pvs);
    }

     /*
    Calcul renversée de la pression de la vapeur de saturation de l'air  A TESTER
    Méthode Clapeyron
        @PARAM Humidité Relative %
        @PARAM R le rapport de mélange eau/air sec [kg/kg]
        @RETURN T la Température du bulbe sèc [C°]
    */
    this.calcTsecClapeyron = function (HR, R) {
        Pvs = 100 * R * this.Pression / ((this.RapportMolaireEauSurAir + R) * HR);
        return 1 / (1 / T0 - (Rgas / this.MassMolaireEau) / L * Math.log(this.Pression / 100 / P0));
    }

    /*
    Rapport de mélange ou teneur en humidité
    @FORMULE    =>  R=Mv/Ma * Pv/(P-Pv)
                =>  Pv = HR/100*Pvs
    Mv/Ma le rapport Molaire Eau/Air,
    Pv la pression de vapeur [Pa],
    Pvs la pression de vapeur saturante [Pa],
    P la pression absolue [Pa]
    @PARAM HR l'humidité relative %
    @PARAM T la température du bulbe sec [°C]
    @RETURN R le rapport de mélange eau/air sec [kg/kg]
    */
    this.calcR = function (HR, T, P) {
        if (P === undefined)
            P = this.Pression;
        var Pvs = this.calcPvs(T);
        var Pv = HR / 100 * Pvs;
        return this.RapportMolaireEauSurAir * Pv / (P - Pv);
    }

    /*
    Humidité Relative %
    @FORMULE    =>
    @PARAM R la teneur en humidité [Kg/Kg]
    @PARAM T la température du bulbe sec [°C]
    @PARAM P la pression absolue [Pa]
    @RETURN HR Humidité Relative %
    */
    this.calcHR = function (R, T, P) {
        if (P === undefined)
            P = this.Pression;
        return 100 * (P * R / (this.RapportMolaireEauSurAir + R)) / this.calcPvs(T);
    }

    /*
     Calcul renversée de la pression partielle de vapeur de l'air
     Méthode Autre
         @PARAM Humidité Relative : % []
         @PARAM R le rapport de mélange eau/air sec [kg/kg]
         @RETURN T la température du bulbe sec [C°]
     */
    this.calcPvFromRHR = function (R, HR, P) {
        if (P === undefined)
            P = this.Pression;
        return P / (this.RapportMolaireEauSurAir * HR / (100 * R) + HR / 100);
    }

    this.calcPv = function (T, HR) {
        var Pvs = this.calcPvs(T);
        return HR / 100 * Pvs;

    }

    /*
    Humidité spécifique                                             TODO à tester
    FORMULE =>  Vs = R * T[Kelvin]/(Mv*P)*(Mv/Maisec+R)

    @PARAM R : Rapport de mélange eau/air sec [kg/kg]
    @PARAM T : Température [C°]
    @PARAM P : Pression absolue, soit pression atmosphérique [Pa]
    @RETURN [m3/kg]
    */
    this.calcVs = function (R, T, P) {
        if (P === undefined)
            P = this.Pression;
        return Rgas * (T + 273.15) / (this.MassMolaireEau * this.Pression) * (this.RapportMolaireEauSurAir + R);
    }

    /*
    Calcul de la température du bulbe sèc
    FORMULE => H = Cpa *T   + r * (L0 + Cpv *T )
    @PARAM H l'enthalpie [kJ/kg]
    @PARAM T : Température [C°]
    @PARAM R la teneur en humidité [Kg/Kg]
    @RETURN T la température du bulbe sèc[C°]
    */
    this.calcTsecDepuisEnthalpie = function (Enthalpie, HumiditéSpecifique) {
        //  HumiditeRelative
        _Cpa = Cpa.call(this);
        _Cpv = Cpv.call(this);
        return (Enthalpie - HumiditéSpecifique * L0) / ( _Cpa + _Cpv * HumiditéSpecifique);
    }

    this.calcRDepuisEnthalpie = function (Enthalpie, T) {
        //  RapportMassEau/MassAir
        _Cpa = Cpa.call(this, T);
        _Cpv = Cpv.call(this, T);
        return (Enthalpie - _Cpa * T) / (L0 + _Cpv * T);
    }

    this.calcRapportMassEauAir = function (Enthalpie, T) {
        return (Enthalpie - Cpa(T) * T) / (L0 + Cpv(T) * T);
    }

    this.calc = function () {
        // En premier, toujours la pression de vapeur saturante;
        this.Pvs = this.calcPvs(this.Tsec);


        if (this.lastUpdate == "R") {  //Humidity Abs OK
            this.HR = this.calcHR(this.R, this.Tsec, this.Pression);
            this.Pv = this.calcPv(this.Tsec, this.HR);
        }
        else {
            this.Pv = this.calcPv(this.Tsec, this.HR);
            this.R = this.calcR(this.HR, this.Tsec, this.Pression);
        }
        this.Enthalpie = this.calcEnthalpie(this.Tsec, this.R);
        this.Vs = this.calcVs(this.R, this.Tsec, this.Pression);
    }

}
