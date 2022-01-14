import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { createScheduler, createWorker, OEM, Page, RecognizeResult } from 'tesseract.js';
import { fabric } from "fabric";
import '@grapecity/wijmo.styles/wijmo.css';
//
import * as wjcCore from '@grapecity/wijmo';
import * as wjcGrid from '@grapecity/wijmo.grid';
import { WjGridModule } from '@grapecity/wijmo.angular2.grid';

import { base64ToFile, ImageCroppedEvent } from 'ngx-image-cropper';

import Croppr from '../../components/utils/croppr';
@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent  implements OnInit, AfterViewInit{
  private croppr: ElementRef;

  @ViewChild('croppr') set content(content: ElementRef) {
    if(this.index) { // initially setter gets called with undefined
        this.croppr = content;
    }
  }
  @ViewChild('hiddencanvas', { static: false }) hiddencanvas!: ElementRef;
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;  
  base64:string;
  objectURL:any;
  index = 0;
  progress:number=0;
  private ctx!: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  bytes:Buffer;
  croppedImage:any;

  private ratio: number | null = null;
  result: Page | null = null;
  data_url:string
  blob:any;
  data: any[];
  constructor(private cdRef:ChangeDetectorRef) {
    
  }
  ngAfterViewInit(): void {
    this.image = new Image();
    this.image.onload =  () =>{
       this.drawImage(this.image);
    }
    this.image.onload.bind(this);
    this.image.src = 'assets/imgs/IMG_3507.jpg';

  }
  async ngOnInit() {
    this.base64 ='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg==';
  }
  Base64toBlob(_base64){
    let tmp = _base64.split(',');
    let data = atob(tmp[1]);
    let mime = tmp[0].split(':')[1].split(';')[0];
    let arr = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {arr[i] = data.charCodeAt(i);}
    let blob = new Blob([arr], { type: mime });
    return blob;
  }
  drawImage(image) {
    // Set the canvas the same width and height of the image
    this.hiddencanvas.nativeElement.width = image.width;
    this.hiddencanvas.nativeElement.height = image.height;
    const context = this.hiddencanvas.nativeElement.getContext('2d');
    context.drawImage(image, 0, 0);
    this.base64=this.hiddencanvas.nativeElement.toDataURL();
  }
  async crop(){
    this.index=1;
    setTimeout(() => { const cropInstance = new Croppr(this.croppr.nativeElement, {})});
    // this.croppedImage = event.base64;
      // this.image = new Image();
      // this.index=1;
      // this.cdRef.detectChanges()
      // this.cdRef.markForCheck();
      // this.image.onload = () => this.drawImageScaled(this.image);      
      // this.image.src = URL.createObjectURL(base64ToFile(this.croppedImage))
      // const tmpbytes = await (new Response(base64ToFile(this.croppedImage))).arrayBuffer();
      // this.bytes = new Buffer(tmpbytes);
      // this.ctx = this.canvas.nativeElement.getContext('2d');

      // this.fabricCanvas = new fabric.Canvas(this.canvas.nativeElement.id);
      // fabric.Object.prototype.controls.mtr.visible=false;
      // this.fabricCanvas.setBackgroundImage(this.croppedImage, this.fabricCanvas.renderAll.bind(this.fabricCanvas));

      // await this.doOCR()    
    // this.angularCropper.cropper.getCroppedCanvas( { fillColor: '#fff'}).toBlob(async(blob) => {
    //   this.image = new Image();
    //   this.index=1;
    //   this.cdRef.detectChanges()
    //   this.cdRef.markForCheck();
    //   this.image.onload = () => this.drawImageScaled(this.image);      
    //   this.image.src = URL.createObjectURL(blob)
    //const tmpbytes = await (new Response(blob)).arrayBuffer();
    //   this.bytes = new Buffer(tmpbytes);
    //   this.ctx = this.canvas.nativeElement.getContext('2d');
    //   await this.doOCR()
    // });
  }
  async imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  thresholdFilter(){
    const ctx = this.hiddencanvas.nativeElement.getContext('2d');
   const processedImageData = ctx.getImageData(0,0,this.hiddencanvas.nativeElement.width, this.hiddencanvas.nativeElement.height);
    const level=0.55;
    const pixels = processedImageData.data;
    //this.thresholdFilter(,);
    // if (level === undefined) {
    //   level = 0.5;
    // }
    const thresh = Math.floor(level * 255);
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      let val;
      if (gray >= thresh) {
        val = 255;
      } else {
        val = 0;
      }
      pixels[i] = pixels[i + 1] = pixels[i + 2] = val;
    }
    ctx.putImageData(processedImageData, 0, 0);
    this.base64=this.hiddencanvas.nativeElement.toDataURL();
  }
  onIndexChange(event: number): void {
    this.index = event;
    if (event===0){
      this.progress=0;
    }
    
  }
  // redrawImage(): void {
  //   if (this.image) {
  //     this.drawImageScaled(this.image);
  //   }
  // }

  // private drawImageScaled(img: any): void {
  //   const width = this.canvasContainer.nativeElement.clientWidth;
  //   const height = this.canvasContainer.nativeElement.clientHeight;
  //   const hRatio = width / img.width;
  //   const vRatio = height / img.height;
  //   this.ratio = Math.min(hRatio, vRatio);
  //   if (this.ratio > 1) {
  //     this.ratio = 1;
  //   }

  //   this.canvas.nativeElement.width = img.width * this.ratio;
  //   this.canvas.nativeElement.height = img.height * this.ratio;

  //   this.ctx.clearRect(0, 0, width, height);
  //   this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * this.ratio, img.height * this.ratio);
  // }   

  createWorker(){
    return createWorker({
      logger: msg => {
        console.log(msg);
        if (msg.status==="recognizing text"){
          this.progress = Math.round(msg.progress*100)
          this.cdRef.detectChanges();
          this.cdRef.markForCheck();
        }
      }
    }); 
  }
  async doOCR(){
    const worker = this.createWorker() 
    await worker.load();
    await worker.loadLanguage('deu+spa');
    await worker.initialize('deu+spa');
    try {
      await worker.setParameters({
        tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
      });
      const recognizeResult  = await worker.recognize(this.bytes);
      console.log(recognizeResult.data);
      console.log(`width: ${this.image.width} height: ${this.image.height}`);
      this.data=[];
      recognizeResult.data.lines.forEach((l,i)=>{
        const left=[];
        const right=[];        
        l.words.forEach((w,j)=>{
          if (w.text==='—'){
            console.log('wrong char');
          } else if (w.bbox.x1<this.image.width/2){
            left.push(w.text);
          } else {
            right.push(w.text);
          }
        })
        this.data.push({
          id: i,
          vocab_es: left.join(' '),
          vocab_de: right.join(' ')
        });       
      })
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();   
      // if (recognizeResult) {
      //   this.result = recognizeResult.data;
      //   this.result.lines.forEach(l=>{
      //     const lBox:any = {x0:l.bbox.x0-5,x1:(l.bbox.x1-l.bbox.x0-2)/2,y0:l.bbox.y0,y1:l.bbox.y1}
      //     const rBox:any = {x0:(l.bbox.x1-l.bbox.x0+2)/2,x1:l.bbox.x1+5,y0:l.bbox.y0,y1:l.bbox.y1}
      //     this.drawBBox(lBox)
      //     this.drawBBox(rBox)
      //   })
      //   const width = this.canvasContainer.nativeElement.clientWidth;
      //   const height = this.canvasContainer.nativeElement.clientHeight;
      //   const originalWidth = this.fabricCanvas.getWidth();
      //   const originalHeight = this.fabricCanvas.getHeight();        
      //   const hRatio = width / originalWidth;
      //   const vRatio = height / originalHeight;
      //   this.ratio = Math.min(hRatio, vRatio);        

      //   this.fabricCanvas.setZoom(this.ratio);
      //   this.fabricCanvas.setWidth(originalWidth * this.ratio);
      //   this.fabricCanvas.setHeight(originalHeight *this.ratio);

      //   this.fabricCanvas.forEachObject(function(obj) {
      //     const bound = obj.getBoundingRect();
      //     console.log(bound.left,bound.top,bound.width,bound.height);
      //   })
      // } else {
      //   this.result = null;
      // }
    } catch (e) {
    } finally {
      console.log(this.result);
      await worker.terminate();
    }
    
  }
   
  // drawBBox(bbox: { x0: number, x1: number, y0: number, y1: number }): void {
  //   if (bbox) {

  //     if (this.ratio === null) {
  //       throw new Error('ratio not set');
  //     }

  //     const rect = new fabric.Rect({
  //       left: bbox.x0 * this.ratio,
  //       top: bbox.y0 * this.ratio,
  //       fill: 'transparent',
  //       width: (bbox.x1 - bbox.x0) * this.ratio,
  //       height: (bbox.y1 - bbox.y0) * this.ratio,
  //       objectCaching: false,
  //       stroke: 'blue',
  //       strokeWidth: 1,
  //       lockRotation:true,
  //       hasRotatingPoint: false
  //     });
  //     this.fabricCanvas.add(rect);      
  //   }  
  // }

  async analyse(){
    this.data=[];
    const scheduler = createScheduler();
    const worker1 = this.createWorker()
    // const worker2 = this.createWorker();
    const rectangles = [];
    
    // this.fabricCanvas.forEachObject((obj) =>{
    //   const bound = obj.getBoundingRect();
    //   rectangles.push({left:bound.left/this.ratio,top:bound.top/this.ratio,width:bound.width/this.ratio,height:bound.height/this.ratio});
    // })
    await worker1.load();
    // await worker2.load();
    await worker1.loadLanguage('deu');
    // await worker2.loadLanguage('deu');
    await worker1.initialize('deu');
    // await worker2.initialize('deu');
    scheduler.addWorker(worker1);
    // scheduler.addWorker(worker2);
    const results = await Promise.all(rectangles.map((rectangle) => (
      scheduler.addJob('recognize', this.bytes, { rectangle })
    )));
    await scheduler.terminate();

    const result = results.map(r => r.data.text);
    this.data=[];
    const left=[];
    const right=[];     
    result.forEach((r,i)=>{
      if (i%2===0){
        left.push(r);
      } else {
        right.push(r);
      }
    })
    left.forEach((v,i)=>{
      this.data.push({
        id: i,
        vocab_es: left[i],
        vocab_de: right[i]
      });   
    })
        

    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
   
  }

  flexInitialized(flexgrid: wjcGrid.FlexGrid) {
    // sort the data by country
    // let sd = new wjcCore.SortDescription('country', true);
    // flexgrid.collectionView.sortDescriptions.push(sd);
    // flexgrid.collectionView.currentChanged.addHandler(this._updateCurrentInfo.bind(this));
    // this._updateCurrentInfo();
}
}
