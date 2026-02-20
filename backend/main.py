import base64
import json
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

load_dotenv()

app = FastAPI()

# This is CRITICAL: It allows  React app (running on a different port) 
# to talk to your Python API without being blocked by security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def read_root():
    return {"message": "ClaimPilot API is live! Go to /docs to test the endpoints."}

@app.post("/api/audit")
async def audit_damage(file: UploadFile = File(...)):
    try:
        # 1. Read the image from the React frontend
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')

        # 2. Initialize the AI (The "Brain")
        llm = ChatGroq(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            temperature=0.0
        )

        # 3. The Prompt (Forcing JSON output)
        messages = [
            SystemMessage(content="""
                You are an expert Pakistani auto-insurance surveyor and fraud investigator. Analyze the car crash photo. First, check for signs of fraud (e.g., mismatched lighting, digital manipulation, or if it looks like a stock photo). Then, provide a repair estimate. Output ONLY valid JSON without trailing commas.
                {
                    "damaged_parts": ["part1", "part2"],
                    "itemized_costs": {"part1": "cost", "part2": "cost"},
                    "total_estimate_pkr": "total",
                    "verdict": "Approved/Flagged",
                    "fraud_analysis": "Looks authentic / Suspected digital manipulation",
                    "fraud_confidence_score": 95 // Integer from 0 to 100. 100 means completely authentic, 0 means definite fraud.
                }
            """),
            HumanMessage(content=[
                {"type": "text", "text": "Analyze this car damage."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ])
        ]

        # 4. Get AI response and return as JSON
        response = llm.invoke(messages)
        raw_text = response.content.replace("```json", "").replace("```", "").strip()
        return json.loads(raw_text)

    except Exception as e:
        return {"error": str(e)}

# To run this: uvicorn main:app --reload