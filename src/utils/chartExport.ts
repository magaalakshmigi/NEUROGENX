/**
 * Helper to export an SVG element as a crisp PNG image
 */
export async function exportSvgAsPng(
  svgElement: SVGSVGElement,
  fileName: string = 'neurogenex_chart.png',
  scale: number = 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = (svgElement.clientWidth || 600) * scale;
        canvas.height = (svgElement.clientHeight || 360) * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Dark background fill
        ctx.fillStyle = '#070B1A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(blobURL);

        const pngURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = fileName;
        downloadLink.href = pngURL;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        resolve();
      };
      image.onerror = (err) => reject(err);
      image.src = blobURL;
    } catch (e) {
      reject(e);
    }
  });
}
