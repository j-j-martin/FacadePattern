import './App.css';
import downloadPollReport from './pdfCreation/downloadReport';
import PollReportCreator from './pdfCreation/PollReportCreator';
import { QuestionWithAnswers } from './types';

const questions = ['How do you like Scholz?', 'How do you like Merz?', 'Are you satisfied with the economy?'];

async function getPollResults(): Promise<QuestionWithAnswers[]> {
  const response = await fetch('https://quizapp-ten-rho.vercel.app/api/pollResults', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questions),
  });
  console.log(response.json());
  return await response.json();
}

async function handleDownloadClick() {
  const reportCreator = await PollReportCreator.createInstanceAsync(await getPollResults(), '#4287f5');
  const report = await reportCreator.createReportAsync();
  downloadPollReport(report, 'howYouLikeItBra');
}
function App() {
  return (
    <>
      <h1>Poll Report Creator</h1>
      <div className="card">
        <button onClick={() => handleDownloadClick()}></button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
