import fs from "fs";
import * as mupdf from "mupdf";
// var fs = require("fs");
// var mupdf = require("mupdf");

function createBlankPDF() {
  var doc = new mupdf.PDFDocument();
  doc.insertPage(0, doc.addPage([0, 0, 595, 842], 0, null, ""));
  return doc;
}

function savePDF(doc, path, opts) {
  fs.writeFileSync(path, doc.saveToBuffer(opts).asUint8Array());
}

try {
  var doc = createBlankPDF();
  var page = doc.loadPage(0);
  var annot;
  var text = new mupdf.Text();
  text.showGlyph(
    new mupdf.Font("Times-Roman"),
    mupdf.Matrix.identity,
    21,
    0x66,
    0
  );
  text.showGlyph(
    new mupdf.Font("Times-Roman"),
    mupdf.Matrix.identity,
    -1,
    0x69,
    0
  );
  text.showString(
    new mupdf.Font("Times-Roman"),
    mupdf.Matrix.identity,
    "Hello"
  );
  annot = page.createAnnotation("Text");
  annot.setRect([200, 10, 250, 50]);
  annot.setContents("This is a Text annotation!");
  annot.setColor([0, 0.5, 1]);

  annot = page.createAnnotation("FreeText");
  annot.setRect([10, 10, 200, 50]);
  annot.setContents("This is a FreeText annotation!");
  annot.setDefaultAppearance("TiRo", 18, [0]);

  savePDF(doc, "out.pdf", "");
} catch (err) {
  console.error(err);
  process.exit(1);
}
