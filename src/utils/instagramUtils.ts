import html2canvas from 'html2canvas';

export const generateInstagramImage = async (elementId: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element, {
      backgroundColor: 'white',
      scale: 2, // Mayor calidad
    });

    // Convertir a imagen y descargar
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `instagram-post-${Date.now()}.png`;
    link.click();

    return image;
  } catch (error) {
    console.error('Error generando imagen:', error);
    throw error;
  }
}; 