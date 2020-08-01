const fs = require('fs');
const { createCanvas, loadImage, Canvas, Image } = require('canvas');
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');

const init = async () => {
let config = require('./settings.json');

let outWidth = config.outputWidth;
let outHeight = config.outputHeight;
let inputDir = config.inputDir;
let outputDir = config.outputDir;
let useAverage = config.useAverage;

const imgFiles = await readdir(path.join(__dirname, inputDir));

const loaded = []
let avg_width = 0;
let avg_height = 0;

for (const key in imgFiles) {
    let img = await loadImage(path.join(__dirname, inputDir, imgFiles[key]))
    loaded.push(img)
    avg_width += img.width
    avg_height += img.height
}
avg_width /= imgFiles.length
avg_height /= imgFiles.length

if(useAverage){
    outWidth = avg_width*2
    outHeight = avg_height
}

let cnt = 0;
for (let i = 0; i < loaded.length; i+=2) {
    const canvas = createCanvas(outWidth, outHeight)
    const ctx = canvas.getContext('2d')
    let img_1 = loaded[i]
    let img_2 = loaded[i+1]

    let adg_1 = (outHeight-img_1.height)
    let img_1_h = img_1.height+adg_1;
    let img_1_w = (adg_1>0)?img_1.width+adg_1:img_1.width+adg_1/2;
    
    let adg_2 = (outHeight-img_2.height)
    let img_2_h = img_2.height+(outHeight-img_2.height);
    let img_2_w = (adg_2>0)?img_2.width+adg_2:img_2.width+adg_2/2;
    

    ctx.drawImage(img_1, 0, 0, img_1_w, img_1_h);
    ctx.drawImage(img_2, (outWidth-img_2_w), 0, img_2_w, img_2_h);

    let out = fs.createWriteStream(path.join(__dirname, outputDir,`${cnt}.jpg`))
    let stream = canvas.createJPEGStream({ quality: 1.0 , chromaSubsampling: true, progressive: true})
    stream.pipe(out)
    out.on('finish', () =>  console.log('The JPG file was created.'))
    cnt++;
}

};

init();
