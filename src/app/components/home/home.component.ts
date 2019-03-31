import { Component, OnInit, TemplateRef, ViewChild, NgZone } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
const {remote, clipboard} = require('electron');
const {Menu, MenuItem, dialog } = remote;
const fs = require("fs");
const path = require("path");
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  text:string;
  isCollapsed = false;
  triggerTemplate: TemplateRef<void> | null = null;
  files:Array<any>=[];
  mapOfFiles:Map<string,Array<string>>=new Map();
  //lektionen:Array<string>=[];

  @ViewChild('trigger') customTrigger: TemplateRef<void>;
  constructor(
    private electron: ElectronService,
    private zone: NgZone
  ) { }
  /** custom trigger can be TemplateRef **/
  changeTrigger(): void {
    this.triggerTemplate = this.customTrigger;
  }

  handleOpenButton() {
    dialog.showOpenDialog({properties: ['openFile']}, (filename)=> { 
        this.onChosenFileToOpen(filename.toString()); 
    });
  }
  onChosenFileToOpen(theFileEntry) {
    this.zone.run(()=>{
      console.log(theFileEntry);
      let filenameOnly:string = path.basename(theFileEntry);
      this.files.push(filenameOnly);
      let lines = fs.readFileSync(theFileEntry).toString().split('\n');
      let anzahlLektionen = Math.ceil(lines.length/20);
      let lektionen:Array<string>=[];
      for (let i=1;i<=anzahlLektionen;i++){
        lektionen.push('Lektion '+i);
      }
      this.mapOfFiles.set(filenameOnly,lektionen); 
    })

    // setFile(theFileEntry, false);
    // readFileIntoEditor(theFileEntry);
  };  


  ngOnInit(): void {
    
  }
}
