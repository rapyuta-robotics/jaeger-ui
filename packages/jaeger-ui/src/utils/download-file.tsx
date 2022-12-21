export const downloadByUrl = (url: string, filename?: string) => {
  const anchor = document.createElement('a');

  if (filename) {
    anchor.download = filename;
  }

  anchor.href = url;
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  setTimeout(() => anchor.remove(), 100);
};

export const downloadBlob = (blob: Blob, filename: string) => {
  // @ts-ignore
  const windowUrl = window.URL || window.webkitURL;
  const downloadUrl = windowUrl.createObjectURL(blob);

  downloadByUrl(downloadUrl, filename);

  setTimeout(() => windowUrl.revokeObjectURL(downloadUrl), 200);
};
