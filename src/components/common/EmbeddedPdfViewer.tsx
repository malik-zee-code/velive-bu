
'use client';

import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

// Configure the PDF.js worker from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EmbeddedPdfViewerProps {
  file: string;
  children?: React.ReactNode;
}

export const EmbeddedPdfViewer = ({ file, children }: EmbeddedPdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  const onPageRenderSuccess = useCallback((page: any) => {
    setPageWidth(page.width);
  }, []);

  const LoadingSkeleton = () => (
    <div className="flex justify-center items-center bg-secondary rounded-lg p-4">
      <Skeleton className="w-full h-[500px]" />
    </div>
  );
  
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setPageWidth(node.getBoundingClientRect().width);
    }
  }, []);


  return (
    <Card className="overflow-hidden shadow-lg border w-full">
        <CardContent className="p-0 flex justify-center bg-secondary">
            <div className="w-full overflow-hidden" ref={containerRef}>
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={console.error}
                    loading={<LoadingSkeleton />}
                    className="flex justify-center"
                >
                    <Page
                        pageNumber={pageNumber}
                        renderTextLayer={false}
                        renderAnnotationLayer
                        loading={<LoadingSkeleton />}
                        className="shadow-md"
                        width={pageWidth > 0 ? pageWidth : undefined}
                    />
                </Document>
            </div>
        </CardContent>
        <CardFooter className="bg-muted p-2 flex flex-wrap items-center justify-center gap-4 border-t">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                    Page {pageNumber} of {numPages || '...'}
                </span>
                <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={pageNumber >= (numPages || 0)}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
            {children}
        </CardFooter>
    </Card>
  );
};
