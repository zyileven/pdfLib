const pdfjsLib = require('pdfjs-dist');
const fs = require('fs');
const test = require('./replaceImageExample');
const PNG = require('pngjs').PNG;

const PDFJS = pdfjsLib;
const pdfMime = 'application/pdf';

const imageInfos = [];

const parsePage = async (page, pageInfo) => {

    const pageDetail = await page.getXfa();
    
    const operatorList = await page.getOperatorList();

    const fns = operatorList.fnArray;
    const args = operatorList.argsArray;
    console.log('args.length:zzz', args.length);
    
    let imgsFound = 0;

    args.forEach((arg, i) => {
        //Not a JPEG resource:
        if (fns[i] !== PDFJS.OPS.paintImageXObject) { return; }
        console.log('loading:zzz', arg);
        imgsFound++;

        const imgKey = arg[0];
        const imgInfo = {
                  name: pageInfo.name + '-' + imgsFound + '.png',
                  url: '',
              };
        pageInfo.images.push(imgInfo);
        const pageObj = page.objs;
        console.log('pageObj:zzz', pageObj);
        
        pageObj.get(imgKey, async (img) => {
            // now you need a new clamped array because the original one, 
            // may not contain rgba data, and when you insert you want to do so in rgba form, 
            // I think that a simple check of the size of the clamped array should work, 
            // if it's 3 times the size aka width*height*3 then it's rgb and shall be converted, 
            // if it's 4 times, then it's rgba and can be used as it is; in my case it had to be converted, 
            // and I think it will be the most common case
            const imageData = new Uint8ClampedArray(img.width * img.height * 4);
            let k = 0;
            let i = 0;
            while (i < img.data.length) {
                imageData[k] = img.data[i]; // r
                imageData[k + 1] = img.data[i + 1]; // g
                imageData[k + 2] = img.data[i + 2]; // b
                imageData[k + 3] = 255; // a

                i += 3;
                k += 4;
            }

            const png = new PNG({ width: img.width, height: img.height });
            png.data = imageData;

            // 1.为图片加上水印

            // const newImageFilePath = 'path/to/your/new/image.png';

            // 2.替换旧图片
            // fs.copyFileSync(newImageFilePath, 'path/to/your/output/image.png');

            // arg = pdfDocument.xref.get('path/to/your/output/image.png');

            // 将写好的保存
            // const pdfWriter = pdfDocument.getWriter();
            // pdfWriter.getStreamData().forEach(function(data, index, array) {
            //     fs.appendFileSync('output.pdf', data);
            // });

            // 输出原图到output目录
            const writeStream = await fs.createWriteStream(`./output/${imgInfo.name}`);
            await png.pack().pipe(writeStream);

            // (==) 假设这里处理了水印，后面从masked里面来获取图片去更新

            // 对原图进行水印添加，然后把新图片 newBuffer，用于替换原来的图片
            const newBuffer = await fs.readFileSync(`./marked/${imgInfo.name}`);

            // i: 当前处理第几个图片
            await test('./1111.pdf', newBuffer, imgsFound , './1111_mark.pdf')

        });
    })
}

const handleFiles = async () => {
    const doc = await PDFJS.getDocument({url: "./1111.pdf"}).promise;
    for (let p = 0; p < doc.numPages; p++) {
        const pageInfo = {
            page: p + 1,
            name: `test.pdf - ${p + 1}`,
            images: [],
        }
        const page = await doc.getPage(p + 1);
        await parsePage(page, pageInfo);
    }
}

async function handleReplace() {
    const images = await fs.readdirSync("./output");
    console.log('images：', images);
    
}

handleFiles()

handleReplace()


