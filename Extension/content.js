// Simple YouTube download button with icon
console.log('YouTube Downloader Extension loaded');

let downloadButton = null;
let isDownloading = false;

function init() {
    if (!window.location.href.includes('/watch')) return;
    setTimeout(addDownloadButton, 1000);
    
    // Handle YouTube navigation
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (url.includes('/watch')) {
                setTimeout(addDownloadButton, 500);
            } else {
                removeDownloadButton();
            }
        }
    }).observe(document, { subtree: true, childList: true });
}

function addDownloadButton() {
    if (document.querySelector('.yt-download-btn')) return;
    
    const titleSelectors = [
        '#title h1 yt-formatted-string',
        '#title h1',
        'h1.title',
        'h1 yt-formatted-string'
    ];
    
    let titleElement = null;
    for (const selector of titleSelectors) {
        titleElement = document.querySelector(selector);
        if (titleElement) break;
    }
    
    if (!titleElement) {
        setTimeout(addDownloadButton, 1000);
        return;
    }
    
    // Create download button
    downloadButton = document.createElement('button');
    downloadButton.className = 'yt-download-btn';
    downloadButton.innerHTML = `
        <span style="display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download
        </span>
    `;
    
    // Style the button
    downloadButton.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        margin-left: 12px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        font-family: 'Roboto', Arial, sans-serif;
        vertical-align: middle;
    `;
    
    downloadButton.title = "Download this video";
    
    // Hover effect
    downloadButton.addEventListener('mouseenter', () => {
        if (!isDownloading) {
            downloadButton.style.background = '#cc0000';
        }
    });
    
    downloadButton.addEventListener('mouseleave', () => {
        if (!isDownloading) {
            downloadButton.style.background = '#ff4444';
        }
    });
    
    // Click handler
    downloadButton.addEventListener('click', handleDownloadClick);
    
    // Insert button next to title
    titleElement.parentNode.insertBefore(downloadButton, titleElement.nextSibling);
}

function removeDownloadButton() {
    if (downloadButton) {
        downloadButton.remove();
        downloadButton = null;
    }
}

async function handleDownloadClick() {
    if (isDownloading) return;
    
    const videoUrl = window.location.href;
    if (!videoUrl.includes('/watch?v=')) return;
    
    isDownloading = true;
    
    // Show downloading state
    downloadButton.innerHTML = `
        <span style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 16px; height: 16px; border: 2px solid transparent; border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Downloading...
        </span>
    `;
    downloadButton.style.background = '#666';
    downloadButton.style.cursor = 'not-allowed';
    
    // Add spinner animation
    if (!document.querySelector('#download-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'download-spinner-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Send to app - don't wait for response or handle errors
    fetch('http://localhost:5678/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl })
    }).catch(() => { 
        // Ignore all errors
    });
    
    // Always reset button after 2 seconds
    setTimeout(() => {
        downloadButton.innerHTML = `
            <span style="display: flex; align-items: center; gap: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Download
            </span>
        `;
        downloadButton.style.background = '#ff4444';
        downloadButton.style.cursor = 'pointer';
        isDownloading = false;
    }, 2000);
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}