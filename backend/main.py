import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
from anthropic import Anthropic

from dotenv import load_dotenv
load_dotenv()

client = Anthropic()

app = FastAPI(title="Testicrousti")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str | None = None
    step: str | None = None
    test_name: str | None = None
    questions: list | None = None
    answers: list | None = None
    conversation_history: list | None = None
    language: str | None = None

def ask_test_customization(test_name: str, language: str = "fr") -> str:
    """Demande à l'utilisateur comment personnaliser le test"""
    lang_name = {
        "fr": "français",
        "en": "english",
        "de": "german",
        "es": "espagnol",
        "it": "italien",
        "zh": "chinois",
        "ru": "russe",
        "pt": "portugais",
        "he": "hébreu",
        "el": "grec",
    }.get(language, "français")

    system_prompt = f"""Tu es Testicrousti, un coach bienveillant de découverte de soi.
L'utilisateur a choisi le thème "{test_name}".

Pose une question engageante et naturelle pour personnaliser son test.
IMPORTANT:
- Réponds UNIQUEMENT en {lang_name}
- N'utilise AUCUN emoji dans ta réponse
- La question doit être courte, amicale et naturelle"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=150,
        system=system_prompt,
        messages=[{"role": "user", "content": f"J'aimerais faire le test: {test_name}"}],
    )
    return response.content[0].text

def generate_test_with_claude(test_name: str, user_preference: str = "") -> dict:
    """Génère 7 questions de test personnalisées en fonction des préférences"""
    system_prompt = """Tu es un expert en création de tests de personnalité pour jeunes adultes.
Tu dois générer 7 questions pertinentes, originales et engageantes, adaptées à la préférence de l'utilisateur.

RÈGLES STRICTES:
1. Retourne UNIQUEMENT un JSON valide, sans markdown ni texte supplémentaire
2. Chaque question doit être différente en approche
3. Les 4 options doivent être nuancées et représenter des perspectives différentes
4. Aucune option ne doit être clairement "meilleure" qu'une autre
5. Les questions doivent explorer la psychologie et les préférences de manière subtile
6. Les questions doivent être personnalisées en fonction du commentaire de l'utilisateur

Format JSON (EXACTEMENT):
{"questions": [
  {"text": "Question?", "options": ["Option A", "Option B", "Option C", "Option D"]},
  ...
]}"""

    user_message = f"""Crée 7 questions uniques pour ce test: {test_name}

Préférence de l'utilisateur: {user_preference}

Les questions doivent:
- Être variées en style
- Couvrir différentes dimensions du thème "{test_name}"
- Être adaptées à la préférence mentionnée par l'utilisateur
- Être engageantes et pertinentes pour des jeunes
- Avoir des réponses nuancées et sans réponse "parfaite"
- Révéler quelque chose d'authentique sur la personne

Retourne UNIQUEMENT le JSON, rien d'autre."""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2500,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    response_text = response.content[0].text.strip()

    # Nettoyer markdown si présent
    if response_text.startswith("```"):
        response_text = response_text.split("```")[1]
        if response_text.startswith("json"):
            response_text = response_text[4:]

    response_text = response_text.strip()

    try:
        data = json.loads(response_text)
        # Valider la structure
        if "questions" in data and len(data["questions"]) >= 7:
            return data
        else:
            raise ValueError("Format invalide")
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Erreur parsing JSON: {e}")
        # Fallback: retourner une structure par défaut
        return {
            "questions": [
                {"text": "Erreur de génération. Réessaie!", "options": ["A", "B", "C", "D"]}
            ]
        }

