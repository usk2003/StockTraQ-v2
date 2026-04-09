try:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    print("✅ GoogleGenerativeAIEmbeddings Loaded")
except Exception as e:
    print(f"❌ Error: {e}")
