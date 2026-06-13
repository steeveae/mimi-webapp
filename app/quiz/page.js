'use client'; // Ce composant utilise des interactions (clics, état) : il doit tourner côté navigateur

import { useState } from 'react';
import { questions as toutesLesQuestions } from '../../data/questions';

// --- FONCTIONS UTILITAIRES ---

// Normalise le texte pour comparer les réponses sans tenir compte de la casse ni des accents
function normaliser(texte) {
  return texte
    .toLowerCase()
    .normalize('NFD')                   // Décompose les caractères accentués (é → e + ´)
    .replace(/[̀-ͯ]/g, '')    // Supprime les marques d'accent
    .replace(/[-']/g, ' ')             // Remplace tirets et apostrophes par des espaces
    .trim()
    .replace(/\s+/g, ' ');             // Supprime les espaces en double
}

// Choisit 5 questions au hasard dans la liste complète
function choisirQuestions(liste) {
  const melangees = [...liste].sort(() => Math.random() - 0.5); // Mélange aléatoire
  return melangees.slice(0, 5);                                  // Garde seulement 5
}

// --- COMPOSANT PRINCIPAL ---
export default function QuizPage() {
  // "phase" contrôle quel écran on affiche
  const [phase, setPhase] = useState('accueil'); // 'accueil' | 'jeu' | 'resultat'

  // Les 5 questions choisies pour cette partie
  const [questions, setQuestions] = useState([]);

  // Index de la question en cours (0 = première, 4 = dernière)
  const [indexCourant, setIndexCourant] = useState(0);

  // Score accumulé
  const [score, setScore] = useState(0);

  // Ce que le joueur a tapé dans le champ
  const [reponse, setReponse] = useState('');

  // Résultat après validation : null = pas encore validé, 'correct' ou 'faux'
  const [feedback, setFeedback] = useState(null);

  // --- FONCTIONS DU JEU ---

  // Lance une nouvelle partie
  function demarrerPartie() {
    setQuestions(choisirQuestions(toutesLesQuestions));
    setIndexCourant(0);
    setScore(0);
    setReponse('');
    setFeedback(null);
    setPhase('jeu');
  }

  // Vérifie si la réponse du joueur est correcte
  function validerReponse() {
    if (!reponse.trim() || feedback !== null) return; // Bloque si champ vide ou déjà validé

    const question = questions[indexCourant];
    const reponseJoueur = normaliser(reponse);

    // On vérifie si la réponse correspond à l'une des réponses valides
    const estCorrect = question.reponses_valides.some(
      (r) => normaliser(r) === reponseJoueur
    );

    if (estCorrect) {
      setScore((s) => s + question.points); // Ajoute les points
      setFeedback('correct');
    } else {
      setFeedback('faux');
    }
  }

  // Passe à la question suivante (ou affiche les résultats)
  function questionSuivante() {
    if (indexCourant + 1 >= questions.length) {
      setPhase('resultat'); // Toutes les questions sont passées
    } else {
      setIndexCourant((i) => i + 1);
      setReponse('');
      setFeedback(null);
    }
  }

  // Ouvre WhatsApp avec un message pré-rempli
  function partagerWhatsApp() {
    const texte = `🇬🇦 J'ai marqué *${score} points* au quiz "Où suis-je au 241 ?" ! Peux-tu faire mieux ? 😄`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank');
  }

  // =============================
  // ÉCRAN 1 : ACCUEIL
  // =============================
  if (phase === 'accueil') {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="text-center max-w-sm w-full">

          {/* Drapeau et titre */}
          <div className="text-7xl mb-4">🇬🇦</div>
          <h1 className="text-3xl font-bold mb-3">
            Où suis-je au 241 ?
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Reconnais les lieux emblématiques de Libreville !
          </p>

          {/* Règles rapides */}
          <div className="bg-gray-800 rounded-2xl p-5 mb-10 text-left space-y-2">
            <p className="text-sm text-gray-400">
              📸 <span className="text-white">5 photos de Libreville</span>
            </p>
            <p className="text-sm text-gray-400">
              💡 <span className="text-white">Un indice par lieu</span>
            </p>
            <p className="text-sm text-gray-400">
              ⭐ <span className="text-white">Gagne jusqu'à 100 pts par bonne réponse</span>
            </p>
          </div>

          {/* Bouton Jouer */}
          <button
            onClick={demarrerPartie}
            className="w-full py-5 text-xl font-bold rounded-2xl text-white bg-gabon-vert active:opacity-80"
          >
            Jouer 🎮
          </button>
        </div>
      </main>
    );
  }

  // =============================
  // ÉCRAN 2 : JEU
  // =============================
  if (phase === 'jeu' && questions.length > 0) {
    const question = questions[indexCourant];

    // Libellé du niveau de difficulté
    const niveaux = { 1: 'Facile', 2: 'Moyen', 3: 'Difficile', 4: 'Expert' };
    const niveauLabel = niveaux[question.niveau] || 'Inconnu';

    // Barre de progression (largeur en %)
    const progression = ((indexCourant + 1) / questions.length) * 100;

    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col">

        {/* En-tête : score et progression */}
        <div className="bg-gray-900 px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gabon-jaune font-bold text-lg">⭐ {score} pts</span>
            <span className="text-gray-400 text-sm">
              Question {indexCourant + 1} / {questions.length}
            </span>
          </div>
          {/* Barre de progression verte */}
          <div className="h-1.5 bg-gray-700 rounded-full">
            <div
              className="h-1.5 bg-gabon-vert rounded-full transition-all duration-300"
              style={{ width: `${progression}%` }}
            />
          </div>
        </div>

        {/* Image du lieu à deviner */}
        <div className="relative w-full h-56 bg-gray-800">
          <img
            src={question.image}
            alt="Lieu à deviner"
            className="w-full h-full object-cover"
          />
          {/* Badge difficulté en superposition */}
          <span
            className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: question.niveau <= 2 ? '#009E60' : '#3A75C4',
              color: 'white',
            }}
          >
            {niveauLabel} · +{question.points} pts
          </span>
        </div>

        {/* Zone principale : indice, saisie, feedback, bouton */}
        <div className="flex-1 p-4 flex flex-col gap-4">

          {/* Carte indice */}
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gabon-jaune text-xs font-bold uppercase tracking-wider mb-1">
              💡 Indice
            </p>
            <p className="text-white text-lg leading-snug">{question.indice}</p>
          </div>

          {/* Champ de saisie */}
          <input
            type="text"
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            onKeyDown={(e) => {
              // Permet de valider en appuyant sur "Entrée" sur clavier physique
              if (e.key === 'Enter') validerReponse();
            }}
            placeholder="Tape le nom du lieu..."
            disabled={feedback !== null} // Bloque la saisie après validation
            className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-gabon-jaune disabled:opacity-50"
          />

          {/* Feedback visuel après validation */}
          {feedback === 'correct' && (
            <div className="bg-green-950 border border-green-600 rounded-xl p-4 text-center">
              <p className="text-green-400 font-bold text-lg">✅ Bonne réponse !</p>
              <p className="text-gray-300 mt-1">+{question.points} points</p>
            </div>
          )}
          {feedback === 'faux' && (
            <div className="bg-red-950 border border-red-700 rounded-xl p-4 text-center">
              <p className="text-red-400 font-bold text-lg">❌ Faux !</p>
              <p className="text-gray-300 mt-1">
                C'était :{' '}
                <span className="text-white font-bold">{question.lieu}</span>
              </p>
            </div>
          )}

          {/* Bouton Valider (avant réponse) ou Suivant (après réponse) */}
          <div className="mt-auto">
            {feedback === null ? (
              <button
                onClick={validerReponse}
                disabled={!reponse.trim()}
                className="w-full py-5 text-xl font-bold rounded-2xl bg-gabon-jaune text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed active:opacity-80"
              >
                Valider ✅
              </button>
            ) : (
              <button
                onClick={questionSuivante}
                className="w-full py-5 text-xl font-bold rounded-2xl bg-gabon-bleu text-white active:opacity-80"
              >
                {indexCourant + 1 >= questions.length
                  ? 'Voir mon score 🏆'
                  : 'Question suivante →'}
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // =============================
  // ÉCRAN 3 : RÉSULTATS
  // =============================
  if (phase === 'resultat') {
    const scoreMax = questions.reduce((total, q) => total + q.points, 0);
    const pourcentage = Math.round((score / scoreMax) * 100);

    // Emoji selon la performance
    let emoji = '😅';
    let message = 'Continue à t\'entraîner !';
    if (pourcentage >= 80) {
      emoji = '🏆';
      message = 'Libreville n\'a aucun secret pour toi !';
    } else if (pourcentage >= 50) {
      emoji = '🎉';
      message = 'Bonne connaissance de la capitale !';
    } else if (pourcentage >= 30) {
      emoji = '👍';
      message = 'Pas mal, tu progresses !';
    }

    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="text-center max-w-sm w-full">

          {/* Résultat visuel */}
          <div className="text-7xl mb-4">{emoji}</div>
          <h2 className="text-3xl font-bold mb-1">Résultats</h2>
          <p className="text-gray-400 mb-8">{message}</p>

          {/* Carte score */}
          <div className="bg-gray-800 rounded-2xl p-8 mb-8">
            <p className="text-gray-400 text-sm mb-1">Ton score final</p>
            <p className="text-6xl font-bold text-gabon-jaune">{score}</p>
            <p className="text-gray-400 mt-2">sur {scoreMax} points possibles</p>
            <div className="mt-4 bg-gray-700 rounded-full h-2">
              <div
                className="bg-gabon-vert h-2 rounded-full"
                style={{ width: `${pourcentage}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">{pourcentage}% de réussite</p>
          </div>

          {/* Bouton WhatsApp */}
          <button
            onClick={partagerWhatsApp}
            className="w-full py-5 text-xl font-bold rounded-2xl text-white bg-whatsapp mb-4 active:opacity-80"
          >
            Partager sur WhatsApp 📲
          </button>

          {/* Bouton Rejouer */}
          <button
            onClick={demarrerPartie}
            className="w-full py-5 text-xl font-bold rounded-2xl text-gabon-vert border-2 border-gabon-vert bg-transparent active:opacity-80"
          >
            Rejouer 🔄
          </button>
        </div>
      </main>
    );
  }

  // Cas de sécurité si aucun état ne correspond
  return null;
}
