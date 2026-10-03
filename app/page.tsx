"use client";

import { FormEvent, useState } from "react";

type Flashcard = { question: string; answer: string };
type Theory = { title: string; overview: string; keyIdeas: string[] };
type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};
type StudySet = {
  theory: Theory;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  source: "notes" | "topic";
  model: string;
};
type StudyMode = "lesson" | "flashcards" | "quiz";

const sampleNotes = `Photosynthesis is the process plants use to turn light energy into chemical energy. It happens mainly in the leaves, inside structures called chloroplasts. Chlorophyll, the green pigment in chloroplasts, absorbs light. Plants take in carbon dioxide from the air through tiny openings in their leaves called stomata, and water from the soil through their roots. Using light energy, they turn carbon dioxide and water into glucose and oxygen. The glucose stores energy the plant can use for growth. Oxygen is released into the air.`;

export default function Home() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [mode, setMode] = useState<StudyMode>("lesson");
  const [cardIndex, setCardIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function createStudySet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setAnswer("");
    setStudySet(null);

    try {
      const response = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, notes }),
      });
      const data = (await response.json()) as StudySet & { error?: string };

      if (!response.ok) throw new Error(data.error || "Could not make that study set.");

      setStudySet(data);
      setMode("lesson");
      setCardIndex(0);
      setQuestionIndex(0);
      setSelectedOption(null);
      setAnswerChecked(false);
    } catch (error) {
      setAnswer(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setTopic("Photosynthesis");
    setNotes(sampleNotes);
    setAnswer("");
  }

  function useTopicOnly() {
    setNotes("");
    setAnswer("");
  }

  function nextQuestion() {
    if (!studySet) return;
    setQuestionIndex((current) => (current + 1) % studySet.quiz.length);
    setSelectedOption(null);
    setAnswerChecked(false);
  }

  const currentCard = studySet?.flashcards[cardIndex];
  const currentQuestion = studySet?.quiz[questionIndex];
  const notesLength = notes.trim().length;
  const canCreateStudySet =
    (notesLength >= 40 || (notesLength === 0 && topic.trim().length > 0)) &&
    notesLength <= 12_000;
  const resourceTopic = studySet?.theory.title || topic || "study skills";
  const encodedTopic = encodeURIComponent(resourceTopic);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Pocket Tutor home">
          <span className="brand-mark" aria-hidden="true">p</span>
          <span>Pocket Tutor</span>
        </a>
        <div className="local-badge"><span className="status-dot" /> PRIVATE · LOCAL AI</div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> YOUR NOTES, YOUR PACE</p>
          <h1>A patient study buddy,<br /><em>right in your pocket.</em></h1>
          <p className="hero-description">
            Paste your notes, or enter a topic for a beginner-friendly lesson,
            flashcards, and a one-question-at-a-time quiz. Gemma runs on this computer.
          </p>
        </div>
        <div className="hero-note" aria-label="Study buddy reminder">
          <span className="note-sparkle" aria-hidden="true">✳</span>
          <span>Small steps count.<br /><strong>Take it at your pace.</strong></span>
        </div>
      </section>

      <section className="workspace" aria-label="Create a study set">
        <form className="notes-panel" onSubmit={createStudySet}>
          <div className="panel-heading">
            <div>
              <p className="section-kicker">01 / YOUR MATERIAL</p>
              <h2>Start with a topic or notes</h2>
            </div>
            <span className="step-icon" aria-hidden="true">↙</span>
          </div>

          <label className="field-label" htmlFor="topic">What are you studying?</label>
          <input
            className="text-input"
            id="topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. Photosynthesis"
            maxLength={100}
          />
          <p className="field-hint">
            {notesLength > 0 && notesLength < 40
              ? "Add at least 40 characters, or clear the notes to use only the topic."
              : "Enter a topic, paste notes, or use both."}
          </p>

          <div className="notes-label-row">
            <label className="field-label" htmlFor="notes">Your notes <span>(optional)</span></label>
            <div className="note-actions">
              {notesLength > 0 && <button className="sample-button" type="button" onClick={useTopicOnly}>Use topic only</button>}
              <button className="sample-button" type="button" onClick={loadSample}>Try sample notes</button>
            </div>
          </div>
          <textarea
            className="notes-input"
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Paste your lesson notes here, or leave blank to learn from just the topic above."
            maxLength={12_000}
          />
          <div className="notes-meta"><span>Topic and notes go to Ollama on this computer.</span><span>{notes.length.toLocaleString()} / 12,000</span></div>

          <button className="create-button" type="submit" disabled={loading || !canCreateStudySet}>
            {loading ? <><span className="spinner" aria-hidden="true" /> Making your study set…</> : <>Make my study set <span aria-hidden="true">↗</span></>}
          </button>
          {answer && <p className="error-message" role="alert">{answer}</p>}
          <p className="privacy-note"><span aria-hidden="true">⌑</span> No account. No cloud API. No judgment.</p>
        </form>

        <section className="practice-panel" aria-label="Study practice">
          {!studySet ? (
            <div className="setup-state">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">02 / PRACTICE</p>
                  <h2>Your study set lives here</h2>
                </div>
                <span className="step-icon practice-icon" aria-hidden="true">✳</span>
              </div>
              <div className="empty-preview">
                <div className="preview-stack" aria-hidden="true"><span>?</span><span>✦</span><span>✓</span></div>
                <p className="preview-title">A little practice goes a long way.</p>
              <p className="preview-copy">Start with notes or just a topic. I’ll explain the key ideas, make flashcards, and quiz you one question at a time.</p>
              </div>
              <div className="setup-card">
                <div className="setup-card-top"><span className="setup-dot" /> LOCAL MODEL SETUP</div>
                <ol>
                  <li><span>1</span>Install and open Ollama</li>
                  <li><span>2</span>Run <code>ollama pull gemma3:1b</code></li>
                  <li><span>3</span>Come back and make a study set</li>
                </ol>
                <p>Gemma runs on your computer. No API key needed.</p>
              </div>
            </div>
          ) : (
            <div className="study-state">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">02 / YOUR STUDY SET</p>
                  <h2>{topic.trim() || "Ready when you are"}</h2>
                </div>
                <span className="step-icon practice-icon" aria-hidden="true">✳</span>
              </div>
              <div className="mode-tabs" role="tablist" aria-label="Study mode">
                <button className={mode === "lesson" ? "mode-tab active" : "mode-tab"} type="button" role="tab" aria-selected={mode === "lesson"} onClick={() => setMode("lesson")}>Lesson</button>
                <button className={mode === "flashcards" ? "mode-tab active" : "mode-tab"} type="button" role="tab" aria-selected={mode === "flashcards"} onClick={() => setMode("flashcards")}>Flashcards <span>{studySet.flashcards.length}</span></button>
                <button className={mode === "quiz" ? "mode-tab active" : "mode-tab"} type="button" role="tab" aria-selected={mode === "quiz"} onClick={() => setMode("quiz")}>Mini quiz <span>{studySet.quiz.length}</span></button>
              </div>

              {mode === "lesson" && (
                <div className="lesson-area" role="tabpanel">
                  <div className="guide-origin">{studySet.source === "notes" ? "BUILT FROM YOUR NOTES" : "TOPIC-BASED STARTER GUIDE"}</div>
                  <h3 className="lesson-title">{studySet.theory.title}</h3>
                  <p className="lesson-overview">{studySet.theory.overview}</p>
                  <h4 className="key-ideas-title">Key ideas</h4>
                  <ul className="key-ideas">
                    {studySet.theory.keyIdeas.map((idea, index) => <li key={`${index}-${idea}`}>{idea}</li>)}
                  </ul>
                  {studySet.source === "topic" && (
                    <p className="guide-caveat">This is a quick guide from Gemma’s built-in knowledge. Use the links below to check details and explore further.</p>
                  )}
                  <section className="resources-card" aria-label="Further learning">
                    <h4>Keep exploring</h4>
                    <p>Open a search for a visual lesson or a deeper explanation. Your topic is shared with that site only if you click a link.</p>
                    <div className="resource-links">
                      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${resourceTopic} explained`)}`} target="_blank" rel="noreferrer">Find videos on YouTube <span aria-hidden="true">↗</span></a>
                      <a href={`https://www.khanacademy.org/search?page_search_query=${encodedTopic}`} target="_blank" rel="noreferrer">Search Khan Academy <span aria-hidden="true">↗</span></a>
                      <a href={`https://www.google.com/search?q=${encodeURIComponent(`site:openstax.org ${resourceTopic}`)}`} target="_blank" rel="noreferrer">Find free reading on OpenStax <span aria-hidden="true">↗</span></a>
                    </div>
                  </section>
                </div>
              )}

              {mode === "flashcards" && currentCard && (
                <div className="flashcard-area" role="tabpanel">
                  <div className="practice-progress"><span>FLASHCARD {cardIndex + 1} OF {studySet.flashcards.length}</span><span className="progress-track"><span style={{ width: `${((cardIndex + 1) / studySet.flashcards.length) * 100}%` }} /></span></div>
                  <article className="flashcard">
                    <span className="card-label">FRONT · THINK IT THROUGH</span>
                    <p>{currentCard.question}</p>
                    <details className="answer-reveal">
                      <summary>Show me the answer <span aria-hidden="true">＋</span></summary>
                      <p>{currentCard.answer}</p>
                    </details>
                  </article>
                  <div className="card-nav">
                    <button className="round-button" type="button" aria-label="Previous flashcard" onClick={() => setCardIndex((cardIndex - 1 + studySet.flashcards.length) % studySet.flashcards.length)}>←</button>
                    <span>{cardIndex + 1} <span className="nav-divider">/</span> {studySet.flashcards.length}</span>
                    <button className="round-button" type="button" aria-label="Next flashcard" onClick={() => setCardIndex((cardIndex + 1) % studySet.flashcards.length)}>→</button>
                  </div>
                </div>
              )}

              {mode === "quiz" && currentQuestion && (
                <div className="quiz-area" role="tabpanel">
                  <div className="practice-progress"><span>QUESTION {questionIndex + 1} OF {studySet.quiz.length}</span><span className="progress-track"><span style={{ width: `${((questionIndex + 1) / studySet.quiz.length) * 100}%` }} /></span></div>
                  <div className="quiz-question">{currentQuestion.question}</div>
                  <div className="option-list">
                    {currentQuestion.options.map((option, index) => {
                      const isCorrect = answerChecked && index === currentQuestion.correctIndex;
                      const isWrong = answerChecked && selectedOption === index && !isCorrect;
                      const className = ["quiz-option", selectedOption === index ? "selected" : "", isCorrect ? "correct" : "", isWrong ? "wrong" : ""].filter(Boolean).join(" ");
                      return (
                        <button className={className} type="button" key={`${questionIndex}-${index}`} disabled={answerChecked} onClick={() => setSelectedOption(index)}>
                          <span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>
                          {isCorrect && <span className="option-check" aria-label="Correct">✓</span>}
                          {isWrong && <span className="option-check" aria-label="Incorrect">×</span>}
                        </button>
                      );
                    })}
                  </div>
                  {answerChecked && <p className={selectedOption === currentQuestion.correctIndex ? "feedback correct-feedback" : "feedback"} aria-live="polite">{selectedOption === currentQuestion.correctIndex ? "That’s right. " : "Not quite. "}{currentQuestion.explanation}</p>}
                  {!answerChecked ? (
                    <button className="create-button quiz-submit" type="button" disabled={selectedOption === null} onClick={() => setAnswerChecked(true)}>Check my answer <span aria-hidden="true">↗</span></button>
                  ) : (
                    <button className="create-button quiz-submit" type="button" onClick={nextQuestion}>Next question <span aria-hidden="true">→</span></button>
                  )}
                </div>
              )}
              <div className="model-foot"><span className="setup-dot" /> Generated locally with {studySet.model}</div>
            </div>
          )}
        </section>
      </section>

      <footer className="page-footer">
        <span>Made for one friend, one lesson at a time.</span>
        <span>Open weights · Local inference · Yours to change</span>
      </footer>
    </main>
  );
}
