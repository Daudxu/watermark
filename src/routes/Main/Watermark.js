import Canvas2Image from "../../utils/Canvas2Image";

function canvasTextAutoLine(ctx, width, str, initX, initY, lineHeight = 20) {
  var lineWidth = 0;
  var canvasWidth = width;
  var lastSubStrIndex = 0;
  for (let i = 0; i < str.length; i++) {
    lineWidth += ctx.measureText(str[i]).width;

    if (lineWidth > canvasWidth - initX) {
      ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
      initY += lineHeight;
      lineWidth = 0;
      lastSubStrIndex = i;
    }
    if (i === str.length - 1) {
      ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
    }
  }
}

function Watermark(canvas, opt = {}) {
  let img;
  let step = 0;
  let cw = document.createElement("canvas");
  let img_width, img_height;
  let userOptions = opt;

  const getOptions = () => {
    const defaultOptions = {
      text: "DIGINATION.IO",
      fontSize: 23,
      fillStyle: "rgba(100, 100, 100, 0.4)",
      watermarkWidth: 280,
      watermarkHeight: 180,
      rotateAngle: -16 // 默认旋转角度
    };
    const options = { ...defaultOptions, ...userOptions };
    if (options.fontSize < 10) {
      options.fontSize = 10;
    } else {
      options.fontSize = parseInt(options.fontSize, 10);
    }
    if (options.watermarkWidth < 100) {
      options.watermarkWidth = 100;
    }
    if (options.watermarkHeight < 100) {
      options.watermarkHeight = 100;
    }
    return options;
  };

  const createWatermarkCanvas = () => {
    const { text, fontSize, fillStyle, watermarkWidth, watermarkHeight, rotateAngle } = getOptions();
    const wctx = cw.getContext("2d");
    const { sqrt, pow, sin, cos } = Math;
    
    const radians = rotateAngle * Math.PI / 180;
    const sinAngle = sin(radians);
    const cosAngle = cos(radians);

    // 计算适当的画布大小
    cw.width = sqrt(pow(watermarkWidth, 2) + pow(watermarkHeight, 2));
    cw.height = sqrt(pow(watermarkWidth, 2) + pow(watermarkHeight, 2));

    wctx.font = `${fontSize}px Arial`;

    wctx.translate(cw.width / 2, cw.height / 2); // 平移到画布中心
    wctx.rotate(radians); // 旋转画布
    wctx.translate(-cw.width / 2, -cw.height / 2); // 平移回画布原点

    wctx.fillStyle = fillStyle;

    const x = (cw.width - watermarkWidth) / 2;
    const y = (cw.height + fontSize) / 2;

    canvasTextAutoLine(wctx, watermarkWidth, text, x, y, fontSize * 1.4);
  };

  const _draw = () => {
    drawImage();
    addWatermark();
  };

  const drawImage = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch (step) {
      default:
      case 0:
        canvas.width = img_width;
        canvas.height = img_height;
        ctx.drawImage(img, 0, 0, img_width, img_height);
        break;
      case 1:
        canvas.width = img_height;
        canvas.height = img_width;
        ctx.save();
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(img, 0, -img_height, img_width, img_height);
        ctx.restore();
        break;
      case 2:
        canvas.width = img_width;
        canvas.height = img_height;
        ctx.save();
        ctx.rotate(180 * Math.PI / 180);
        ctx.drawImage(img, -img_width, -img_height, img_width, img_height);
        ctx.restore();
        break;
      case 3:
        canvas.width = img_height;
        canvas.height = img_width;
        ctx.save();
        ctx.rotate(270 * Math.PI / 180);
        ctx.drawImage(img, -img_width, 0, img_width, img_height);
        ctx.restore();
        break;
    }
  };

  const addWatermark = () => {
    var pat = ctx.createPattern(cw, "repeat");
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  this.draw = dataURL => {
    step = 0;
    img = new Image();
    img.onload = () => {
      img_width = img.width;
      const max = 2000;
      if (img_width > max) {
        img_width = max;
        img_height = max * img.height / img.width;
      } else {
        img_height = img.height;
      }
      _draw();
    };
    img.src = dataURL;
  };

  this.rotate = () => {
    if (!img) {
      return;
    }
    step >= 3 ? (step = 0) : step++;
    _draw();
  };

  this.save = () => {
    if (!img) {
      return;
    }
    Canvas2Image.saveAsJPEG(canvas);
  };

  this.setOptions = (obj = {}) => {
    userOptions = obj;
    createWatermarkCanvas();
    if (!img) {
      return;
    }
    _draw();
  };

  const watermarkCanvas = document.createElement("canvas");
  watermarkCanvas.width = "160px";
  watermarkCanvas.height = "100px";
  const ctx = canvas.getContext("2d");
  createWatermarkCanvas();
}

export default Watermark;
