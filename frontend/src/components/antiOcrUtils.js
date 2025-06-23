
import WebFont from 'webfontloader';

// Load Sans Forgetica font
export const loadAntiOcrFont = () => {
  return new Promise((resolve, reject) => {
    WebFont.load({
      google: {
        families: ['Roboto:400,700'], // Fallback font
      },
      custom: {
        families: ['Sans Forgetica'],
        urls: ['https://fonts.cdnfonts.com/css/sans-forgetica'],
      },
      active: () => resolve(),
      inactive: () => reject(new Error('Failed to load Sans Forgetica font')),
    });
  });
};

// Function to apply anti-OCR distortions to text
export const applyAntiOcrDistortion = (text) => {
  if (!text) return '';

  const chars = text.split('');

  const distortedText = chars
    .map((char, index) => {
      if (char.match(/\s|[.,!?]/)) return char;

      const transformations = [
        char + (Math.random() > 0.7 ? '\u200B' : ''),
        `<span style="display:inline-block; transform:rotate(${Math.random() * 2 - 1}deg);">${char}</span>`,
        `<span style="letter-spacing:${Math.random() * 0.5}px;">${char}</span>`,
        `<span style="display:inline-block; transform:skew(${Math.random() * 5 - 2.5}deg);">${char}</span>`,
      ];

      return transformations[Math.floor(Math.random() * transformations.length)];
    })
    .join('');

  return `<span class="anti-ocr" style="font-family:'Sans Forgetica', sans-serif;">${distortedText}</span>`;
};

// Initialize anti-OCR for all elements with class 'anti-ocr-target'
export const initializeAntiOcr = () => {
  loadAntiOcrFont()
    .then(() => {
      document.querySelectorAll('.anti-ocr-target').forEach((element) => {
        const originalText = element.dataset.originalText || element.textContent;
        element.dataset.originalText = originalText;
        element.innerHTML = applyAntiOcrDistortion(originalText);
      });

      setInterval(() => {
        document.querySelectorAll('.anti-ocr-target').forEach((element) => {
          const originalText = element.dataset.originalText;
          if (originalText) {
            element.innerHTML = applyAntiOcrDistortion(originalText);
          }
        });
      }, 5000);
    })
    .catch((error) => {
      console.error('Anti-OCR font loading failed:', error);
      document.querySelectorAll('.anti-ocr-target').forEach((element) => {
        const originalText = element.dataset.originalText || element.textContent;
        element.dataset.originalText = originalText;
        element.innerHTML = applyAntiOcrDistortion(originalText);
      });
    });
};

// Prevent text selection
export const disableTextSelection = () => {
  const style = document.createElement('style');
  style.textContent = `
    .anti-ocr-target {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
  `;
  document.head.appendChild(style);
};

// Add watermark
export const addWatermark = (userId) => {
  const watermark = document.createElement('div');
  watermark.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.1;
    color: #000;
    font-size: 50px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transform: rotate(-45deg);
  `;
  watermark.textContent = `Test ID: ${userId || 'Anonymous'}`;
  document.body.appendChild(watermark);
};
