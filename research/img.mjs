import fs from "fs";
import * as mupdf from "mupdf";
let fileData = fs.readFileSync("./cmyk-simple.pdf");
// let fileData = fs.readFileSync("../svg-pdf.pdf");

let document = mupdf.Document.openDocument(fileData, "application/pdf");
let page = document.loadPage(0);

// Get the PDF object corresponding to the page
const page_obj = page.getObject();
const imageInstance = new mupdf.Image(fs.readFileSync("../songzi_cmyk.jpg"));

var image = document.addImage(imageInstance);

// add image object to page/Resources/XObject/MyCats dictionary (creating nested dictionaries as needed)
var res = page_obj.get("Resources");
if (!res.isDictionary())
  page_obj.put("Resources", (res = document.newDictionary()));

var res_xobj = res.get("XObject");
if (!res_xobj.isDictionary())
  res.put("XObject", (res_xobj = document.newDictionary()));

res_xobj.put("MyCats", image);

// create drawing operations
var extra_contents = document.addStream(
  "q 200 0 0 200 10 10 cm /MyCats Do Q",
  null
);

// add drawing operations to page contents
var page_contents = page_obj.get("Contents");
if (page_contents.isArray()) {
  // Contents is already an array, so append our new buffer object.
  page_contents.push(extra_contents);
} else {
  // Contents is not an array, so change it into an array
  // and then append our new buffer object.
  var new_page_contents = document.newArray();
  new_page_contents.push(page_contents);
  new_page_contents.push(extra_contents);
  page_obj.put("Contents", new_page_contents);
}

// Save the changes to a new file.
fs.writeFileSync(
  "output-img.pdf",
  document.saveToBuffer("incremental").asUint8Array()
);
