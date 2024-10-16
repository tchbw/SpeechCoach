import React, { useState } from "react";
import { Document, Page } from "react-pdf";

import { includeReactPdf } from "@/client/util/pdf";

// Initialize react-pdf
includeReactPdf();

const PDFDocument: React.FC = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div>
      <Document
        file="https://uwaterloo.ca/onbase/sites/ca.onbase/files/uploads/files/sampleunsecuredpdf.pdf"
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <p>
        Page {pageNumber} of {numPages}
      </p>
      {pageNumber > 1 && (
        <button onClick={() => setPageNumber(pageNumber - 1)}>Previous</button>
      )}
      {pageNumber < (numPages || 0) && (
        <button onClick={() => setPageNumber(pageNumber + 1)}>Next</button>
      )}
    </div>
  );
};

export default PDFDocument;
