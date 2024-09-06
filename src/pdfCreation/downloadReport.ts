import { REPORT_FILE_SUFFIX } from './pdfConstants';

/**
 * Downloads a poll report
 * @param pdfBytes The bytes of the PDF that should be downloaded
 * @param pollTitle The title of the poll
 */
const downloadPollReport = (pdfBytes: Uint8Array, pollTitle: string) => {
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');

  a.href = pdfUrl;
  a.download = `${pollTitle}_${REPORT_FILE_SUFFIX}`.replace(/ /g, '_');
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(pdfUrl);
  document.body.removeChild(a);
};

export default downloadPollReport;
