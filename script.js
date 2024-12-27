document.getElementById("fileInput").addEventListener("change", handleFileUpload);
document.getElementById("corruptButton").addEventListener("click", corruptFile);

let fileBuffer = null;
let fileType = null;

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    fileBuffer = new Uint8Array(e.target.result);
    fileType = file.type;
    document.getElementById("corruptButton").disabled = false;
  };
  reader.readAsArrayBuffer(file);
}

function corruptFile() {
  if (!fileBuffer) return;

  const glitchStrength = parseInt(document.getElementById("glitchStrength").value, 10);
  const corruptedBuffer = new Uint8Array(fileBuffer);

  // Corrupt based on file type
  if (fileType.startsWith("image/")) {
    corruptBinaryData(corruptedBuffer, glitchStrength);
    displayImage(corruptedBuffer);
    downloadCorruptedFile(corruptedBuffer, "corrupted-image.png");
  } else if (fileType.startsWith("audio/")) {
    corruptAudioData(corruptedBuffer, glitchStrength);
    displayAudio(corruptedBuffer);
    downloadCorruptedFile(corruptedBuffer, "corrupted-audio.wav");
  } else {
    corruptBinaryData(corruptedBuffer, glitchStrength);
    downloadCorruptedFile(corruptedBuffer, "corrupted-file.bin");
  }
}

function corruptBinaryData(buffer, strength) {
  const corruptionCount = Math.floor(buffer.length * (strength / 100));
  for (let i = 0; i < corruptionCount; i++) {
    const randomIndex = Math.floor(Math.random() * buffer.length);
    const randomValue = Math.floor(Math.random() * 256);
    buffer[randomIndex] = randomValue;
  }
}

function corruptAudioData(buffer, strength) {
  const audioContext = new AudioContext();
  audioContext.decodeAudioData(buffer.buffer, (audioBuffer) => {
    const channels = audioBuffer.numberOfChannels;
    const corruptedAudio = audioContext.createBuffer(channels, audioBuffer.length, audioBuffer.sampleRate);

    for (let c = 0; c < channels; c++) {
      const channelData = audioBuffer.getChannelData(c);
      const corruptedChannel = corruptedAudio.getChannelData(c);

      for (let i = 0; i < channelData.length; i++) {
        if (Math.random() < strength / 100) {
          corruptedChannel[i] = Math.random() * 2 - 1; // Replace with random values
        } else {
          corruptedChannel[i] = channelData[i];
        }
      }
    }

    const offlineContext = new OfflineAudioContext(channels, corruptedAudio.length, corruptedAudio.sampleRate);
    offlineContext.startRendering().then(() => {
      offlineContext.oncomplete = (e) => {
        const wavBlob = audioBufferToWav(e.renderedBuffer);
        const url = URL.createObjectURL(wavBlob);
        displayAudio(url);
        downloadCorruptedFile(wavBlob, "corrupted-audio.wav");
      };
    });
  });
}

function displayImage(buffer) {
  const blob = new Blob([buffer], { type: "image/png" });
  const url = URL.createObjectURL(blob);

  const canvas = document.getElementById("imageDisplay");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    canvas.style.display = "block";
  };
  img.src = url;
}

function displayAudio(url) {
  const audio = document.getElementById("audioDisplay");
  audio.src = url;
  audio.style.display = "block";
}

function downloadCorruptedFile(buffer, fileName) {
  const blob = new Blob([buffer], { type: fileType || "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.getElementById("downloadLink");
  downloadLink.href = url;
  downloadLink.download = fileName;
  downloadLink.style.display = "inline-block";
}

function audioBufferToWav(audioBuffer) {
  const wav = audioBufferToWave(audioBuffer);
  return new Blob([wav], { type: "audio/wav" });
}
