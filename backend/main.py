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

app = FastAPI(title="Testoi")

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
    test_type: str | None = None

def ask_test_customization(test_name: str, language: str = "fr") -> str:
    """Demande à l'utilisateur comment personnaliser le test avec support multilingue"""
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

    system_prompt = f"""Tu es Testoi, un coach bienveillant de découverte de soi.
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

def generate_test_with_claude(test_name: str, user_preference: str = "", language: str = "fr", test_type: str = "qcm") -> dict:
    """Génère 10 questions de test personnalisées en fonction des préférences et de la langue"""

    # Format les prompts en fonction du type de test
    if test_type == "libres":
        system_suffix = """

IMPORTANT: Les questions doivent être SANS options. Ce sont des questions ouvertes."""
        format_json = """Format JSON (EXACTEMENT):
{"questions": [
  {"text": "Question ouverte sans options?"},
  ...
]}"""
        rule_3 = "Les questions doivent être sans réponse prédéfinie"
        rule_4 = "Pas de réponse correcte, juste explorer les pensées"
    else:
        system_suffix = ""
        format_json = """Format JSON (EXACTEMENT):
{"questions": [
  {"text": "Question?", "options": ["Option A", "Option B", "Option C", "Option D"]},
  ...
]}"""
        rule_3 = "Les 4 options doivent être nuancées et représenter des perspectives différentes"
        rule_4 = "Aucune option ne doit être clairement meilleure qu'une autre"

    # Prompts en différentes langues
    prompts = {
        "fr": {
            "system": f"""Tu es un expert en création de tests de personnalité pour jeunes adultes.
Tu dois générer 10 questions pertinentes, originales et engageantes, adaptées à la préférence de l'utilisateur.

RÈGLES STRICTES:
1. Retourne UNIQUEMENT un JSON valide, sans markdown ni texte supplémentaire
2. Chaque question doit être différente en approche
3. {rule_3}
4. {rule_4}
5. Les questions doivent explorer la psychologie et les préférences de manière subtile
6. Les questions doivent être personnalisées en fonction du commentaire de l'utilisateur
7. Réponds TOUJOURS en français{system_suffix}

{format_json}""",
            "user": f"""Crée 10 questions uniques pour ce test: {test_name}

Préférence de l'utilisateur: {user_preference}

Les questions doivent:
- Être variées en style
- Couvrir différentes dimensions du thème "{test_name}"
- Être adaptées à la préférence mentionnée par l'utilisateur
- Être engageantes et pertinentes pour des jeunes
- Avoir des réponses nuancées et sans réponse "parfaite"
- Révéler quelque chose d'authentique sur la personne

Retourne UNIQUEMENT le JSON, rien d'autre."""
        },
        "en": {
            "system": """You are an expert in creating personality tests for young adults.
You must generate 10 relevant, original and engaging questions, adapted to the user's preference.

STRICT RULES:
1. Return ONLY valid JSON, no markdown or extra text
2. Each question must have a different approach
3. The 4 options must be nuanced and represent different perspectives
4. No option should be clearly "better" than another
5. Questions should explore psychology and preferences subtly
6. Questions should be personalized based on user comment
7. Always respond in English

JSON Format (EXACTLY):
{"questions": [
  {"text": "Question?", "options": ["Option A", "Option B", "Option C", "Option D"]},
  ...
]}""",
            "user": f"""Create 10 unique questions for this test: {test_name}

User preference: {user_preference}

The questions should:
- Be varied in style
- Cover different dimensions of the "{test_name}" theme
- Be adapted to the user's mentioned preference
- Be engaging and relevant for young people
- Have nuanced answers with no "perfect" answer
- Reveal something authentic about the person

Return ONLY the JSON, nothing else."""
        },
        "de": {
            "system": """Du bist ein Experte im Erstellen von Persönlichkeitstests für junge Erwachsene.
Du musst 10 relevante, originelle und ansprechende Fragen generieren, die den Vorlieben des Benutzers entsprechen.

STRIKTE REGELN:
1. Geben Sie NUR gültiges JSON zurück, kein Markdown oder zusätzlicher Text
2. Jede Frage muss einen anderen Ansatz haben
3. Die 4 Optionen müssen nuanciert sein und verschiedene Perspektiven darstellen
4. Keine Option sollte eindeutig "besser" sein als eine andere
5. Fragen sollten Psychologie und Vorlieben subtil erforschen
6. Fragen sollten basierend auf Benutzerkommentar personalisiert werden
7. Antworte immer auf Deutsch

JSON Format (GENAU):
{"questions": [
  {"text": "Frage?", "options": ["Option A", "Option B", "Option C", "Option D"]},
  ...
]}""",
            "user": f"""Erstellen Sie 10 einzigartige Fragen für diesen Test: {test_name}

Benutzervorliebe: {user_preference}

Die Fragen sollten:
- Im Stil variiert sein
- Verschiedene Dimensionen des Themas "{test_name}" abdecken
- An die genannte Vorliebe des Benutzers angepasst sein
- Ansprechend und relevant für junge Menschen sein
- Nuancierte Antworten ohne "perfekte" Antwort haben
- Etwas Authentisches über die Person offenbaren

Geben Sie NUR das JSON zurück, nichts anderes."""
        },
        "es": {
            "system": """Eres un experto en crear pruebas de personalidad para adultos jóvenes.
Debes generar 10 preguntas relevantes, originales y atractivas, adaptadas a la preferencia del usuario.

REGLAS ESTRICTAS:
1. Devuelve SOLO JSON válido, sin markdown ni texto extra
2. Cada pregunta debe tener un enfoque diferente
3. Las 4 opciones deben ser matizadas y representar diferentes perspectivas
4. Ninguna opción debe ser claramente "mejor" que otra
5. Las preguntas deben explorar la psicología y preferencias sutilmente
6. Las preguntas deben personalizarse según el comentario del usuario
7. Siempre responde en español

Formato JSON (EXACTAMENTE):
{"questions": [
  {"text": "¿Pregunta?", "options": ["Opción A", "Opción B", "Opción C", "Opción D"]},
  ...
]}""",
            "user": f"""Crea 10 preguntas únicas para esta prueba: {test_name}

Preferencia del usuario: {user_preference}

Las preguntas deben:
- Ser variadas en estilo
- Cubrir diferentes dimensiones del tema "{test_name}"
- Estar adaptadas a la preferencia mencionada del usuario
- Ser atractivas y relevantes para jóvenes
- Tener respuestas matizadas sin respuesta "perfecta"
- Revelar algo auténtico sobre la persona

Devuelve SOLO el JSON, nada más."""
        }
    }

    # Obtener prompts en la lengua solicitada, por defecto francés
    lang_prompts = prompts.get(language, prompts["fr"])
    system_prompt = lang_prompts["system"]
    user_message = lang_prompts["user"]

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

    system_prompt = f"""Tu es Testoi, un coach de découverte de soi bienveillant, introspectif et inspirant.

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
    """Discute avec Claude comme Testoi, un bot de découverte de soi"""
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

    system_prompt = f"""Tu es Testoi, un chatbot bienveillant et enthousiate spécialisé dans la découverte de soi à travers des tests de personnalité.
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
            language = request.language or "fr"
            test_type = request.test_type or "qcm"
            data = generate_test_with_claude(test_name, user_preference, language, test_type)
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
