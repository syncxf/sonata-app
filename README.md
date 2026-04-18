# Sonata: Constitutional AI Sandbox & Alignment Evaluator

Sonata is an interactive AI alignment sandbox built to explore the tension between a Large Language Model's base training (Helpful, Honest, Harmless) and user-defined steerability constraints. 

By forcing the model to expose its Chain of Thought (`<thinking>`) before answering, Sonata acts as a "glass box" for observing how constitutional rules succeed or fail against adversarial prompts.

## The Architecture
Sonata operates on a multi-agent, A/B evaluation framework:
* **The Sandbox Model (`claude-3-5-haiku-latest`):** Chosen for low-latency streaming and cost-effective rapid iteration. The frontend triggers two simultaneous API calls to this model—one "Aligned" (wrapped in the user's custom constitution) and one "Naked" (default system prompt)—allowing for real-time comparative interpretability.
* **The Evaluator Model (`claude-sonnet-4-6`):** Acting as an automated AI Safety Researcher, this heavier model operates in the background. Once the Haiku stream resolves, Sonnet grades the output on a 0-100 scale based *strictly* on adherence to the user's constitution, providing a JSON-structured justification.
* **Frontend:** Next.js (App Router), React, and Tailwind CSS.

## Core Features
* **Trace Extraction:** Prompts are engineered to force the model to output its reasoning in `<thinking>` tags. The UI intercepts and isolates this stream, rendering the model's internal conflict visible before the final response is generated.
* **A/B Split-Screen:** Visually measures the "Alignment Tax" by running aligned and unaligned models side-by-side.
* **Automated Safety Scoring:** Removes human subjectivity from the evaluation process by using a stronger model to grade a weaker one.

## Ethical Trade-offs & Limitations (Epistemic Humility)
Building this tool highlighted several persistent challenges in AI safety:
1. **The Helpfulness Override:** During testing (e.g., the "Refuse to write code" vs "FizzBuzz" test), Haiku's base training to be helpful often overrode explicit constitutional constraints. Steerability remains brittle against the HHH baseline.
2. **Evaluator Bias:** The `sonnet-4-6` evaluator model is grading based on its own internal representation of safety and alignment. If Sonnet fundamentally misunderstands the nuance of a user's custom constitution, the Safety Score will be confidently incorrect. 
3. **Prompt Injection Vulnerability:** The current system prompt wrapping the constitution is relatively simple. A sophisticated user could easily utilize standard prompt injection techniques to break the `<thinking>` structure and bypass the evaluation layer entirely.

## Local Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env.local` file in the root directory and add your Anthropic API key:
   `ANTHROPIC_API_KEY=your_key_here`
4. Start the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

*Note: This project was built alongside an Obsidian vault acting as an LLM context-engine to manage token costs and architectural decisions.*
# sonata-app
