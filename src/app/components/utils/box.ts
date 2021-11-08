
export class BoxComponent {
  
  
  x = 0;
  y = 0;
  w = 1; // default width and height?
  h = 1;
  fill = '#444444';
  // holds all our boxes
  boxes2 = [];

  // New, holds the 8 tiny boxes that will be our selection handles
  // the selection handles will be in this order:
  // 0  1  2
  // 3     4
  // 5  6  7
  selectionHandles = [];

  // Hold canvas information
  canvas;
  ctx;
  WIDTH;
  HEIGHT;
  INTERVAL = 20;  // how often, in milliseconds, we check to see if a redraw is needed

  isDrag = false;
  isResizeDrag = false;
  expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
  mx;
  my; // mouse coordinates

  // when set to true, the canvas will redraw everything
  // invalidate() just sets this to false right now
  // we want to call invalidate() whenever we make a change
  canvasValid = false;

  // The node (if any) being selected.
  // If in the future we want to select multiple objects, this will get turned into an array
  mySel = null;

  // The selection color and width. Right now we have a red selection with a small width
  mySelColor = '#CC0000';
  mySelWidth = 2;
  mySelBoxColor = 'darkred'; // New for selection boxes
  mySelBoxSize = 6;

  // we use a fake canvas to draw individual shapes for selection testing
  ghostcanvas;
  gctx; // fake canvas context

  // since we can drag from anywhere in a node
  // instead of just its x/y corner, we need to save
  // the offset of the mouse when we start dragging.
  offsetx;
  offsety;

  // Padding and border style widths for mouse offsets
  stylePaddingLeft;
  stylePaddingTop;
  styleBorderLeft;
  styleBorderTop;
  constructor() {

  }

  ngOnInit(): void {
    this.canvas = document.getElementById('canvas');
    this.HEIGHT = this.canvas.height;
    this.WIDTH = this.canvas.width;
    this.ctx = this.canvas.getContext('2d');
    this.ghostcanvas = document.createElement('canvas');
    this.ghostcanvas.height = this.HEIGHT;
    this.ghostcanvas.width = this.WIDTH;
    this.gctx = this.ghostcanvas.getContext('2d');

    //fixes a problem where double clicking causes text to get selected on the canvas
    this.canvas.onselectstart = function () { return false; }

    // fixes mouse co-ordinate problems when there's a border or padding
    // see getMouse for more detail
    if (document.defaultView && document.defaultView.getComputedStyle) {
      this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingLeft'], 10) || 0;
      this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingTop'], 10) || 0;
      this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderLeftWidth'], 10) || 0;
      this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderTopWidth'], 10) || 0;
    }

    // make draw() fire every INTERVAL milliseconds.
    setInterval(this.draw, this.INTERVAL);

    // add our events. Up and down are for dragging,
    // double click is for making new boxes
    // this.canvas.onmousedown = this.myDown;
    // this.canvas.onmouseup = this.myUp;
    // this.canvas.ondblclick = this.myDblClick;

    // add custom initialization here:

    // add an orange rectangle
    // this.addRect(200, 200, 40, 40, '#FFC02B');

    // add a smaller blue rectangle
    // this.addRect(25, 90, 25, 25, '#2BB8FF');
  }
  // we used to have a solo draw function
  // but now each box is responsible for its own drawing
  // mainDraw() will call this with the normal canvas
  // myDown will call this with the ghost canvas with 'black'
  draw(context, optionalColor) {
    if (context === this.gctx) {
      context.fillStyle = 'black'; // always want black for the ghost canvas
    } else {
      context.fillStyle = this.fill;
    }

    // We can skip the drawing of elements that have moved off the screen:
    if (this.x > this.WIDTH || this.y > this.HEIGHT) return;
    if (this.x + this.w < 0 || this.y + this.h < 0) return;

    context.fillRect(this.x, this.y, this.w, this.h);

    // draw selection
    // this is a stroke along the box and also 8 new selection handles
    if (this.mySel === this) {
      context.strokeStyle = this.mySelColor;
      context.lineWidth = this.mySelWidth;
      context.strokeRect(this.x, this.y, this.w, this.h);

      // draw the boxes

      const half = this.mySelBoxSize / 2;

      // 0  1  2
      // 3     4
      // 5  6  7

      // top left, middle, right
      this.selectionHandles[0].x = this.x - half;
      this.selectionHandles[0].y = this.y - half;

      this.selectionHandles[1].x = this.x + this.w / 2 - half;
      this.selectionHandles[1].y = this.y - half;

      this.selectionHandles[2].x = this.x + this.w - half;
      this.selectionHandles[2].y = this.y - half;

      //middle left
      this.selectionHandles[3].x = this.x - half;
      this.selectionHandles[3].y = this.y + this.h / 2 - half;

      //middle right
      this.selectionHandles[4].x = this.x + this.w - half;
      this.selectionHandles[4].y = this.y + this.h / 2 - half;

      //bottom left, middle, right
      this.selectionHandles[6].x = this.x + this.w / 2 - half;
      this.selectionHandles[6].y = this.y + this.h - half;

      this.selectionHandles[5].x = this.x - half;
      this.selectionHandles[5].y = this.y + this.h - half;

      this.selectionHandles[7].x = this.x + this.w - half;
      this.selectionHandles[7].y = this.y + this.h - half;


      context.fillStyle = this.mySelBoxColor;
      for (let i = 0; i < 8; i++) {
        const cur = this.selectionHandles[i];
        context.fillRect(cur.x, cur.y, this.mySelBoxSize, this.mySelBoxSize);
      }
    }

  } // end draw

}
