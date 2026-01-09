import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export { pdfjsLib };

export interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}

export interface PDFPageProxy {
  render: (params: RenderParameters) => RenderTask;
  getViewport: (params: ViewportParameters) => PageViewport;
}

export interface RenderParameters {
  canvasContext: CanvasRenderingContext2D;
  viewport: PageViewport;
}

export interface ViewportParameters {
  scale: number;
  rotation?: number;
}

export interface PageViewport {
  width: number;
  height: number;
}

export interface RenderTask {
  promise: Promise<void>;
}