import { Vokabel } from "./Vokabel";

export class Lektion{
    constructor(public name:string){}
    public vokabeln:Array<Vokabel>=[];
}