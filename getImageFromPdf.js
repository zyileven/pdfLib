const fs = require('fs');
const pdfjsLib = require('pdfjs-dist');

async function extractImagesFromPDF(pdfPath) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const images = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const operatorList = await page.getOperatorList();
        // { fnArray: [], argsArray: [[],[]...] }
        console.log('pdfjsLib.OPS.paintImageXObject:', pdfjsLib.OPS.paintImageXObject);
        
        const imageData = [];
        for (let i = 0; i < operatorList.fnArray.length; i++) {
            if (operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                console.log('imageData:zzz', imageData);
                
                imageData.push({
                    operatorIndex: i,
                    objId: operatorList.argsArray[i][0],
                });
            }
        }

        for (const data of imageData) {
            const imgData = await page.commonObjs.get(data.objId).getData();
            const operatorIndex = data.operatorIndex;
            const transform = operatorList.argsArray[operatorIndex][1];
            const width = operatorList.argsArray[operatorIndex][2];
            const height = operatorList.argsArray[operatorIndex][3];

            images.push({
                pageNumber,
                x: transform[4],
                y: transform[5],
                width,
                height,
                data: imgData,
            });
        }
    }

    return images;
}

const pdfPath = './test.pdf';
extractImagesFromPDF(pdfPath)
    .then(images => {
        console.log(images);
    })
    .catch(error => {
        console.error(error);
    });
