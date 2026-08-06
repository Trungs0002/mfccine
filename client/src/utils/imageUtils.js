export const fileToBase64 = (file) => new Promise((resolve, reject) => {
  if (file.size <= 200 * 1024 * 1024) { // Under 200MB: keep original quality
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > 2500 || height > 2500) {
        if (width > height) { height = Math.round(height * (2500 / width)); width = 2500; }
        else { width = Math.round(width * (2500 / height)); height = 2500; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = reject;
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});
