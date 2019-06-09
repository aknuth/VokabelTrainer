import { VokabelFile } from "./VokabelFile";
import { Lektion } from "./Lektion";
import { Vokabel } from "./Vokabel";
import { TemplateRef } from "@angular/core";
import * as math from 'mathjs'


export class Lernen{
    lektion:Lektion=new Lektion('aktuell');
    constructor(private lkt:Lektion,refs:Array<TemplateRef<any>>,private anzahlumlaeufe:number){
        this.actions=refs;
        for (let i=0;i<anzahlumlaeufe;i++){
            lkt.vokabeln.forEach(v=>this.lektion.vokabeln.push(v));
        }
        this.anzahlVerbliebenerVokabeln=lkt.vokabeln.length;
        this.next();
    }
    selectedVokabel: Vokabel;
    translation:string;
    original:string;
    actions:Array<any>=[];
    anzahlVerbliebenerVokabeln=0;
    next(){
        this.translation="";
        if (this.lektion.vokabeln.length>0){
            this.selectedVokabel=this.lektion.vokabeln.pop();  
            this.original=this.selectedVokabel.original;
        } else {
            this.original="Ende der Lektion";
            this.translation="";
            this.actions=[];
        }
    }
    show(){
        if (!this.isTranslationShown()){
            this.translation=this.selectedVokabel.translation;
        }
        
    }
    korrekt(){
        if (this.isTranslationShown()){
            this.selectedVokabel.korrekt++;
            this.anzahlVerbliebenerVokabeln = this.lkt.vokabeln.filter(x => this.lektion.vokabeln.some(y=>y.original===x.original)).length;
            this.next();
        }
    }
    falsch(){
        if (this.isTranslationShown()){
            this.selectedVokabel.falsch++;
            let rand = math.randomInt(1,this.lektion.vokabeln.length);
            this.lektion.vokabeln = [...this.lektion.vokabeln.slice(0,rand),
                this.selectedVokabel,
                ...this.lektion.vokabeln.slice(rand)]
            this.next();
        }
    }
    isTranslationShown(){
        return this.translation!='';
    }
}