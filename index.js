const fs = require('fs');
const { createCanvas, loadImage, Canvas, Image } = require('canvas');
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');

const init = async () => {
let settings = './settings.json'
let config = require(settings);

let outWidth = config.outputWidth;
let outHeight = config.outputHeight;
let inputDir = config.inputDir;
let outputDir = config.outputDir;

const imgFiles = await readdir(path.join(__dirname, inputDir));

let cnt = 0;
for (let i = 0; i < imgFiles.length; i+=2) {
    const canvas = createCanvas(outWidth, outHeight)
    const ctx = canvas.getContext('2d')
    let img_1 = await loadImage(path.join(__dirname, inputDir,imgFiles[i]))
    let img_2 = await loadImage(path.join(__dirname, inputDir,imgFiles[i+1]))
    ctx.drawImage(img_1, 0, 0, img_1.width, img_1.height);
    ctx.drawImage(img_2, (outWidth-img_2.width), 0, img_2.width, img_2.height);

    let out = fs.createWriteStream(path.join(__dirname, outputDir,`${cnt}.jpg`))
    let stream = canvas.createJPEGStream({ quality: 1.0 , chromaSubsampling: true, progressive: true})
    stream.pipe(out)
    out.on('finish', () =>  console.log('The JPG file was created.'))
    cnt++;
}

};

init();
