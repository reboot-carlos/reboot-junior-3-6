import os
import httpx
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Testicrousti")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("ANTHROPIC_API_KEY non trouvée dans les variables d'environnement")

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

class ChatRequest(BaseModel):
    message: str | None = None
    step: str | None = None
    test_name: str | None = None
    questions: list | None = None
    answers: list | None = None

def call_claude(messages: list, system_prompt: str) -> str:
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    payload = {
        "model": "claude-3-sonnet-20240229",
        "max_tokens": 1000,
        "system": system_prompt,
        "messages": messages,
    }

    try:
        with httpx.Client() as client:
            response = client.post(ANTHROPIC_API_URL, json=payload, headers=headers, timeout=30.0)
            if response.status_code != 200:
                print(f"Erreur API: {response.status_code} - {response.text}")
                response.raise_for_status()

            data = response.json()
            return data["content"][0]["text"]
    except Exception as e:
        print(f"Erreur lors de l'appel Claude: {e}")
        raise

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}

@app.post("/api/chat")
async def chat(request: ChatRequest) -> dict:
    if request.step == "generate_test":
        # Générer 7 questions pour le test
        system_prompt = """Tu es Testicrousti, un chatbot bienveillant et professionnel.
Tu dois générer exactement 7 questions à choix multiples pour un test de personnalité.
Chaque question doit avoir exactement 4 options (A, B, C, D).

Réponds UNIQUEMENT avec un JSON valide, sans aucun texte avant ou après, suivant ce format:
{
  "questions": [
    {
      "text": "Question 1?",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    },
    ...
  ]
}

Les questions doivent être pertinentes, engageantes et aider à mieux connaître la personne."""

        user_message = f"Crée 7 questions à choix multiples pour un test: '{request.message}'"

        try:
            response_text = call_claude(
                [{"role": "user", "content": user_message}],
                system_prompt
            )

            # Extraire le JSON
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            json_str = response_text[json_start:json_end]
            data = json.loads(json_str)

            return {"questions": data["questions"]}
        except Exception as e:
            print(f"Erreur: {e}")
            return {
                "questions": [
                    {
                        "text": "Erreur lors de la génération. Réessaie!",
                        "options": ["A", "B", "C", "D"]
                    }
                ]
            }

    elif request.step == "generate_profile":
        # Générer le profil basé sur les réponses
        system_prompt = """Tu es Testicrousti, un chatbot bienveillant et professionnel.
Tu dois générer un profil personnalisé basé sur les réponses du test.
Le profil doit être:
- Honnête et perspicace (3-4 paragraphes)
- Positif et encourageant
- Basé sur les patterns de réponses
- En français, naturel et chaleureux

Sois authentique, pas génériques ni plats."""

        # Construire le contexte des réponses
        context = f"Test: {request.test_name}\n\nQuestions et réponses:\n"
        for i, q in enumerate(request.questions):
            answer_letter = request.answers[i]
            answer_text = q["options"][ord(answer_letter) - ord('A')]
            context += f"Q{i+1}: {q['text']}\nRéponse: {answer_letter} - {answer_text}\n\n"

        user_message = f"Génère un profil personnalisé basé sur ces réponses:\n{context}"

        try:
            profile = call_claude(
                [{"role": "user", "content": user_message}],
                system_prompt
            )
            return {"profile": profile}
        except Exception as e:
            print(f"Erreur: {e}")
            return {"profile": "Profil indisponible pour le moment."}

    return {"error": "Requête invalide"}

# Servir le frontend en production
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
