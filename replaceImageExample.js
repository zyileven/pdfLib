const fs = require('fs');
const path = require('path');
const {
  PDFDocument,
  PDFName,
  PDFRawStream,
} = require('pdf-lib');

async function test(inputPdfDir, newBuffer, index, outputPdfDir) {
    // Load the original PDF
    const pdfDoc = await PDFDocument.load(fs.readFileSync(path.join(__dirname, inputPdfDir)));
    const imagesInDoc = [];
    console.log('pdfDoc.context.indirectObjects', pdfDoc.context.indirectObjects);
    pdfDoc.context.indirectObjects.forEach((pdfObject, ref) => {
      if (!(pdfObject instanceof PDFRawStream)) return;
      const {
        dict: {
          dict: dict
        }
      } = pdfObject;
      const smaskRef = dict.get(PDFName.of('SMask'));
      const colorSpace = dict.get(PDFName.of('ColorSpace'));
      const subtype = dict.get(PDFName.of('Subtype'));
      const width = dict.get(PDFName.of('Width'));
      const height = dict.get(PDFName.of('Height'));
      const name = dict.get(PDFName.of('Name'));
      const bitsPerComponent = dict.get(PDFName.of('BitsPerComponent'));
      const filter = dict.get(PDFName.of('Filter'));
      if (subtype === PDFName.of('Image')) {
        imagesInDoc.push({
          ref,
          smaskRef,
          colorSpace,
          name: name ? name.encodedName : `Object${ref.objectNumber}`,
          width: width.numberValue,
          height: height.numberValue,
          bitsPerComponent: bitsPerComponent.numberValue,
          data: pdfObject.contents,
          type: 'jpg'
        });
      }
    })
    console.log('imagesInDoc.length:zzz', imagesInDoc.length);
    
    // Find and mark SMasks as alpha layers
    imagesInDoc.forEach(image => {
      if (image.type === 'png' && image.smaskRef) {
        const smaskImg = imagesInDoc.find(({
          ref
        }) => ref === image.smaskRef);
        smaskImg.isAlphaLayer = true;
        image.alphaLayer = image;
      }
    })
    console.log(`\nfound images: ${imagesInDoc.length}\n`);

    //Export images
    // const imagesFolder=path.join(__dirname,'images');
    // imagesInDoc.forEach(image => {
    //   fs.writeFileSync(path.join(imagesFolder,`image_obj${image.ref.objectNumber}.${image.type}`),image.data);// 将原有图片保存在文件夹中
    // })
    // console.log(`images has been output at\n${imagesFolder}\n`)

    // Replace image
    // It is assumed here that the last picture is replaced.
    const correctedFile=path.join(__dirname, outputPdfDir); // 输出pdf路径
    pdfDoc.context.indirectObjects.get(imagesInDoc[index].ref).contents=newBuffer; // 使用新图片替换掉最后一个， 也可以根据顺序一个一个替换
    pdfDoc.save().then((res)=>{
      fs.writeFileSync(correctedFile, res); //替换完成后保存pdf
      console.log(`image has been replaced and the corrected file is saved in\n${correctedFile}\n`)
    }).catch(e=>console.log(e))
}

module.exports = test;