class Annonce {
    constructor(title, theme, responsable, redacteur, correcteur, traducteur, dateMax){
        this.title  = title;
        this.theme = theme;
        this.responsable = responsable;
        this.redacteur = redacteur;
        this.correcteur = correcteur;
        this.traducteur = traducteur;
        this.dateMax = dateMax;
        this.rediger = false;
        this.traduire = false;
        this.corriger = false;
    }
} 


module.exports = Annonce;