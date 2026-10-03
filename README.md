# Pocket Tutor

Pocket Tutor is a small, local-AI study buddy. Enter a topic for a beginner-friendly lesson, or paste class notes to make a guide grounded in that material. It adds key ideas, four flashcards, and a one-question-at-a-time quiz.

## Why this is useful

The student can start even when they have no notes ready. A topic-only guide gives them a first explanation and practice questions; pasted notes keep the generated study set focused on the material they need to revise. The app can also open searches for videos and free reading when the student wants a visual explanation or another source.

## Stack

- Next.js App Router + TypeScript
- Ollama for local inference
- Gemma 3 1B (`gemma3:1b`) by default, chosen to run on computers with limited memory
- No account, cloud inference API, or cloud database

## Run locally

1. Install [Node.js 20.9 or newer](https://nodejs.org/) and [Ollama](https://ollama.com/download).
2. Start Ollama and download Gemma:

   ```powershell
   ollama pull gemma3:1b
   ```

3. Install the app dependencies and start Next.js:

   ```powershell
   pnpm install
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

The API defaults to `http://127.0.0.1:11434` and the `gemma3:1b` model. To change either, copy `.env.example` to `.env.local`, edit the values, then restart `pnpm dev`.

## Privacy and limitations

Topics and notes are sent to the Ollama service on the same computer. The app does not call a cloud AI API or save study sessions to a cloud database. The first-time app/model downloads require internet; after setup, generation is local. Further-learning links are optional external searches. Clicking one sends the topic to that search site.

Topic-only guides come from the model's built-in knowledge and may be wrong or incomplete. The app labels them as a starting point and offers searches for additional explanations. When notes are supplied, the prompt asks Gemma to stay within those notes.

## Demo and friend feedback

Show the topic-only flow, then try notes-based generation. For the challenge submission, hand Pocket Tutor to a real friend with a real study need. Include their actual reaction or the change you made from their feedback, with their permission. Do not present sample data or a simulated review as a real user story.
