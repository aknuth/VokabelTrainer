import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CropperComponent } from '../../components/cropper/cropper.component';
import { createScheduler, createWorker, OEM, Page, RecognizeResult } from 'tesseract.js';
import { fabric } from "fabric";

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent implements OnInit {
  @ViewChild('angularCropper') public angularCropper: CropperComponent;
  @ViewChild('canvas') canvas!: ElementRef;
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;  
  fallback:string;
  objectURL:any;
  index = 0;
  progress:number=0;
  private ctx!: CanvasRenderingContext2D;
  private image: any | null = null;
  private ratio: number | null = null;
  result: Page | null = null;
  fabricCanvas:fabric
  data_url:string
  blob:any;
  constructor(private cdRef:ChangeDetectorRef) {
    this.fallback ='data:image/png;base64,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';
  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    
  }
  rotateLeft(){
    this.angularCropper.cropper.rotate(-2)
  }
  rotateRight(){
    this.angularCropper.cropper.rotate(2)
  }
  async crop(){
    // this.angularCropper.cropper.crop()
    this.angularCropper.cropper.getCroppedCanvas( { fillColor: '#fff'}).toBlob(async(blob) => {
      this.image = new Image();
      this.index=1;
      this.cdRef.detectChanges()
      this.cdRef.markForCheck();
      this.image.onload = () => this.drawImageScaled(this.image);      
      this.image.src = URL.createObjectURL(blob)
      this.blob=blob
      this.ctx = this.canvas.nativeElement.getContext('2d');
      await this.doOCR()
    });
    this.data_url=this.angularCropper.cropper.getCroppedCanvas( { fillColor: '#fff'}).toDataURL();  
  }
  onIndexChange(event: number): void {
    this.index = event;
    if (event===0){
      this.progress=0;
    }
    
  }
  async doOCR(){
    const worker = createWorker({
      logger: msg => {
        console.log(msg);
        if (msg.status==="recognizing text"){
          this.progress = Math.round(msg.progress*100)
          this.cdRef.detectChanges();
          this.cdRef.markForCheck();
        }
      }
    });  
    await worker.load();
    await worker.loadLanguage('deu+spa');
    await worker.initialize('deu');
    try {
      await worker.setParameters({
        tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
      });
      const recognizeResult  = await worker.recognize(this.image);
      if (recognizeResult) {
        this.fabricCanvas = new fabric.Canvas(this.canvas.nativeElement.id);
        fabric.Object.prototype.controls.mtr.visible=false;
        this.fabricCanvas.setBackgroundImage(this.data_url, this.fabricCanvas.renderAll.bind(this.fabricCanvas));
        this.result = recognizeResult.data;
        this.result.lines.forEach(l=>{
          this.drawBBox(l.bbox)
        })
        const width = this.canvasContainer.nativeElement.clientWidth;
        const height = this.canvasContainer.nativeElement.clientHeight;
        const originalWidth = this.fabricCanvas.getWidth();
        const originalHeight = this.fabricCanvas.getHeight();        
        const hRatio = width / originalWidth;
        const vRatio = height / originalHeight;
        this.ratio = Math.min(hRatio, vRatio) / 2;        

        this.fabricCanvas.setZoom(this.ratio);
        this.fabricCanvas.setWidth(originalWidth * this.ratio);
        this.fabricCanvas.setHeight(originalHeight *this.ratio);

        this.fabricCanvas.forEachObject(function(obj) {
          const bound = obj.getBoundingRect();
          console.log(bound.left,bound.top,bound.width,bound.height);
        })
      } else {
        this.result = null;
      }
    } catch (e) {
    } finally {
      console.log(this.result);
      await worker.terminate();
    }
    
    
  }
  redrawImage(): void {
    if (this.image) {
      this.drawImageScaled(this.image);
    }
  }
  drawBBox(bbox: { x0: number, x1: number, y0: number, y1: number }): void {
    if (bbox) {

      if (this.ratio === null) {
        throw new Error('ratio not set');
      }

      const rect = new fabric.Rect({
        left: bbox.x0 * this.ratio,
        top: bbox.y0 * this.ratio,
        fill: 'transparent',
        width: (bbox.x1 - bbox.x0) * this.ratio,
        height: (bbox.y1 - bbox.y0) * this.ratio,
        objectCaching: false,
        stroke: 'blue',
        strokeWidth: 1,
        lockRotation:true,
        hasRotatingPoint: false
      });
  
      this.fabricCanvas.add(rect);      
    }  
  }
  private drawImageScaled(img: any): void {
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;
    const hRatio = width / img.width;
    const vRatio = height / img.height;
    this.ratio = Math.min(hRatio, vRatio);
    if (this.ratio > 1) {
      this.ratio = 1;
    }

    this.canvas.nativeElement.width = img.width * this.ratio;
    this.canvas.nativeElement.height = img.height * this.ratio;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * this.ratio, img.height * this.ratio);
  }  
  async analyse(){
    const scheduler = createScheduler();
    const worker1 = createWorker();
    const worker2 = createWorker();
    const rectangles = [];
    
    this.fabricCanvas.forEachObject((obj) =>{
      const bound = obj.getBoundingRect();
      rectangles.push({left:bound.left/this.ratio,top:bound.top/this.ratio,width:bound.width/this.ratio,height:bound.height/this.ratio});
      // console.log(bound.left/this.ratio,bound.top/this.ratio,bound.width,bound.height);
    })
    // await worker1.load();
    // await worker2.load();
    // await worker1.loadLanguage('deu');
    // await worker2.loadLanguage('deu');
    // await worker1.initialize('deu');
    // await worker2.initialize('deu');
    // scheduler.addWorker(worker1);
    // scheduler.addWorker(worker2);
    // const results = await Promise.all(rectangles.map((rectangle) => (
    //   scheduler.addJob('recognize', this.image, { rectangle })
    // )));
    // console.log(results.map(r => r.data.text));
    // await scheduler.terminate();
    
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const rectangle = rectangles[0]
    const { data: { text } } = await worker.recognize(this.blob, { rectangle });
    console.log(text);
    await worker.terminate();
    
  }
}
