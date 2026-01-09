import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onPageChange?: (page: number) => void;
  onTotalPagesChange?: (total: number) => void;
  className?: string;
  externalPage?: number;
  showNavigation?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function PDFViewer({ pdfUrl, title, onPageChange, onTotalPagesChange, className = '', externalPage, showNavigation = true, size = 'medium' }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(
    size === 'large' ? 2.2 : size === 'medium' ? 1.4 : 1.2
  );
  const pageCache = useRef<Map<number, HTMLCanvasElement>>(new Map());

  useEffect(() => {
    loadPDF();
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfDocument && currentPage > 0) {
      renderPage(currentPage);
      // Preload adjacent pages for smoother navigation
      preloadAdjacentPages(currentPage);
    }
  }, [pdfDocument, currentPage, scale]);

  // Sync with external page changes
  useEffect(() => {
    if (externalPage && externalPage !== currentPage && externalPage <= totalPages && externalPage >= 1) {
      setCurrentPage(externalPage);
    }
  }, [externalPage, totalPages, currentPage]);

  const preloadAdjacentPages = async (pageNumber: number) => {
    if (!pdfDocument) return;
    
    // Preload previous and next pages in background
    const pagesToPreload = [];
    if (pageNumber > 1) pagesToPreload.push(pageNumber - 1);
    if (pageNumber < totalPages) pagesToPreload.push(pageNumber + 1);
    
    for (const pageNum of pagesToPreload) {
      if (!pageCache.current.has(pageNum)) {
        try {
          const page = await pdfDocument.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          
          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
            
            pageCache.current.set(pageNum, canvas);
          }
        } catch (err) {
          // Silently fail preloading - not critical
          console.log(`Failed to preload page ${pageNum}:`, err);
        }
      }
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with input fields
      }
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextPage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages]);

  const loadPDF = async () => {
    try {
      setIsLoading(true);
      setError(null);
      pageCache.current.clear(); // Clear cache when loading new PDF
      
      console.log('Loading PDF from URL:', pdfUrl);
      
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      if (pdf.numPages === 0) {
        throw new Error('PDF document has no pages');
      }
      
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      if (onTotalPagesChange) {
        onTotalPagesChange(pdf.numPages);
      }
    } catch (err: any) {
      console.error('Error loading PDF:', pdfUrl, err);
      let errorMessage = 'Failed to load PDF document';
      
      if (err.name === 'InvalidPDFException') {
        errorMessage = 'Invalid PDF file format';
      } else if (err.name === 'MissingPDFException') {
        errorMessage = 'PDF file not found';
      } else if (err.name === 'UnexpectedResponseException') {
        errorMessage = 'Network error loading PDF';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(`${errorMessage}: ${pdfUrl}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNumber: number) => {
    if (!pdfDocument || !canvasRef.current) return;

    try {
      setIsRenderingPage(true);
      setError(null);

      // Check if page is cached
      const cacheKey = `${pageNumber}-${scale}`;
      const cachedCanvas = pageCache.current.get(pageNumber);
      
      if (cachedCanvas && Math.abs(cachedCanvas.width / cachedCanvas.height - scale) < 0.1) {
        // Use cached version if scale is similar
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = cachedCanvas.width;
          canvas.height = cachedCanvas.height;
          context.drawImage(cachedCanvas, 0, 0);
          setIsRenderingPage(false);
          return;
        }
      }

      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // For large size, ensure canvas uses available width
      if (size === 'large') {
        const container = canvas.parentElement;
        if (container) {
          const containerWidth = container.clientWidth - 16; // Account for padding
          const scaleToFit = containerWidth / viewport.width;
          if (scaleToFit < 1) {
            canvas.style.width = `${containerWidth}px`;
            canvas.style.height = `${viewport.height * scaleToFit}px`;
          }
        }
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      
      // Cache the rendered page (limit cache size)
      if (pageCache.current.size > 10) {
        const firstKey = pageCache.current.keys().next().value;
        pageCache.current.delete(firstKey);
      }
      
      const cacheCanvas = document.createElement('canvas');
      cacheCanvas.width = canvas.width;
      cacheCanvas.height = canvas.height;
      const cacheContext = cacheCanvas.getContext('2d');
      if (cacheContext) {
        cacheContext.drawImage(canvas, 0, 0);
        pageCache.current.set(pageNumber, cacheCanvas);
      }
      
      if (onPageChange) {
        onPageChange(pageNumber);
      }
    } catch (err) {
      console.error('Error rendering page:', err);
      setError(`Failed to render page ${pageNumber}`);
    } finally {
      setIsRenderingPage(false);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      if (onPageChange) {
        onPageChange(pageNumber);
      }
    }
  };

  const adjustScale = (newScale: number) => {
    setScale(Math.max(0.5, Math.min(3, newScale)));
  };

  const adjustScale = (newScale: number) => {
    setScale(Math.max(0.5, Math.min(3, newScale)));
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Fallback: Direct PDF view</p>
            <iframe 
              src={pdfUrl} 
              className="w-full border rounded"
              style={{ 
                height: size === 'large' ? '800px' : size === 'medium' ? '500px' : '400px',
                width: '100%'
              }}
              title={title}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustScale(scale - 0.2)}
              disabled={scale <= 0.5}
            >
              🔍-
            </Button>
            <span className="font-medium">{Math.round(scale * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustScale(scale + 0.2)}
              disabled={scale >= 3}
            >
              🔍+
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* PDF Canvas */}
          <div 
            className="border rounded-lg bg-gray-50 p-2 relative w-full" 
            style={{ 
              minHeight: size === 'large' ? '800px' : size === 'small' ? '400px' : '500px',
              maxHeight: size === 'large' ? '1000px' : size === 'small' ? '500px' : '600px',
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start'
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading PDF...</span>
              </div>
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  className="shadow-lg border border-gray-200 bg-white rounded"
                  style={{ 
                    display: pdfDocument ? 'block' : 'none',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: size === 'large' ? '100%' : 'auto',
                    height: 'auto'
                  }}
                />
                {isRenderingPage && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="ml-2 text-sm">Rendering page...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Navigation Controls */}
          {totalPages > 0 && showNavigation && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className="flex items-center gap-2 px-3 py-2"
                title="Previous page"
              >
                ⬅️ Previous
              </Button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-md">
                <span className="text-sm font-bold text-blue-800">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-2 px-3 py-2"
                title="Next page"
              >
                Next ➡️
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}