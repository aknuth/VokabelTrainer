import { Lektion } from "./Lektion";
import * as fs from "fs";
import * as path from "path";
import { Vokabel } from "./Vokabel";
//const fs = require("fs");
//const path = require("path");

export class VokabelFile{
    public filenameOnly:string;
    public lektionen:Array<Lektion>=[];
    constructor(public pathname:string){
        let lines = fs.readFileSync(pathname).toString().split('\n');
        this.filenameOnly = path.basename(pathname);
        let lektion:Lektion;
        //let anzahlLektionen = Math.ceil(lines.length/10);
        for (let i=0;i<lines.length;i++){
            let line:Array<string> = lines[i].split(';')
            let vokabel:Vokabel = new Vokabel(line[1],line[0]);
        
            if (i%10===0){
                let lektionzahl:number = Math.abs(i/10)+1;
                lektion=new Lektion('Lektion '+lektionzahl);
                this.lektionen.push(lektion);
            }
            lektion.vokabeln.push(vokabel);
          }
    }

}