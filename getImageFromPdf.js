const fs = require('fs');
const pdfjsLib = require('pdfjs-dist');

async function extractImagesFromPDF(pdfPath) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const images = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const operatorList = await page.getOperatorList(); // 获取这个页面的操作列表（数组列表，对应下面的一些 OPS 操作常量）
        // { fnArray: number[], argsArray: number[][] }
        console.log('operatorList:zzz', operatorList);
        
        const imageData = [];
        for (let i = 0; i < operatorList.fnArray.length; i++) {
             // 匹配操作时，进入此判断
            if (operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                console.log('index', i);
                
                imageData.push({
                    operatorIndex: i,
                    objId: operatorList.argsArray[i][0],
                });
            }
        }

        console.log('imageData:zzz', imageData);
        

        for (const data of imageData) {
            console.log('data:zzz', data);
            
            // page.commonObjs 是一个 Map 对象，存储了 PDF 中的所有对象，包括图片、字体等
            // page.commonObjs.get(data.objId) 获取到图片对象
            // page.commonObjs.get(data.objId).getData() 获取到图片的二进制数据
            const imgData = await page.commonObjs.get(data.objId);
            console.log('imgData:111', imgData);
            
            const operatorIndex = data.operatorIndex; // 操作索引 6
            console.log('operatorIndex:zzz', operatorIndex);
            
            const transform = operatorList.argsArray[operatorIndex][1]; // 变换矩阵
            console.log('transform:zzz', transform);
            
            const width = operatorList.argsArray[operatorIndex][2]; // 宽度
            const height = operatorList.argsArray[operatorIndex][3]; // 高度
            console.log('width:zzz, height:zzz', width, height);
            
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
