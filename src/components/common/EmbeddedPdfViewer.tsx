'use client';

import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

// Configure the PDF.js worker from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EmbeddedPdfViewerProps {
  file: string;
}

export const EmbeddedPdfViewer = ({ file }: EmbeddedPdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  const LoadingSkeleton = () => (
    <div className="flex justify-center items-center bg-secondary rounded-lg p-4">
      <Skeleton className="w-full h-[400px]" />
    </div>
  );

  return (
    <Card className="overflow-hidden shadow-lg border w-full">
        <div className="bg-muted p-2 flex flex-wrap items-center justify-center gap-2 md:gap-4 border-b">
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
        <CardContent className="p-0 flex justify-center bg-secondary">
            <div className="w-full overflow-hidden h-[400px] overflow-y-auto">
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
                        width={400} // Adjust width as needed
                    />
                </Document>
            </div>
        </CardContent>
    </Card>
  );
};
