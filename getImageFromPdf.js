const pdfjs = require('pdfjs-dist');
const fs = require('fs');

// 读取PDF文件和SVG文件
const pdfData = fs.readFileSync('./1111.pdf');
const svgData = fs.readFileSync('./Medium.svg', 'utf-8');

// 异步函数来处理PDF和SVG
async function addWatermarkToPDF(pdfData, svgData) {
    console.log('0');
    
    const loadingTask = pdfjs.getDocument({ url: './1111.pdf' });
    const pdfDocument = await loadingTask.promise;
    console.log('0.5');
    

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
        const page = await pdfDocument.getPage(pageNumber);
        console.log('1');
        
        const viewport = page.getViewport({ scale: 1.0 });
        const svgOverlay = `<foreignObject width="${viewport.width}" height="${viewport.height}">
                                <body xmlns="http://www.w3.org/1999/xhtml">
                                <div style="position: absolute; top: 0; left: 0;">
                                    ${svgData}
                                </div>
                                </body>
                            </foreignObject>`;
    
        const svgGfx = await page.getOperatorList();
        svgGfx.addOp(pdfjs.OPS.paintJpegXObject, ['q', '0.5', '0', '0', '0.5', '0', '0', 'cm', '0', 'Do', 'Q']);
        svgGfx.addOp(pdfjs.OPS.paintImageXObject, ['q', '0.5', '0', '0', '0.5', '0', '0', 'cm', '0', 'I0', 'Q']);
        console.log('2');
        
        const svgStream = new pdfjs.PDFStream(svgGfx);
        svgStream.setData(svgOverlay);
    
        page.objs.get('Resources').put('XObject', 'I0', svgStream);
    }
    
    const resultData = await pdfDocument.saveDocument();

    // 将带有水印的PDF保存到文件
    fs.writeFileSync('1111_mark.pdf', resultData);
}
    
addWatermarkToPDF(pdfData, svgData).catch(error => console.error(error));
    








