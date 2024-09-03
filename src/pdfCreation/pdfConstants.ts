import { StandardFonts } from 'pdf-lib/cjs/api/StandardFonts';
import { PageSizes } from 'pdf-lib/cjs/api/sizes';

export const PADDING = 55;
export const INITIAL_TEXT_HEIGHT = 785;
export const MAX_CHARS_PER_LINE = 100;
export const X_POSITION_BEWERTUNG = 540;
export const LINE_SPACE = 15;
export const FONT = StandardFonts.Helvetica;
export const FONT_BOLD = StandardFonts.HelveticaBold;
export const FONT_SIZE_TITLE = 16;
export const FONT_SIZE_SUBTITLE = 12;
export const FONT_SIZE_TEXT = 10;
export const CHART_STATS_NUM_SIZE = 24;
export const PAGE_SIZE = PageSizes.A4;
export const PAGE_WIDTH = PageSizes.A4[0];
export const MIN_PAGE_HEIGHT = 50;
export const STANDARD_LINE_HEIGHT = 12;
export const LINE_HEIGHT_SUBTITLE = 14;
export const DRAW_AREA_WIDTH = PAGE_WIDTH - PADDING * 2;
export const CHART_WIDTH = DRAW_AREA_WIDTH * 0.7;
export const CHART_HEIGHT = 200;
export const X_POSITION_CHART_EXTRAS = PADDING + CHART_WIDTH + 20;
export const REPORT_FILE_SUFFIX = 'Poll_Report';
export const REPLACEMENT_CHARACTER = '?';

const boldWeight: 'bold' | 'normal' | 'lighter' | 'bolder' = 'bold';
const normalWeight: 'bold' | 'normal' | 'lighter' | 'bolder' = 'normal';

export const CHART_STANDARD_FONT = {
  size: 60,
  weight: boldWeight,
  family: 'Helvetica',
};

export const CHART_TICK_FONT = {
  size: 60,
  family: 'Helvetica',
  normalWeight: normalWeight,
};
