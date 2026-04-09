import { useState, useEffect } from 'react'
import { X, Download, ExternalLink, FileText } from 'lucide-react'
import { fileAPI } from '../../services/api'
import './DocPreview.css'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const PDF_TYPE = 'application/pdf'
const TEXT_TYPES = [
    'text/plain', 'text/csv', 'text/markdown', 'text/x-markdown',
    'text/html', 'text/css', 'text/javascript', 'application/json',
    'application/xml',
]

/**
 * DocPreview — centralized document preview overlay.
 *
 * Props:
 *   file     — { r2Key, originalName, fileType, fileSize }
 *   onClose  — close callback
 */
const DocPreview = ({ file, onClose }) => {
    const [url, setUrl] = useState(null)
    const [textContent, setTextContent] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!file) return
        let cancelled = false

        const load = async () => {
            try {
                const { data } = file.id
                    ? await fileAPI.getUrlById(file.id)
                    : await fileAPI.getUrl(file.r2Key)
                const presignedUrl = data.url || data.downloadUrl
                if (cancelled) return

                if (TEXT_TYPES.includes(file.fileType)) {
                    const resp = await fetch(presignedUrl)
                    const text = await resp.text()
                    if (!cancelled) setTextContent(text)
                }
                setUrl(presignedUrl)
            } catch {
                if (!cancelled) setUrl(null)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [file])

    if (!file) return null

    const isImage = IMAGE_TYPES.includes(file.fileType)
    const isPdf = file.fileType === PDF_TYPE
    const isText = TEXT_TYPES.includes(file.fileType)
    const canPreview = isImage || isPdf || isText

    return (
        <div className="doc-preview-overlay" onClick={onClose}>
            <div className="doc-preview-panel" onClick={e => e.stopPropagation()}>
                <div className="doc-preview-header">
                    <h4><FileText size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{file.originalName}</h4>
                    <div className="doc-preview-header-actions">
                        {url && (
                            <a href={url} target="_blank" rel="noopener noreferrer" download>
                                <Download size={14} /> Download
                            </a>
                        )}
                        {url && (
                            <a href={url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink size={14} /> Open
                            </a>
                        )}
                        <button type="button" onClick={onClose}><X size={14} /></button>
                    </div>
                </div>
                <div className="doc-preview-body">
                    {loading ? (
                        <p style={{ color: 'var(--text-muted)' }}>Loading preview…</p>
                    ) : !url ? (
                        <div className="doc-preview-unsupported">
                            <FileText size={40} />
                            <p>Could not load file.</p>
                        </div>
                    ) : isPdf ? (
                        <iframe src={url} title={file.originalName} />
                    ) : isImage ? (
                        <img src={url} alt={file.originalName} />
                    ) : isText && textContent !== null ? (
                        <pre>{textContent}</pre>
                    ) : (
                        <div className="doc-preview-unsupported">
                            <FileText size={40} />
                            <p>Preview not available for this file type.</p>
                            <p>Use the download or open button above.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DocPreview
