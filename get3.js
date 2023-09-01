const pdfjsLib = require('pdfjs-dist');

// 读取pdf文件
const pdf = pdfjsLib.getDocument(ds.readFileSync('./test.pdf')).promise;












