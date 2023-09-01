const PDFWatermark = require("pdf-watermark");

PDFWatermark(
    {
        pdf_path:
            "./test.pdf",
        image_path:
            "./333.png",
        // text: "Gentech",
        output_dir:
            "./test_mark.pdf", // remove to override file
    },
);
