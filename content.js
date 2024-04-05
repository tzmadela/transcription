let recognition;
let recorder;

async function convertSpeechToText(audioBlob) {
  recognition = new window.SpeechRecognition();
  recognition.lang = 'en-US'; // Language setting
  recognition.interimResults = false;

  return new Promise((resolve, reject) => {
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      resolve(result);
    };

    recognition.onerror = (event) => {
      reject(event.error);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    recognition.start();
    recognition.addEventListener('end', () => {
      console.log('Speech recognition ended');
      recognition.stop();
    });

    recognition.addEventListener('speechend', () => {
      console.log('Speech ended');
      recognition.stop();
    });
  });
}

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((audioStream) => {
    const audioContext = new AudioContext();
    const audioInput = audioContext.createMediaStreamSource(audioStream);
    recorder = new MediaRecorder(audioContext.createMediaStreamDestination());

    recorder.start();
    recorder.ondataavailable = async (e) => {
      const audioBlob = new Blob([e.data], { type: 'audio/wav' });
      const text = await convertSpeechToText(audioBlob);
      console.log('Transcribed text:', text);

      // Send the transcribed text to the background script
      chrome.runtime.sendMessage({ action: 'transcribe', text: text });
    };

    recorder.onstop = () => {
      audioStream.getTracks().forEach(track => track.stop());
      audioInput.disconnect();
    };
  }).catch((err) => {
    console.error('Error accessing microphone:', err);
  });
}

function stopRecording() {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'stopRecording') {
    stopRecording();
  }
});

// Start recording when the content script is injected
startRecording();
