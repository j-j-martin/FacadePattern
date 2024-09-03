import { REPLACEMENT_CHARACTER } from './pdfConstants';

const replaceNonAnsiCharacters = (inputString: string): string => {
  // eslint-disable-next-line no-control-regex
  return inputString.replace(/[^\x00-\xFF\x81\x8D\x8F\x90\x9D]/g, REPLACEMENT_CHARACTER);
};

export default replaceNonAnsiCharacters;
