document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const previewContent = document.getElementById('previewContent');
    const resultsSection = document.getElementById('resultsSection');
    const confidenceMeter = document.getElementById('confidenceMeter');
    const confidenceValue = document.getElementById('confidenceValue');
    const verdictBox = document.getElementById('verdictBox');
    const verdictText = document.getElementById('verdictText');
    const confidenceText = document.getElementById('confidenceText');
    const processingTime = document.getElementById('processingTime');

    // Drag and drop functionality
    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.classList.add('active');
    }
    
    function unhighlight() {
        dropZone.classList.remove('active');
    }
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            fileInput.files = files;
            handleFileSelect();
        }
    }
    
    function handleFileSelect() {
        if (fileInput.files.length) {
            const file = fileInput.files[0];
            previewPlaceholder.style.display = 'none';
            previewContent.style.display = 'block';
            previewContent.innerHTML = '';
            
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                previewContent.appendChild(img);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.controls = true;
                previewContent.appendChild(video);
            }
            
            // Reset results
            verdictBox.className = 'verdict-box';
            verdictText.textContent = 'Ready to Analyze';
            confidenceText.textContent = 'Click "Analyze Now" to begin detection';
            confidenceMeter.style.width = '0%';
            confidenceValue.textContent = '0%';
            processingTime.textContent = '-';
            
            // Show results section
            resultsSection.style.display = 'block';
        }
    }

    // Form submission
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!fileInput.files.length) return;
        
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        // UI Loading state
        analyzeBtn.classList.add('loading');
        verdictBox.className = 'verdict-box';
        verdictText.textContent = 'Analyzing...';
        confidenceText.textContent = 'Processing your media';
        const startTime = performance.now();
        
        // Send to server
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;
            processingTime.textContent = `${duration.toFixed(2)} seconds`;
            
            const confidence = data.confidence;
            confidenceMeter.style.width = `${confidence}%`;
            confidenceValue.textContent = `${confidence}%`;
            
            if (data.result === "FAKE") {
                verdictBox.classList.add('fake');
                verdictText.textContent = 'Potential Deepfake Detected';
                confidenceText.textContent = `Confidence: ${confidence}%`;
                confidenceMeter.style.backgroundColor = 'var(--danger)';
            } else {
                verdictBox.classList.add('real');
                verdictText.textContent = 'Authentic Content';
                confidenceText.textContent = `Confidence: ${confidence}%`;
                confidenceMeter.style.backgroundColor = 'var(--success)';
            }
            
            // Add animation
            verdictBox.classList.add('fade-in');
        })
        .catch(error => {
            console.error('Error:', error);
            verdictText.textContent = 'Error';
            confidenceText.textContent = error.message;
            confidenceMeter.style.backgroundColor = 'var(--warning)';
        })
        .finally(() => {
            analyzeBtn.classList.remove('loading');
        });
    });
});
