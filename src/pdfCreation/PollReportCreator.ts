import PDFDocument from 'pdf-lib/cjs/api/PDFDocument';
import { QuestionWithAnswers, Answer } from '../types';
import PDFFont from 'pdf-lib/cjs/api/PDFFont';
import PDFPage from 'pdf-lib/cjs/api/PDFPage';

import { Chart } from 'chart.js/auto';
import {
  CHART_HEIGHT,
  CHART_STANDARD_FONT,
  CHART_STATS_NUM_SIZE,
  CHART_TICK_FONT,
  CHART_WIDTH,
  FONT,
  FONT_BOLD,
  FONT_SIZE_SUBTITLE,
  FONT_SIZE_TEXT,
  FONT_SIZE_TITLE,
  INITIAL_TEXT_HEIGHT,
  LINE_HEIGHT_SUBTITLE,
  LINE_SPACE,
  MAX_CHARS_PER_LINE,
  MIN_PAGE_HEIGHT,
  PADDING,
  PAGE_SIZE,
  PAGE_WIDTH,
  STANDARD_LINE_HEIGHT,
  X_POSITION_BEWERTUNG,
  X_POSITION_CHART_EXTRAS,
} from './pdfConstants';
import replaceNonAnsiCharacters from './replaceNonAnsiCharacters';

export default class PollReportCreator {
  private pdfDoc: PDFDocument;
  private currentPage?: PDFPage;
  private font: PDFFont;
  private fontBold: PDFFont;
  private textHeight: number = INITIAL_TEXT_HEIGHT;
  private questionsWithAnswers: QuestionWithAnswers[];
  private chartColor: string;
  private numberOfLines: number = 0;

  private constructor(pdfDoc: PDFDocument, questionsWithAnswers: QuestionWithAnswers[], chartColor: string) {
    this.pdfDoc = pdfDoc;
    this.font = this.pdfDoc.embedStandardFont(FONT);
    this.fontBold = this.pdfDoc.embedStandardFont(FONT_BOLD);
    this.questionsWithAnswers = questionsWithAnswers;
    this.chartColor = chartColor;
  }

  /**
   * Factory-Function for the class PollReportCreator. Returns an instance of PollReportCreator.
   * @param questionsWithAnswers Questions with their corresponding answers
   * @param chartColor Color the chart is supposed to have
   * @returns
   */
  public static createInstanceAsync = async (questionsWithAnswers: QuestionWithAnswers[], chartColor: string) => {
    const pdfDoc = await PDFDocument.create();
    return new PollReportCreator(pdfDoc, questionsWithAnswers, chartColor);
  };

  /**
   * Creates the PDF for the poll report.
   * @returns The bytes of the poll report PDF.
   */
  public createReportAsync = async () => {
    this.questionsWithAnswers.forEach((questionWithAnswer) => {
      this.drawPollResultPage(questionWithAnswer);
    });
    this.textHeight = INITIAL_TEXT_HEIGHT;
    return await this.pdfDoc.save();
  };

  private drawPollResultPage = (questionWithAnswers: QuestionWithAnswers) => {
    this.currentPage = this.pdfDoc.addPage(PAGE_SIZE);
    this.textHeight = INITIAL_TEXT_HEIGHT;
    this.drawPageTitle(questionWithAnswers.Question);
    this.textHeight -= LINE_SPACE;
    this.drawLine();
    // this.textHeight -= LINE_SPACE;
    // this.drawKompetenzText(kompetenz.beschreibung);
    // this.drawLine();
    this.textHeight -= CHART_HEIGHT + STANDARD_LINE_HEIGHT;

    // The page and the height must be added as arguments here, as the integration is asynchronous and as such
    // may happen later. As a result, textHeight or currentPage could already have a different value.
    this.drawPollRatingChart(this.currentPage, questionWithAnswers, this.textHeight);
    this.drawPollRatingChartExtras(
      this.currentPage,
      questionWithAnswers.Answers.map((a) => a.rating),
      this.textHeight
    );
    this.textHeight -= STANDARD_LINE_HEIGHT * 2;
    this.drawAnswerTitles();
    this.textHeight -= STANDARD_LINE_HEIGHT * 2;

    this.drawAnswers(questionWithAnswers.Answers);
  };

