import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import { FiDownload, FiX, FiZoomIn, FiZoomOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentPreview = ({ url, onClose }) => {
  const [fileType, setFileType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [docxContent, setDocxContent] = useState('');
  const [pdfError, setPdfError] = useState(false);
  const [processedUrl, setProcessedUrl] = useState(url);

  useEffect(() => {
    // Process URL to ensure it's viewable (not downloadable)
    let viewUrl = url;
    if (url.includes('cloudinary.com') && url.includes('fl_attachment')) {
      // Remove fl_attachment flag if present
      viewUrl = url.replace('fl_attachment/', '').replace('fl_attachment,', '');
    }
    setProcessedUrl(viewUrl);
    detectFileType();
  }, [url]);

  const detectFileType = async () => {
    try {
      let extension = '';
      
      // For Cloudinary URLs, extract the format from the URL structure
      if (url.includes('cloudinary.com')) {
        const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        if (match) {
          extension = match[1].toLowerCase();
        }
      } else {
        // Remove query parameters and get the last part
        const urlWithoutQuery = url.split('?')[0];
        const parts = urlWithoutQuery.split('.');
        
        if (parts.length > 1) {
          extension = parts[parts.length - 1].toLowerCase();
        }
      }
      
      // If no extension found, try to detect from content-type
      if (!extension || extension.length > 5) {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          const contentType = response.headers.get('content-type');
          
          if (contentType) {
            if (contentType.includes('pdf')) extension = 'pdf';
            else if (contentType.includes('image')) {
              if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';
              else if (contentType.includes('png')) extension = 'png';
              else if (contentType.includes('gif')) extension = 'gif';
              else if (contentType.includes('webp')) extension = 'webp';
              else extension = 'image';
            }
            else if (contentType.includes('word') || contentType.includes('document')) extension = 'docx';
          }
        } catch (e) {
          console.log('Could not fetch content-type:', e);
        }
      }
      
      if (extension === 'pdf') {
        setFileType('pdf');
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'image'].includes(extension)) {
        setFileType('image');
      } else if (['doc', 'docx'].includes(extension)) {
        setFileType('docx');
        await loadDocx();
      } else {
        // Default to PDF if we can't determine
        setFileType('pdf');
      }
    } catch (error) {
      console.error('File type detection error:', error);
      toast.error('Failed to detect file type');
      setFileType('pdf'); // Default to PDF
    } finally {
      setLoading(false);
    }
  };

  const loadDocx = async () => {
    try {
      const response = await fetch(processedUrl);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ 
        arrayBuffer,
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
        ]
      });
      setDocxContent(result.value);
    } catch (error) {
      console.error('DOCX load error:', error);
      toast.error('Failed to load document');
      setDocxContent('<p style="color: #dc2626;">Error loading document. Please try downloading instead.</p>');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create temporary link
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Extract filename from URL
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1].split('?')[0];
      const filename = lastPart ? decodeURIComponent(lastPart) : 'document';
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setPdfError(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          width: '90%',
          height: '90%',
          maxWidth: 1200,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f0eded',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafafa',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
            Document Preview
          </h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {fileType === 'pdf' && (
              <>
                <button
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Zoom Out"
                >
                  <FiZoomOut size={16} />
                </button>
                <span style={{ fontSize: '0.8rem', color: '#64748b', minWidth: 50, textAlign: 'center' }}>
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(Math.min(2.0, scale + 0.1))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Zoom In"
                >
                  <FiZoomIn size={16} />
                </button>
              </>
            )}
            {fileType === 'image' && (
              <>
                <button
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Zoom Out"
                >
                  <FiZoomOut size={16} />
                </button>
                <span style={{ fontSize: '0.8rem', color: '#64748b', minWidth: 50, textAlign: 'center' }}>
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(Math.min(3.0, scale + 0.1))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Zoom In"
                >
                  <FiZoomIn size={16} />
                </button>
              </>
            )}
            <button
              onClick={handleDownload}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: '#7B1113',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <FiDownload size={14} /> Download
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            background: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: '3px solid #f0eded',
                  borderTopColor: '#7B1113',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 12px',
                }}
              />
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Loading document...</p>
            </div>
          ) : fileType === 'pdf' ? (
            pdfError ? (
              // Fallback to Google Docs Viewer or direct iframe
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(processedUrl)}&embedded=true`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  title="PDF Preview"
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <Document
                  file={{
                    url: processedUrl,
                    httpHeaders: {
                      'Accept': 'application/pdf',
                    },
                  }}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  options={{
                    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                    cMapPacked: true,
                    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
                    withCredentials: false,
                  }}
                  loading={
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        border: '3px solid #f0eded',
                        borderTopColor: '#7B1113',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 12px',
                      }}
                    />
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Loading PDF...</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              {numPages && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: '#fff',
                    padding: '8px 16px',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <button
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      background: pageNumber <= 1 ? '#f8f9fa' : '#fff',
                      cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '0.85rem', color: '#1a1a2e', fontWeight: 600 }}>
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                    disabled={pageNumber >= numPages}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      background: pageNumber >= numPages ? '#f8f9fa' : '#fff',
                      cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
            )
          ) : fileType === 'image' ? (
            <img
              src={processedUrl}
              alt="Document"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `scale(${scale})`,
                transition: 'transform 0.2s',
              }}
            />
          ) : fileType === 'docx' ? (
            <div
              style={{
                background: '#fff',
                padding: 40,
                borderRadius: 8,
                maxWidth: 900,
                width: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                maxHeight: '100%',
                overflow: 'auto',
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: docxContent }}
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  color: '#1a1a2e',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
                className="docx-content"
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: 16 }}>
                Preview not available for this file type
              </p>
              <button
                onClick={handleDownload}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#7B1113',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                Download File
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .docx-content h1 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 1rem; color: #1a1a2e; }
        .docx-content h2 { font-size: 1.25rem; font-weight: 700; margin: 1.25rem 0 0.75rem; color: #1a1a2e; }
        .docx-content h3 { font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem; color: #1a1a2e; }
        .docx-content p { margin: 0.75rem 0; }
        .docx-content ul, .docx-content ol { margin: 0.75rem 0; padding-left: 2rem; }
        .docx-content li { margin: 0.5rem 0; }
        .docx-content strong { font-weight: 600; }
        .docx-content table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        .docx-content td, .docx-content th { border: 1px solid #e2e8f0; padding: 0.5rem; }
        .docx-content th { background: #f8f9fa; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default DocumentPreview;
