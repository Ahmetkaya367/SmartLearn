import requests

API_KEY = "AIzaSyDilNayz2qPVuj5RIvFyDME3-3Ln3FVKio"
URL = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

try:
    response = requests.get(URL)
    if response.status_code == 200:
        models = response.json().get('models', [])
        print("Mevcut Modeller:")
        for model in models:
            print(f"- {model['name']} (Desteklenen Metotlar: {model['supportedGenerationMethods']})")
    else:
        print(f"Hata: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Bir hata oluştu: {e}")