  private drawPageTitle = (question: string) => {
    if (this.currentPage) {
      this.currentPage.drawText(replaceNonAnsiCharacters(question), {
        x: PADDING,
        y: this.textHeight,
        size: FONT_SIZE_TITLE,
        font: this.fontBold,
      });
    }
  };

  private drawLine = () => {
    if (this.currentPage) {
      this.currentPage.drawLine({
        start: {
          x: PADDING,
          y: this.textHeight,
        },
        end: {
          x: PAGE_WIDTH - 20,
          y: this.textHeight,
        },
        thickness: 1,
      });
    }
  };

  private getLinesFromText = (text: string) => {
    const lines: string[] = [];
    let line = '';
    this.numberOfLines++;
    replaceNonAnsiCharacters(text)
      .split(' ')
      .forEach((word) => {
        if (line.length + word.length < MAX_CHARS_PER_LINE) {
          line += word + ' ';
        } else {
          lines.push(line);
          line = word + ' ';
          this.numberOfLines++;
        }
      });
    lines.push(line);
    return lines;
  };

  private drawPollRatingChart = async (page: PDFPage, questionWithAnswers: QuestionWithAnswers, yCoordinate: number) => {
    if (this.currentPage) {
      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', CHART_WIDTH.toString());
      canvas.setAttribute('height', CHART_HEIGHT.toString());
      canvas.style.display = 'none';

      document.body.append(canvas);
      console.log(questionWithAnswers.Answers.map((a) => a.rating));
      const chart = new Chart(canvas, {
        type: 'bar',
        data: {
          xLabels: ['1', '2', '3', '4', '5', '6', '7'],
          datasets: [
            {
              // borderRadius: 25,
              data: this.getBarData(questionWithAnswers.Answers.map((a) => a.rating)),
              backgroundColor: this.chartColor,
            },
          ],
        },
        options: {
          animation: false,
          font: CHART_STANDARD_FONT,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                lineWidth: 5,
              },
              ticks: {
                font: CHART_TICK_FONT,
                precision: 0,
              },
            },
            x: {
              grid: {
                lineWidth: 0,
              },
              ticks: {
                font: CHART_TICK_FONT,
              },
              border: {
                display: false,
              },
            },
          },
        },
      });

      chart.render();
      const chartImage = await this.pdfDoc.embedPng(chart.toBase64Image());
      page.drawImage(chartImage, { x: PADDING, y: yCoordinate, width: CHART_WIDTH, height: CHART_HEIGHT });
      canvas.remove();
    }
  };

  private getBarData = (ratings: number[]) => {
    // const ratings: number[] | undefined = questionWithAnswers.Answers.map((q) => q.rating)
    // .filter((kb) => kb.kompetenzId === kompetenz.id)
    // .map((k) => k.bewertung)
    ratings = ratings.filter((r) => r !== 0);
    const ratingSums = Array(7).fill(0);
    ratings?.forEach((r) => {
      ratingSums[r - 1]++;
    });
    return ratingSums;
  };

  private drawPollRatingChartExtras = (page: PDFPage, ratings: number[], yBaseCoord: number) => {
    if (this.currentPage) {
      const numberOfRatings: number = ratings.filter((b) => b !== 0).length;
      const noAnswerCount: number = ratings.length - numberOfRatings;
      const averageValueOfRatings: number = Math.round((ratings.reduce((sum, val) => sum + val, 0) / numberOfRatings) * 10) / 10;

      let yCoord: number = yBaseCoord + CHART_HEIGHT - STANDARD_LINE_HEIGHT;

      page.drawText('Number of', {
        x: X_POSITION_CHART_EXTRAS,
        y: yCoord,
        font: this.fontBold,
        size: FONT_SIZE_SUBTITLE,
      });
      yCoord -= LINE_HEIGHT_SUBTITLE;

      page.drawText('Ratings', {
        x: X_POSITION_CHART_EXTRAS,
        y: yCoord,
        font: this.fontBold,
        size: FONT_SIZE_SUBTITLE,
      });
      yCoord -= LINE_HEIGHT_SUBTITLE * 2;

      page.drawText(`${numberOfRatings}`, {
        x: X_POSITION_CHART_EXTRAS + 15,
        y: yCoord,
        font: this.fontBold,
        size: CHART_STATS_NUM_SIZE,
      });
      yCoord = yBaseCoord + (CHART_HEIGHT * 2) / 3 - STANDARD_LINE_HEIGHT - 5;

      page.drawText('No Answer', {
        x: X_POSITION_CHART_EXTRAS,
        y: yCoord,
        font: this.fontBold,
        size: FONT_SIZE_SUBTITLE,
      });
      yCoord -= LINE_HEIGHT_SUBTITLE;

      page.drawText('Count', {
        x: X_POSITION_CHART_EXTRAS,
        y: yCoord,
        font: this.fontBold,
        size: FONT_SIZE_SUBTITLE,
      });
      yCoord -= LINE_HEIGHT_SUBTITLE * 2;

      page.drawText(`${noAnswerCount}`, {
        x: X_POSITION_CHART_EXTRAS + 15,
        y: yCoord,
        font: this.fontBold,
        size: CHART_STATS_NUM_SIZE,
      });
      yCoord = yBaseCoord + CHART_HEIGHT / 3 - STANDARD_LINE_HEIGHT - 10;

      page.drawText('Ø Rating', {
        x: X_POSITION_CHART_EXTRAS,
        y: yCoord,
        font: this.fontBold,
        size: FONT_SIZE_SUBTITLE,
      });
      yCoord -= LINE_HEIGHT_SUBTITLE * 2;

      page.drawText(`${averageValueOfRatings}`, {
        x: X_POSITION_CHART_EXTRAS + this.fontBold.widthOfTextAtSize('Ø ', FONT_SIZE_TEXT),
        y: yCoord,
        font: this.fontBold,
        size: CHART_STATS_NUM_SIZE,
      });
    }
  };

  private drawAnswerTitles = () => {
    if (this.currentPage) {
      this.currentPage.drawText('Additional Remarks / Comments', {
        x: PADDING,
        y: this.textHeight,
        size: FONT_SIZE_SUBTITLE,
        font: this.fontBold,
        lineHeight: LINE_HEIGHT_SUBTITLE,
      });
      this.textHeight -= 18;

      this.currentPage.drawText('Comment', {
        x: PADDING,
        y: this.textHeight,
        size: FONT_SIZE_TEXT,
        font: this.fontBold,
        lineHeight: STANDARD_LINE_HEIGHT,
      });

      this.currentPage.drawText('Rating', {
        x: X_POSITION_BEWERTUNG - this.fontBold.widthOfTextAtSize('Bewertung', FONT_SIZE_TEXT) / 2,
        y: this.textHeight,
        size: FONT_SIZE_TEXT,
        font: this.fontBold,
        lineHeight: STANDARD_LINE_HEIGHT,
      });
    }
  };

  private drawAnswers = (answers: Answer[]) => {
    answers
      .filter((a) => a.comment !== '')
      .forEach((a) => {
        this.drawPollRating(a.rating);
        this.drawComment(a.comment);
      });
  };

  private drawPollRating = (bewertung: number) => {
    if (this.currentPage) {
      this.currentPage.drawText(bewertung.toString(), {
        x: X_POSITION_BEWERTUNG,
        y: this.textHeight,
        size: FONT_SIZE_TEXT,
        font: this.font,
        lineHeight: STANDARD_LINE_HEIGHT,
      });
    }
  };

  private drawComment = (kommentar: string) => {
    replaceNonAnsiCharacters(kommentar)
      .split('\n')
      .forEach((k) => {
        const lines = this.getLinesFromText(k);
        if (this.textHeight - lines.length * STANDARD_LINE_HEIGHT < MIN_PAGE_HEIGHT) {
          this.currentPage = this.pdfDoc.addPage(PAGE_SIZE);
          this.textHeight = INITIAL_TEXT_HEIGHT;
        }
        if (this.currentPage) {
          this.currentPage.drawText(lines.join('\n'), {
            x: PADDING,
            y: this.textHeight,
            size: FONT_SIZE_TEXT,
            font: this.font,
            lineHeight: STANDARD_LINE_HEIGHT,
          });
          this.textHeight -= this.numberOfLines * STANDARD_LINE_HEIGHT;
          this.numberOfLines = 0;
        }
      });
    this.textHeight -= 4;
  };
}