def generate_profile_with_claude(test_name: str, answers: list, questions: list, language: str = "fr") -> str:
    """Génère un profil profond et personnalisé en utilisant Claude"""
    lang_name = {
        "fr": "français",
        "en": "english",
        "de": "german",
        "es": "espagnol",
        "it": "italien",
        "zh": "chinois",
        "ru": "russe",
        "pt": "portugais",
        "he": "hébreu",
        "el": "grec",
    }.get(language, "français")

    # Construire le contexte complet des réponses
    questions_and_answers = []
    for i, (q, ans) in enumerate(zip(questions, answers)):
        answer_idx = ord(ans) - ord('A')
        answer_text = q["options"][answer_idx] if answer_idx < len(q["options"]) else "Réponse invalide"
        questions_and_answers.append({
            "question": q["text"],
            "options": q["options"],
            "selected": answer_text,
            "choice": ans
        })

    system_prompt = f"""Tu es Testicrousti, un coach de découverte de soi bienveillant, introspectif et inspirant.

Ton rôle: analyser les réponses du test et générer un profil personnalisé qui:
1. Révèle des patterns et des traits authentiques
2. Offre des insights profonds et non-évidents
3. Valide les forces de la personne
4. Suggère des pistes de développement personnel
5. Reste encourageant, authentique et jeune dans le ton

IMPORTANT:
- Réponds UNIQUEMENT en {lang_name}
- N'utilise AUCUN emoji dans ta réponse

Réponds avec empathie et sans jugement."""

    user_prompt = f"""Analyse ce test de personnalité sur "{test_name}":

{json.dumps(questions_and_answers, ensure_ascii=False, indent=2)}

Génère un profil complet. Sois authentique et spécifique, pas générique."""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=800,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    profile_text = response.content[0].text

    # Ajouter le résumé des réponses
    summary_label = {
        "fr": "Résumé de tes réponses au test",
        "es": "Resumen de tus respuestas",
        "it": "Riepilogo delle tue risposte",
        "zh": "你的答案总结",
        "ru": "Сводка твоих ответов",
        "pt": "Resumo de suas respostas",
        "he": "סיכום התשובות שלך",
        "el": "Περίληψη των απαντήσεών σας",
    }.get(language, "Résumé de tes réponses au test")

    answer_display = f"\n\n{summary_label} '{test_name}':\n\n"
    for i, (q, ans) in enumerate(zip(questions, answers)):
        answer_idx = ord(ans) - ord('A')
        answer_text = q["options"][answer_idx] if answer_idx < len(q["options"]) else "Réponse invalide"
        answer_display += f"**Q{i+1}:** {q['text']}\n→ {answer_text}\n\n"

    return f"{profile_text}{answer_display}"

def chat_with_claude(message: str, conversation_history: list = None, language: str = "fr") -> str:
    """Discute avec Claude comme Testicrousti, un bot de découverte de soi"""
    if conversation_history is None:
        conversation_history = []

    lang_name = {
        "fr": "français",
        "en": "english",
        "de": "german",
        "es": "espagnol",
        "it": "italien",
        "zh": "chinois",
        "ru": "russe",
        "pt": "portugais",
        "he": "hébreu",
        "el": "grec",
    }.get(language, "français")

    system_prompt = f"""Tu es Testicrousti, un chatbot bienveillant et enthousiate spécialisé dans la découverte de soi à travers des tests de personnalité.
Tu aides les jeunes à mieux se comprendre par des questions engageantes et des analyses approfondies.

Caractéristiques:
- Amical, encouraging, et bienveillant
- Tu poses des questions pertinentes quand c'est approprié
- Tu offres des insights sur les réponses de l'utilisateur
- Tu peux proposer des tests basés sur les intérêts de l'utilisateur
- Tu gardes un ton jeune et accessible

IMPORTANT:
- Réponds UNIQUEMENT en {lang_name}
- N'utilise AUCUN emoji dans tes réponses

Réponds naturellement et intelligemment à ce que l'utilisateur te dit, en restant dans le contexte de la découverte de soi et des tests de personnalité."""

    messages = conversation_history + [{"role": "user", "content": message}]

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        system=system_prompt,
        messages=messages,
    )

    return response.content[0].text

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}

@app.post("/api/chat")
async def chat(request: ChatRequest) -> dict:
    lang = request.language or "fr"

    if request.step == "ask_customization":
        try:
            question = ask_test_customization(request.message or "", lang)
            return {"question": question}
        except Exception as e:
            print(f"Erreur customization: {e}")
            return {"question": "Qu'est-ce qui t'intéresse dans ce thème ?"}

    elif request.step == "generate_test":
        try:
            test_name = request.test_name or request.message or ""
            user_preference = request.message or ""
            data = generate_test_with_claude(test_name, user_preference)
            return {"questions": data["questions"]}
        except Exception as e:
            print(f"Erreur génération test: {e}")
            return {
                "questions": [
                    {
                        "text": "Erreur lors de la génération du test. Réessaie!",
                        "options": ["Réessayer", "Autre test", "Menu", "Plus tard"]
                    }
                ]
            }

    elif request.step == "generate_profile":
        try:
            profile = generate_profile_with_claude(request.test_name or "", request.answers or [], request.questions or [], lang)
            return {"profile": profile}
        except Exception as e:
            print(f"Erreur génération profil: {e}")
            return {"profile": "Désolé, je n'ai pas pu générer ton profil. Réessaie plus tard!"}

    elif request.step == "chat":
        try:
            response = chat_with_claude(request.message or "", request.conversation_history or [], lang)
            return {"response": response}
        except Exception as e:
            print(f"Erreur chat: {e}")
            return {"response": "Désolé, j'ai eu un souci. Peux-tu réessayer?"}

    return {"error": "Requête invalide"}

# Servir le frontend en production
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
