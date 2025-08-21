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
  const isMobile = useIsMobile();

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  const LoadingSkeleton = () => (
    <div className="flex justify-center items-center bg-secondary rounded-lg p-4">
      <Skeleton className="w-full h-[50vh] md:h-[70vh]" />
    </div>
  );

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Our Company Brochure</h2>
                <p className="text-muted-foreground mt-4 max-w-2xl">
                    Discover more about our services, mission, and the value we bring to your property investment. Download our brochure for an in-depth look at how VE-Live is redefining property management in the UAE.
                </p>
                 <Button asChild size="lg" className="mt-8">
                  <a href={file} download>
                    <Download className="mr-2 h-5 w-5" />
                    Download Now
                  </a>
                </Button>
            </div>

            <div className="w-full">
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
                </div>
                <CardContent className="p-0 flex justify-center bg-secondary">
                    <div className="w-full overflow-hidden">
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
                        />
                    </Document>
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </section>
  );
};
