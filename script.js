var fileBytes = null;

document.querySelector("#pdf-create").addEventListener("click", function(e){
  
  var selectedPages = Array.from(document.querySelectorAll("canvas.selected")).map(x => x.dataset.pageIndex);
  
  if(!fileBytes) { alert("Please select a file first"); }
  else if(selectedPages.length == 0) { alert("Select at least one page");  }
  else {
    createPdf(selectedPages);
  }
  
  
});

document.querySelector("#pdf-upload").addEventListener("change", function(e){
	
  document.querySelector("#pdf-pages").innerHTML = '';

	var file = e.target.files[0]
	if(file.type != "application/pdf"){
		console.error(file.name, "is not a pdf file.")
		return
	}
	
	var fileReader = new FileReader();  

	fileReader.onload = function() {
		fileBytes = new Uint8Array(this.result);
    
		PDFJS.getDocument(fileBytes).then(function(pdf) {

       for(var i=1; i <= pdf.numPages; i++) {
      
              pdf.getPage(i).then(function(page) {

                 var viewport = page.getViewport(0.4);
                
                 var canvas = document.createElement("canvas");
                 canvas.dataset.pageIndex = page.pageIndex;
                 canvas.classList.add("clickable");
                 canvas.addEventListener("click", function(e){ canvas.classList.toggle("selected"); });
                 canvas.height = viewport.height;
                 canvas.width = viewport.width;
                 document.querySelector("#pdf-pages").appendChild(canvas);
                
                page.render({
                  canvasContext: canvas.getContext('2d'),
                  viewport: viewport
                });
           });
      }

		});
	};

	fileReader.readAsArrayBuffer(file);
});


async function createPdf(pageIndexes) {
  const newPdfDoc = await PDFLib.PDFDocument.create();
  const existingPdfDoc = await PDFLib.PDFDocument.load(fileBytes);
  
  const pagesToCopy = await newPdfDoc.copyPages(existingPdfDoc, pageIndexes);
  pagesToCopy.forEach(x => newPdfDoc.addPage(x));
  
  const pdfBytes = await newPdfDoc.save();
  download(pdfBytes, "output.pdf", "application/pdf");
}