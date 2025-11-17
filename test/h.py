import google.generativeai as genai



MODEL_NAME = "models/gemini-2.5-pro-preview-03-25"



model = genai.GenerativeModel(MODEL_NAME)

resp = model.generate_content("fever symptoms")
print(resp.text)
