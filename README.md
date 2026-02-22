# 🚗 ClaimPilot AI — Agentic Auto-Insurance Surveyor 

![Live Demo](https://img.shields.io/badge/Live_App-Vercel-black?style=for-the-badge&logo=vercel)
![Backend](https://img.shields.io/badge/API-Hugging_Face-yellow?style=for-the-badge&logo=huggingface)
![Python](https://img.shields.io/badge/Python-FastAPI-blue?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)

ClaimPilot AI provides instant, AI-driven car damage surveys designed for Pakistani insurers and claims operations teams. By replacing slow, manual inspections with a fast, consistent agentic workflow, the system estimates repair costs in PKR, highlights potential fraud, and accelerates approvals using a single uploaded crash photo.
# live link 
https://claimpilotai.vercel.app/

## 🚀 The Problem & Solution
Current manual surveys take days, require physical paperwork, and create operational bottlenecks. Human variability introduces errors, increasing exposure to fraudulent claims. For Pakistani insurers, this means slower payouts and higher operational costs.

ClaimPilot solves this through a 5-step automated workflow:
1. **Simple Photo Upload**: Policyholders upload a crash photo through a lightweight React web app.
2.**Automated Damage Analysis**: Our Llama-4 Agent inspects the image and identifies damaged components.
3. **Severity Scoring & Bounding Boxes**: Localizes damage (e.g., bumper, headlight) with confidence scores.
4. **Itemized Costing (PKR)**: Calculates line-item labor, parts, and paint costs mapped to local market rates.
5. **Fraud Detection**: Automated checks for improbable damage patterns raise a "flagged" verdict for investigator review.

## 🧠 Technical Architecture

ClaimPilot AI is built as a decoupled monorepo, utilizing a modern AI stack:

* **Frontend (`/claimpilot-frontend`)**: Built with React.js and deployed on Vercel. Handles the UI, image base64 encoding, and dynamic JSON data mapping.
* **Backend (`/backend`)**: Built with Python and FastAPI, deployed on Hugging Face Spaces. 
* **AI Orchestration**: LangChain coordinates the agent steps, forcing strict JSON outputs via structured prompt templates.
* **Inference Engine**: Powered by Llama-4 Vision models via Groq, with temperature set to `0.0` for deterministic, reliable financial outputs.

## 💻 Local Development Setup

Clone the repository to your local machine:
```bash
git clone [https://github.com/yourusername/claimpilotai.git](https://github.com/yourusername/claimpilotai.git)
cd claimpilotai
