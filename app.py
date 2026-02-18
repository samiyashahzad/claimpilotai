import base64
import streamlit as st
from PIL import Image
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import json

# Load the secret API key from the .env file
load_dotenv()

# --- HELPER FUNCTION: Translating image for the LLM ---
def encode_image(uploaded_file):
    """Converts the uploaded image into a Base64 text string so Groq can 'see' it."""
    return base64.b64encode(uploaded_file.getvalue()).decode('utf-8')

# --- UI SETUP ---
st.set_page_config(page_title="ClaimPilot AI", layout="centered")
st.title("🚗 ClaimPilot AI")
st.markdown("**Agentic Auto-Insurance Surveyor**")
st.write("Upload a photo of the vehicle damage to instantly generate an AI survey report and repair estimate.")

# The File Uploader
uploaded_file = st.file_uploader("Upload Crash Photo (JPG/PNG)", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Display the uploaded image
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Vehicle Photo", use_container_width=True)
    
    # --- THE REAL AGENTIC WORKFLOW (THE BRAIN) ---
    if st.button("Run AI Damage Audit"):
        
        with st.spinner("Agent is analyzing the damage using Groq Vision..."):
            try:
                # 1. Initialize the Groq Vision Model
                llm = ChatGroq(
                    model="meta-llama/llama-4-scout-17b-16e-instruct",
                    temperature=0.0 # Temperature 0 makes the AI factual, not creative
                )
                
                # 2. Convert the image
                base64_image = encode_image(uploaded_file)
                
                # 3. Create the Agent Prompt
                messages = [
                    SystemMessage(content="""
                    You are an expert Pakistani auto-insurance surveyor. 
                    Analyze the car crash photo and provide a repair estimate based on local market rates in PKR.
                    
                    CRITICAL RULE: You MUST output the result as a valid JSON object. 
                    Do not include any conversational text, greetings, or markdown blocks (like ```json). ONLY output the raw JSON.
                    
                    Use exactly this JSON structure:
                    {
                        "damaged_parts": ["part1", "part2"],
                        "itemized_costs": {
                            "part1": "cost in PKR",
                            "part2": "cost in PKR"
                        },
                        "labor_cost_pkr": "estimated labor cost",
                        "total_estimate_pkr": "total numeric cost",
                        "verdict": "Approved or Flagged for Review"
                    }
                    """),
                    HumanMessage(content=[
                        {"type": "text", "text": "Analyze this car damage and provide the estimate."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ])
                ]
                
                # 4. Trigger the Agent
                response = llm.invoke(messages)
                
                # Clean up the output just in case the AI adds markdown backticks
                raw_text = response.content.replace("```json", "").replace("```", "").strip()
                
                # 5. Convert text to a Python Dictionary
                survey_data = json.loads(raw_text)
                
                # 6. Display it beautifully in the UI
                st.success("Audit Complete!")
                
                # Use Streamlit columns to make it look like a real dashboard
                col1, col2 = st.columns(2)
                with col1:
                    st.metric(label="Total Estimate (PKR)", value=survey_data["total_estimate_pkr"])
                with col2:
                    st.metric(label="Claim Verdict", value=survey_data["verdict"])
                    
                st.subheader("📋 Itemized Repair Bill")
                st.write(survey_data["itemized_costs"])
                
            except Exception as e:
                st.error(f"An error occurred. Make sure your GROQ_API_KEY is in the .env file! Error: {e}")