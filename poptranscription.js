// poptranscription.js

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'transcribe') {
    const transcriptionDiv = document.getElementById('transcription');
    transcriptionDiv.textContent = message.text;
    
    // Enable the download link
    const downloadLink = document.getElementById('downloadLink');
    createDataURI(message.text)
      .then(dataURI => {
        downloadLink.href = dataURI;
        downloadLink.style.display = 'inline';
      })
      .catch(error => {
        console.error('Error creating data URI:', error);
      });
  }
});

// Stop recording function
function stopRecording() {
  // Code to stop recording goes here
  console.log('Recording stopped');
}

// Add event listener for stopRecordingButton
document.addEventListener('DOMContentLoaded', function() {
  const stopRecordingButton = document.getElementById('stopRecordingButton');
  if (stopRecordingButton) {
    stopRecordingButton.addEventListener('click', stopRecording);
  }
});

// Function to create data URI for PDF
function createDataURI(text) {
  return new Promise((resolve, reject) => {
    const element = document.createElement('div');
    element.innerHTML = text;
    
    const html = element.outerHTML;
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addHTML(html, function() {
      const data = pdf.output('datauristring');
      resolve(data);
    });
  });
}
