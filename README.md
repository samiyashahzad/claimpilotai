# [cite_start]🚗 ClaimPilot AI — Agentic Auto-Insurance Surveyor [cite: 1]

![Live Demo](https://img.shields.io/badge/Live_App-Vercel-black?style=for-the-badge&logo=vercel)
![Backend](https://img.shields.io/badge/API-Hugging_Face-yellow?style=for-the-badge&logo=huggingface)
![Python](https://img.shields.io/badge/Python-FastAPI-blue?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)

[cite_start]ClaimPilot AI provides instant, AI-driven car damage surveys designed for Pakistani insurers and claims operations teams[cite: 2]. [cite_start]By replacing slow, manual inspections with a fast, consistent agentic workflow, the system estimates repair costs in PKR, highlights potential fraud, and accelerates approvals using a single uploaded crash photo[cite: 3].

## 🚀 The Problem & Solution
[cite_start]Current manual surveys take days, require physical paperwork, and create operational bottlenecks[cite: 10]. [cite_start]Human variability introduces errors, increasing exposure to fraudulent claims[cite: 11]. [cite_start]For Pakistani insurers, this means slower payouts and higher operational costs[cite: 12].

[cite_start]ClaimPilot solves this through a 5-step automated workflow[cite: 34]:
1. [cite_start]**Simple Photo Upload**: Policyholders upload a crash photo through a lightweight React web app[cite: 14, 15].
2. [cite_start]**Automated Damage Analysis**: Our Llama-4 Agent inspects the image and identifies damaged components[cite: 18, 27].
3. [cite_start]**Severity Scoring & Bounding Boxes**: Localizes damage (e.g., bumper, headlight) with confidence scores[cite: 37, 39].
4. [cite_start]**Itemized Costing (PKR)**: Calculates line-item labor, parts, and paint costs mapped to local market rates[cite: 40, 41].
5. [cite_start]**Fraud Detection**: Automated checks for improbable damage patterns raise a "flagged" verdict for investigator review[cite: 44].

## 🧠 Technical Architecture

[cite_start]ClaimPilot AI is built as a decoupled monorepo, utilizing a modern AI stack[cite: 26]:

* [cite_start]**Frontend (`/claimpilot-frontend`)**: Built with React.js and deployed on Vercel[cite: 47]. Handles the UI, image base64 encoding, and dynamic JSON data mapping.
* [cite_start]**Backend (`/backend`)**: Built with Python and FastAPI, deployed on Hugging Face Spaces[cite: 49]. 
* [cite_start]**AI Orchestration**: LangChain coordinates the agent steps, forcing strict JSON outputs via structured prompt templates[cite: 26, 49].
* [cite_start]**Inference Engine**: Powered by Llama-4 Vision models via Groq, with temperature set to `0.0` for deterministic, reliable financial outputs[cite: 27].

## 💻 Local Development Setup

Clone the repository to your local machine:
```bash
git clone [https://github.com/yourusername/claimpilotai.git](https://github.com/yourusername/claimpilotai.git)
cd claimpilotai
