import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileText } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onPageChange?: (page: number) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function PDFViewer({ 
  pdfUrl, 
  title, 
  onPageChange, 
  className = '', 
  size = 'medium' 
}: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(10); // Default to 10 pages
  const [zoomLevel, setZoomLevel] = useState(size === 'small' ? 75 : 100);
  const [pdfError, setPdfError] = useState(false);
  const [useDirectLink, setUseDirectLink] = useState(false);

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

  const zoomIn = () => {
    setZoomLevel(Math.min(200, zoomLevel + 25));
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(50, zoomLevel - 25));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseDirectLink(!useDirectLink)}
            className="text-xs"
          >
            {useDirectLink ? 'Embed View' : 'Direct Link'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* PDF Display */}
          <div 
            className="border rounded-lg bg-gray-50 relative w-full overflow-hidden pdf-viewer-container" 
            style={{ 
              minHeight: size === 'large' ? '800px' : size === 'small' ? '400px' : '500px',
              maxHeight: size === 'large' ? '1000px' : size === 'small' ? '500px' : '600px',
              width: '100%'
            }}
          >
            {useDirectLink ? (
              <div className="flex items-center justify-center h-full bg-white text-gray-700 rounded">
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-medium mb-2">{title}</h3>
                  <p className="text-sm mb-4 text-gray-500">
                    Click below to open the PDF in a new tab
                  </p>
                  <a 
                    href={pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    Open PDF in New Tab
                  </a>
                </div>
              </div>
            ) : !pdfError ? (
              <iframe 
                src={`${pdfUrl}#page=${currentPage}&zoom=${zoomLevel}`}
                className="w-full h-full border-0 rounded pdf-viewer-iframe"
                title={title}
                style={{ 
                  width: '100%',
                  height: '100%',
                  minHeight: size === 'large' ? '780px' : size === 'small' ? '380px' : '480px',
                  pointerEvents: 'auto'
                }}
                onError={() => {
                  console.log('PDF failed to load, showing fallback');
                  setPdfError(true);
                }}
                onLoad={() => console.log('PDF loaded successfully')}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-600 rounded">
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">PDF Viewer Blocked</h3>
                  <p className="text-sm mb-4 text-gray-500">
                    Microsoft Edge has blocked the PDF display for security reasons.
                  </p>
                  <div className="space-y-2">
                    <a 
                      href={pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Open PDF in New Tab
                    </a>
                    <br />
                    <button 
                      onClick={() => setPdfError(false)}
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation and Zoom Overlay - Show when not in direct link mode */}
            {!useDirectLink && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border zoom-controls">
              {/* Navigation */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className="h-8 w-8 p-0"
                title="Previous page"
              >
                ◀
              </Button>
              
              <span className="text-sm font-medium text-gray-700 px-2">
                {currentPage} / {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="h-8 w-8 p-0"
                title="Next page"
              >
                ▶
              </Button>

              {/* Separator */}
              <div className="w-px h-6 bg-gray-300"></div>

              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={zoomLevel <= 50}
                className="h-8 w-8 p-0 zoom-button"
                title="Zoom out"
              >
                −
              </Button>
              
              <span className="text-xs font-medium text-gray-600 px-1">
                {zoomLevel}%
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={zoomLevel >= 200}
                className="h-8 w-8 p-0 zoom-button"
                title="Zoom in"
              >
                +
              </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}