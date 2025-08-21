
'use client';

import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '../ui/skeleton';

// Configure the PDF.js worker from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: string;
}

export const PdfViewer = ({ file }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const isMobile = useIsMobile();

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const LoadingSkeleton = () => (
    <div className="flex justify-center items-center h-[500px] md:h-[700px] bg-secondary rounded-lg">
      <Skeleton className="w-full h-full" />
    </div>
  );

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Our Company Brochure</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Discover more about our services, mission, and the value we bring to your property investment.
            </p>
        </div>

        <Card className="overflow-hidden shadow-lg border">
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
            <span className="hidden md:block w-px h-6 bg-border mx-2"></span>
            <Button variant="ghost" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={zoomIn} disabled={scale >= 3}>
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button asChild variant="ghost" size="sm" className="ml-auto">
              <a href={file} download>
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </div>
          <CardContent className="p-0 flex justify-center bg-secondary">
            <div className="overflow-auto w-full h-[500px] md:h-[700px]">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={console.error}
                loading={<LoadingSkeleton />}
                className="flex justify-center"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={isMobile ? 1.0 : scale}
                  renderTextLayer={false}
                  renderAnnotationLayer
                  loading={<LoadingSkeleton />}
                  width={isMobile ? 380 : undefined}
                  className="shadow-md"
                />
              </Document>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
