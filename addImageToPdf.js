const {PDFDocument} = require('pdf-lib');

const fs = require('fs');

const addImageToPdf = async () => {
    const doc = await PDFDocument.create();

    const page1 = doc.addPage();
    const page2 = doc.addPage();
    const page3 = doc.addPage();
    const page4 = doc.addPage();
    const page5 = doc.addPage();

    let img1 = fs.readFileSync("./images/123.png");
    let img2 = fs.readFileSync("./images/图片 2.png");
    let img3 = fs.readFileSync("./images/图片 3.png");
    let img4 = fs.readFileSync("./images/图片 4.png");
    let img6 = fs.readFileSync("./images/dog-1728494_1280.png");

    img1 = await doc.embedPng(img1);
    img2 = await doc.embedPng(img2);
    img3 = await doc.embedPng(img3);
    img4 = await doc.embedPng(img4);
    img6 = await doc.embedPng(img6);

    page1.drawImage(img1, {});
    page2.drawImage(img2, {});
    page3.drawImage(img3, {});
    page4.drawImage(img4, {});
    page5.drawImage(img6, {});

    fs.writeFileSync('./test.pdf', await doc.save());
}

addImageToPdf().catch(err => console.log(err));




