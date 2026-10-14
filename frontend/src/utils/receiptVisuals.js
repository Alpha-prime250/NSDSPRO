import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

/**
 * Generate QR Code Matrix
 * Returns QR code modules as a matrix.
 *
 * @param {string} text - Text or UPI payment URL
 * @returns {Array<Array<boolean>>}
 */
export function generateQRCodeMatrix(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('QR Code text is required.');
  }

  const qr = QRCode.create(text, {
    errorCorrectionLevel: 'M',
  });

  const size = qr.modules.size;
  const data = qr.modules.data;
  const matrix = [];

  for (let row = 0; row < size; row++) {
    const currentRow = [];

    for (let col = 0; col < size; col++) {
      currentRow.push(Boolean(data[row * size + col]));
    }

    matrix.push(currentRow);
  }

  return matrix;
}

/**
 * Generate QR Code SVG
 *
 * @param {string} text - Text or UPI payment URL
 * @param {Object} options
 * @returns {Promise<string>} SVG markup
 */
export async function generateQRCodeSVG(text, options = {}) {
  if (!text || typeof text !== 'string') {
    throw new Error('QR Code text is required.');
  }

  const {
    width = 180,
    margin = 2,
    dark = '#000000',
    light = '#ffffff',
  } = options;

  return QRCode.toString(text, {
    type: 'svg',
    width,
    margin,
    color: {
      dark,
      light,
    },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Generate Code 128 Barcode SVG
 *
 * @param {string} text - Invoice number or barcode text
 * @param {Object} options
 * @returns {string} SVG markup
 */
export function generateBarcodeSVG(text, options = {}) {
  if (text === undefined || text === null || String(text).trim() === '') {
    throw new Error('Barcode text is required.');
  }

  const {
    width = 2,
    height = 60,
    displayValue = true,
    fontSize = 14,
    margin = 8,
    lineColor = '#000000',
    background = '#ffffff',
  } = options;

  // Temporary SVG element
  const svg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );

  // Generate Code 128 barcode
  JsBarcode(svg, String(text), {
    format: 'CODE128',
    width,
    height,
    displayValue,
    fontSize,
    margin,
    lineColor,
    background,
  });

  return svg.outerHTML;
}
