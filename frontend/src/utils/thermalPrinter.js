// ========================================
// Thermal Printer Utility
// ========================================

export const printThermalDocument = (html, options = {}) => {
  const {
    width = '80mm',
    title = 'Thermal Receipt'
  } = options;

  const printWindow = window.open(
    '',
    '_blank',
    'width=400,height=700'
  );

  if (!printWindow) {
    alert('Please allow pop-ups to print the receipt.');
    return false;
  }

  printWindow.document.open();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">

        <style>
          @page {
            size: ${width} auto;
            margin: 3mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
            font-family: Arial, sans-serif;
          }

          body {
            width: 100%;
            max-width: calc(${width} - 6mm);
            margin: 0 auto;
            font-size: 12px;
          }

          @media print {
            body {
              width: 100%;
            }
          }
        </style>
      </head>

      <body>
        ${html}

        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };

          window.onafterprint = function() {
            window.close();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();

  return true;
};

// Return Receipt Printing Helper
export const printThermalReturn = (html, options = {}) => {
  return printThermalDocument(html, {
    ...options,
    title: options.title || 'Return Receipt'
  });
};
