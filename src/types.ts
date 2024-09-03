export type QuestionWithAnswers = {
  Question: string;
  Answers: Answer[];
}

export type Answer = {
  rating: number;
  comment: string;
}