// Données du quiz "Où suis-je au 241 ?"
// Chaque question a : un lieu, une image, un indice, un niveau de difficulté et des réponses valides
export const questions = [
  {
    id: 1,
    lieu: "Pont de Gué-Gué",
    image: "https://images.unsplash.com/photo-1545558014-a1592867f279?w=600",
    indice: "Il relie la capitale à la zone industrielle.",
    niveau: 1,
    points: 10,
    // Les réponses valides : on accepte plusieurs façons d'écrire le même lieu
    reponses_valides: ["pont de gue gue", "gue gue", "pont de gué-gué"],
  },
  {
    id: 2,
    lieu: "Stade de l'Amitié",
    image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600",
    indice: "Le temple du football gabonais.",
    niveau: 1,
    points: 10,
    reponses_valides: ["stade de l'amitie", "stade", "amitie", "stade de l'amitié"],
  },
  {
    id: 3,
    lieu: "Quartier Louis",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600",
    indice: "Connu pour ses maquis et son ambiance le week-end.",
    niveau: 2,
    points: 25,
    reponses_valides: ["quartier louis", "louis"],
  },
  {
    id: 4,
    lieu: "Marché de Nkéké",
    image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600",
    indice: "Un grand marché populaire très connu pour ses tissus.",
    niveau: 2,
    points: 25,
    reponses_valides: ["nkeke", "marche de nkeke", "nkeké", "marché de nkéké"],
  },
  {
    id: 5,
    lieu: "Baie des Cocotiers",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
    indice: "L'endroit idéal pour une promenade au bord de l'eau le soir.",
    niveau: 1,
    points: 10,
    reponses_valides: ["baie des cocotiers", "baie", "cocotiers"],
  },
];
