import throttle from "lodash/throttle";

import { includeReactPdf } from "@/client/util/pdf";

includeReactPdf();
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Document, Page } from "react-pdf";

function UploadedDocumentViewer({
  documentUrl,
  containerWidthPercent,
}: {
  documentUrl: string;
  containerWidthPercent: number;
}) {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const [width, setWidth] = useState<number | undefined>(undefined);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);

  const setDivSize = useCallback(() => {
    if (pdfWrapperRef.current) {
      setWidth(pdfWrapperRef.current.getBoundingClientRect().width);
    }
  }, []);

  const throttledSetDivSize = useMemo(
    () => throttle(setDivSize, 500),
    [setDivSize]
  );

  useEffect(() => {
    throttledSetDivSize();
  }, [containerWidthPercent, throttledSetDivSize]);

  return (
    <div className="w-full" ref={pdfWrapperRef}>
      <Document file={documentUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            width={width}
            key={`page_${index + 1}`}
            pageNumber={index + 1}
          />
        ))}
      </Document>
    </div>
  );
}

export default UploadedDocumentViewer;
