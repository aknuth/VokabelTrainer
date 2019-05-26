import { Component, OnInit, TemplateRef, ViewChild, NgZone } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
const {remote, clipboard} = require('electron');
const {Menu, MenuItem, dialog } = remote;
import * as fs from "fs";
import * as path from "path";
import { VokabelFile } from '../../model/VokabelFile';
import { Lektion } from '../../model/Lektion';
import { Lernen } from '../../model/Lernen';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('eye') eye;
  @ViewChild('like') like;
  @ViewChild('dislike') dislike;
  text:string;
  isCollapsed = false;
  triggerTemplate: TemplateRef<void> | null = null;
  files:Array<any>=[];
  lernen:Lernen;
  selectedLektion: Lektion;
  selectedFile: VokabelFile;
  menu:any;
  //mapOfFiles:Map<string,Array<string>>=new Map();
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
      if (filename){
        this.onChosenFileToOpen(filename.toString()); 
      }  
    });
  }
  onChosenFileToOpen(theFileEntry) {
    this.zone.run(()=>{
      console.log(theFileEntry);
      this.files.push(new VokabelFile(theFileEntry)); 
      let filesString = JSON.stringify(this.files);
      localStorage.setItem('files',filesString);
    })

  };  

  ngOnInit(): void {
    this.zone.run(()=>{
      let filesString = localStorage.getItem('files');
      if (filesString){
        this.files=JSON.parse(filesString);
      }
    })

  }
  startVokabelLernen(file:VokabelFile, lektion:Lektion){
    this.zone.run(()=>{
      this.selectedLektion=lektion;
      this.selectedFile=file;
      this.lernen=new Lernen(lektion,[this.eye, this.like, this.dislike]);
    })
  }
  onContextMenu($event, item){
    const menu = new Menu();
    menu.append(new MenuItem({
      label: 'Löschen', 
      click: ()=>{
        let index = this.files.findIndex(f=>f.filenameOnly===item);
        if (index>-1){
          this.files.splice(index,1);
          localStorage.setItem('files',JSON.stringify(this.files));
        }
      }
    }));
    menu.popup();
  }
}
