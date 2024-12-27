document.getElementById('imageInput').addEventListener('change', handleImageUpload);
document.getElementById('corruptButton').addEventListener('click', corruptImage);

let imageBuffer = null;

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    imageBuffer = new Uint8Array(e.target.result);
    document.getElementById('corruptButton').disabled = false;
  };
  reader.readAsArrayBuffer(file);
}

function corruptImage() {
  if (!imageBuffer) return;

  const corruptedBuffer = new Uint8Array(imageBuffer);

  // Corrupt random parts of the image
  for (let i = 0; i < 100; i++) {
    const randomIndex = Math.floor(Math.random() * corruptedBuffer.length);
    const randomValue = Math.floor(Math.random() * 256);
    corruptedBuffer[randomIndex] = randomValue;
  }

  const blob = new Blob([corruptedBuffer], { type: 'image/png' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.getElementById('downloadLink');
  downloadLink.href = url;
  downloadLink.style.display = 'inline-block';
}

