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

export const uploadToCloudinaryDirect = async (file, folder, apiUrl) => {
  const sigRes = await fetch(`${apiUrl}/api/cloudinary-signature?folder=${folder}`);
  if (!sigRes.ok) throw new Error('Cannot get upload signature');
  const { timestamp, signature, cloudName, apiKey, folder: signedFolder } = await sigRes.json();

  const formData = new FormData();
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', signedFolder);
  formData.append('file', file);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    console.error('Cloudinary Error:', errorText);
    let errMsg = 'Cloudinary upload failed';
    try {
      const errJson = JSON.parse(errorText);
      if (errJson.error && errJson.error.message) {
        errMsg = errJson.error.message;
      }
    } catch (e) {}
    throw new Error(errMsg);
  }
  const data = await uploadRes.json();
  return data.secure_url;
};

export const getCloudinaryThumb = (url, width = 300) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  return `${parts[0]}/upload/c_limit,w_${width},f_auto,q_auto/${parts[1]}`;
};
