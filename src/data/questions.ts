import { QuizQuestion } from '../types';

export const ANIME_QUESTIONS: QuizQuestion[] = [
  // --- ONE PIECE ---
  {
    id: 'op-1',
    manga: 'One Piece',
    question: 'Quel est le nom du tout premier navire de l’équipage du Chapeau de Paille ?',
    options: ['Going Merry', 'Thousand Sunny', 'Red Force', 'Moby Dick', 'Oro Jackson'],
    correctIndex: 0,
    difficulty: 'facile',
    points: 10,
    explanation: 'Le Going Merry est offert par Kaya et Merry à Syrup Village.'
  },
  {
    id: 'op-2',
    manga: 'One Piece',
    question: 'Quel est le véritable nom du fruit du démon mangé par Monkey D. Luffy ?',
    options: ['Gomu Gomu no Mi', 'Hito Hito no Mi, modèle Nika', 'Ope Ope no Mi', 'Mochi Mochi no Mi', 'Ito Ito no Mi'],
    correctIndex: 1,
    difficulty: 'moyen',
    points: 20,
    explanation: 'Révélé lors de l’arc Wano : le fruit est le Zoan mythique Hito Hito no Mi modèle Nika.'
  },
  {
    id: 'op-3',
    manga: 'One Piece',
    question: 'Quel était le montant exact de la toute première prime sur la tête de Roronoa Zoro ?',
    options: ['30 000 000 Berry', '60 000 000 Berry', '120 000 000 Berry', '320 000 000 Berry', '15 000 000 Berry'],
    correctIndex: 1,
    difficulty: 'difficile',
    points: 30,
    explanation: 'Après les événements d’Alabasta et la défaite de Mr. 1, sa prime est passée à 60 millions de Berrys.'
  },
  {
    id: 'op-4',
    manga: 'One Piece',
    question: 'Dans les Flashbacks du Siècle Oublié, quel ancien royaume a forgé les Ponéglyphes ?',
    options: ['Le clan Kozuki de Wano', 'La lignée des Lunarias', 'Le clan Don Quijote', 'Les géants d’Elbaph', 'Les hommes-poissons'],
    correctIndex: 0,
    difficulty: 'extreme',
    points: 50,
    explanation: 'Ce sont les tailleurs de pierre du clan Kozuki de Wano qui ont gravé les Ponéglyphes indestructibles.'
  },

  // --- NARUTO ---
  {
    id: 'nar-1',
    manga: 'Naruto',
    question: 'Quel est le démon à queues (Bijuu) scellé à l’intérieur de Naruto Uzumaki ?',
    options: ['Shukaku', 'Matatabi', 'Kurama', 'Gyuki', 'Son Goku'],
    correctIndex: 2,
    difficulty: 'facile',
    points: 10,
    explanation: 'Kurama est Kyubi, le renard à neuf queues scellé en Naruto par Minato.'
  },
  {
    id: 'nar-2',
    manga: 'Naruto',
    question: 'Quelle est la véritable forme de Naruto lorsqu’il fusionne le chakra de Kurama et des Six Chemins ?',
    options: ['Mode Ermite', 'Mode Rikudo Sennin', 'Mode Bijuu pur', 'Mode Sage des Crapauds', 'Mode Otsutsuki'],
    correctIndex: 1,
    difficulty: 'moyen',
    points: 20,
    explanation: 'C’est le mode Ermite Rikudo (Six Chemins) accordé par Hagoromo Otsutsuki.'
  },
  {
    id: 'nar-3',
    manga: 'Naruto',
    question: 'Quel est le nom de l’épée légendaire de Zabuza Momochi puis de Suigetsu Hozuki ?',
    options: ['Samehada', 'Kubikiribocho', 'Kiba', 'Hiramekarei', 'Nuibari'],
    correctIndex: 1,
    difficulty: 'difficile',
    points: 30,
    explanation: 'Kubikiribocho (le Hachoir de Kiri) a la propriété de se régénérer avec le fer contenu dans le sang de ses ennemis.'
  },
  {
    id: 'nar-4',
    manga: 'Naruto',
    question: 'Quelle combinaison précise de natures de chakra compose le Jinton (art de la poussière) de Mu et Onoki ?',
    options: ['Vent + Terre + Foudre', 'Feu + Terre + Vent', 'Eau + Terre + Foudre', 'Feu + Vent + Eau', 'Yin + Yang + Terre'],
    correctIndex: 1,
    difficulty: 'extreme',
    points: 50,
    explanation: 'Le Jinton est un Kekkei Tota combinant simultanément les affinités Feu, Terre et Vent.'
  },

  // --- DRAGON BALL ---
  {
    id: 'db-1',
    manga: 'Dragon Ball',
    question: 'Sur quelle planète Son Goku se transforme-t-il pour la première fois en Super Saiyan ?',
    options: ['La Terre', 'Namek', 'Yardrat', 'Planète Vegeta', 'Planète Kaio'],
    correctIndex: 1,
    difficulty: 'facile',
    points: 10,
    explanation: 'Goku se transforme en Super Saiyan contre Freezer sur la planète Namek après la mort de Krillin.'
  },
  {
    id: 'db-2',
    manga: 'Dragon Ball',
    question: 'Comment s’appelle la fusion par boucle d’oreille entre Son Goku et Vegeta ?',
    options: ['Gogeta', 'Vegetto', 'Gotenks', 'Veku', 'Goketa'],
    correctIndex: 1,
    difficulty: 'moyen',
    points: 20,
    explanation: 'La fusion via les potalas des Kaio Shins donne naissance à Vegetto (Gogeta est la fusion par danse).'
  },
  {
    id: 'db-3',
    manga: 'Dragon Ball',
    question: 'Quel androïde C-17 et C-18 ont-ils réveillé malgré l’interdiction formelle du Dr Gero ?',
    options: ['C-16', 'C-19', 'C-20', 'Cell', 'C-13'],
    correctIndex: 0,
    difficulty: 'difficile',
    points: 30,
    explanation: 'Ils ouvrent le caisson de C-16, un androïde pacifique créé à l’image du fils défunt du Dr Gero.'
  },
  {
    id: 'db-4',
    manga: 'Dragon Ball',
    question: 'Quel voeu exact le roi Piccolo (Daimao) prononce-t-il devant Shenron lors de son assaut sur la Terre ?',
    options: ['L’immortalité absolue', 'Retrouver sa jeunesse d’antan', 'Détruire le roi du monde', 'Ressusciter ses fils démons', 'L’invincibilité'],
    correctIndex: 1,
    difficulty: 'extreme',
    points: 50,
    explanation: 'Piccolo Daimao demande la jeunesse éternelle pour retrouver toute sa force physique avant d’éliminer Shenron.'
  },

  // --- BLEACH ---
  {
    id: 'bl-1',
    manga: 'Bleach',
    question: 'Comment s’appelle le Zanpakuto originel d’Ichigo Kurosaki ?',
    options: ['Senbonzakura', 'Zangetsu', 'Hyorinmaru', 'Kyoka Suigetsu', 'Wabisuke'],
    correctIndex: 1,
    difficulty: 'facile',
    points: 10,
    explanation: 'Zangetsu (Lune Tranchante) est l’esprit du Zanpakuto d’Ichigo.'
  },
  {
    id: 'bl-2',
    manga: 'Bleach',
    question: 'Quel est le pouvoir d’illusion absolue du Zanpakuto de Sosuke Aizen ?',
    options: ['Kageyoshi', 'Kanzen Saimin', 'Mugetsu', 'Getsuga Tensho', 'Bankai Katen Kyokotsu'],
    correctIndex: 1,
    difficulty: 'moyen',
    points: 20,
    explanation: 'Kyoka Suigetsu déclenche l’hypnose totale (Kanzen Saimin) en contrôlant les 5 sens.'
  },
  {
    id: 'bl-3',
    manga: 'Bleach',
    question: 'Quel est le véritable nom de l’Espada numéro 4 dans l’armée d’Aizen au Hueco Mundo ?',
    options: ['Grimmjow Jaegerjaquez', 'Ulquiorra Cifer', 'Tier Harribel', 'Coyote Starrk', 'Barragan Louisenbairn'],
    correctIndex: 1,
    difficulty: 'difficile',
    points: 30,
    explanation: 'Ulquiorra Cifer est la Cuarta Espada, représentant l’aspect de la mort qu’est le Néant.'
  },
  {
    id: 'bl-4',
    manga: 'Bleach',
    question: 'Dans la Division Zéro (Gotei 13), qui a forgé le tout premier Zanpakuto (Asauchi) ?',
    options: ['Ichibe Hyosube', 'Oetsu Nimaiya', 'Kirio Hikifune', 'Tenjiro Kirinji', 'Senjumaru Shutara'],
    correctIndex: 1,
    difficulty: 'extreme',
    points: 50,
    explanation: 'Oetsu Nimaiya est le Dieu de l’Épée et créateur original de tous les Asauchi de la Soul Society.'
  },

  // --- JUJUTSU KAISEN ---
  {
    id: 'jjk-1',
    manga: 'Jujutsu Kaisen',
    question: 'Quel est le nom de l’extension du territoire de Satoru Gojo ?',
    options: ['Autel Démoniaque', 'Sphère de l’Espace Infini', 'Jardin Chimérique', 'Miroir d’Ombre', 'Vide Sacré'],
    correctIndex: 1,
    difficulty: 'facile',
    points: 10,
    explanation: 'L’extension du territoire de Gojo est la Sphère de l’Espace Infini (Muryokusho).'
  },
  {
    id: 'jjk-2',
    manga: 'Jujutsu Kaisen',
    question: 'Combien de doigts de Ryomen Sukuna Yuji Itadori doit-il avaler au total pour le reconstituer ?',
    options: ['10', '15', '20', '25', '12'],
    correctIndex: 2,
    difficulty: 'moyen',
    points: 20,
    explanation: 'Sukuna possédait quatre bras à l’époque Heian, ce qui équivaut à un total de 20 doigts maudits.'
  },
  {
    id: 'jjk-3',
    manga: 'Jujutsu Kaisen',
    question: 'Quel est le nom de l’esprit maudit de classe spéciale vaincu par Yuta Okkotsu dans le film JJK 0 ?',
    options: ['Mahito', 'Hanami', 'Suguru Geto', 'Rika Orimoto', 'Dagon'],
    correctIndex: 3,
    difficulty: 'difficile',
    points: 30,
    explanation: 'Rika Orimoto était l’amie d’enfance de Yuta, devenue la Reine des Fléaux par la malédiction de Yuta.'
  },
  {
    id: 'jjk-4',
    manga: 'Jujutsu Kaisen',
    question: 'Quelle est la condition restrictive fondamentale de la technique maudite "Ratio" de Kento Nanami ?',
    options: ['Diviser la cible selon un ratio 7:3', 'Frapper à un angle de 45 degrés', 'Utiliser uniquement 10 secondes d’énergie', 'Viser les points vitaux du coeur', 'Frapper avec 100% de Black Flash'],
    correctIndex: 0,
    difficulty: 'extreme',
    points: 50,
    explanation: 'Nanami divise n’importe quelle cible ou ligne en dix segments et crée un point faible critique au ratio 7:3.'
  },

  // --- ATTACK ON TITAN (SHINGEKI NO KYOJIN) ---
  {
    id: 'aot-1',
    manga: 'L’Attaque des Titans',
    question: 'Quel titan primordial Eren Jaeger hérite-t-il au début de l’histoire de son père Grisha ?',
    options: ['Titan Cuirassé', 'Titan Assaillant', 'Titan Colossal', 'Titan Féminin', 'Titan Bestial'],
    correctIndex: 1,
    difficulty: 'facile',
    points: 10,
    explanation: 'Eren a hérité du Titan Assaillant (Shingeki no Kyojin) ainsi que du Titan Originel.'
  },
  {
    id: 'aot-2',
    manga: 'L’Attaque des Titans',
    question: 'Quel est le secret de la transmission des pouvoirs des 9 Titans primordiaux ?',
    options: ['La malédiction d’Ymir (13 ans)', 'La pierre de sang', 'L’injection de venin de titan', 'La nuit de pleine lune', 'La perte d’un bras'],
    correctIndex: 0,
    difficulty: 'moyen',
    points: 20,
    explanation: 'La malédiction d’Ymir limite l’espérance de vie d’un détenteur de titan primordial à exactement 13 ans.'
  },
  {
    id: 'aot-3',
    manga: 'L’Attaque des Titans',
    question: 'Quelle escouade d’élite du Bataillon d’exploration a été entièrement éliminée par le Titan Féminin dans la forêt ?',
    options: ['L’escouade Hansi', 'L’escouade Livaï originelle', 'L’escouade Mike', 'L’escouade Erwin', 'La 104ème brigade'],
    correctIndex: 1,
    difficulty: 'difficile',
    points: 30,
    explanation: 'Petra, Eld, Oruo et Gunther de l’escouade spéciale de Livaï ont tous péri face à Annie Leonhart.'
  },
  {
    id: 'aot-4',
    manga: 'L’Attaque des Titans',
    question: 'Quel était le véritable nom du titan souriant qui a dévoré Carla Jaeger au district de Shiganshina ?',
    options: ['Dina Fritz', 'Ymir Fritz', 'Lara Tybur', 'Frieda Reiss', 'Alma Reiss'],
    correctIndex: 0,
    difficulty: 'extreme',
    points: 50,
    explanation: 'Le titan souriant était Dina Fritz, première épouse de Grisha Jaeger et descendante de sang royal eldienne.'
  },

  // --- DEMON SLAYER (KIMETSU NO YAIBA) ---
  {
    id: 'ds-1',
    manga: 'Demon Slayer',
    question: 'Quel souffle Tanjirô Kamado apprend-il initialement auprès de Sakonji Urokodaki ?',
    options: ['Souffle du Soleil', 'Souffle de l’Eau', 'Souffle de la Flamme', 'Souffle de la Foudre', 'Souffle du Vent'],
    correctIndex: 1,
    difficulty: 'facile',
    points: 10,
    explanation: 'Tanjirô apprend les 10 formes du Souffle de l’Eau sur le mont Sagiri.'
  },
  {
    id: 'ds-2',
    manga: 'Demon Slayer',
    question: 'Quel est le rang de Muzan Kibutsuji au sein des démons ?',
    options: ['Lune Supérieure 1', 'Proogéniteur et Seigneur de tous les démons', 'Lune Inférieure Suprême', 'Esprit Maudit Royal', 'Roi du Sang'],
    correctIndex: 1,
    difficulty: 'moyen',
    points: 20,
    explanation: 'Muzan Kibutsuji est le tout premier démon et le créateur de tous les autres démons depuis l’ère Heian.'
  },
  {
    id: 'ds-3',
    manga: 'Demon Slayer',
    question: 'Quelle est la particularité unique du sabre Nichirin de Kyojuro Rengoku ?',
    options: ['Lame brisée', 'Lame rouge vif ornée de flammes écarlates', 'Lame souple en fouet', 'Lame dentelée double', 'Lame noire pure'],
    correctIndex: 1,
    difficulty: 'difficile',
    points: 30,
    explanation: 'Le sabre du Pilier de la Flamme arbore une teinte rouge flamboyante et une garde en forme de flamme ardente.'
  },
  {
    id: 'ds-4',
    manga: 'Demon Slayer',
    question: 'Quel est le nom du breuvage ou de la fleur légendaire que Muzan a cherché pendant plus de mille ans ?',
    options: ['La Fleur de Glycine Pourpre', 'Le Lys Araignée Bleue', 'L’Élixir de Sang Éternel', 'La Rose Noire Solaire', 'L’Herbe Céleste'],
    correctIndex: 1,
    difficulty: 'extreme',
    points: 50,
    explanation: 'Muzan cherchait le Lys Araignée Bleue (Aoi Higanbana) pour surmonter sa seule faiblesse fatale : la lumière du soleil.'
  },

  // --- HUNTER X HUNTER ---
  {
    id: 'hxh-1',
    manga: 'Hunter x Hunter',
    question: 'À quelle catégorie de Nen appartient Gon Freecss ?',
    options: ['Transmutation', 'Renforcement', 'Matérialisation', 'Émission', 'Spécialisation'],
    correctIndex: 1,
    difficulty: 'facile',
    points: 10,
    explanation: 'Gon est un utilisateur du Nen de Renforcement (Jajanken Rock).'
  },
  {
    id: 'hxh-2',
    manga: 'Hunter x Hunter',
    question: 'Quelle condition drastique Kurapika s’impose-t-il pour utiliser sa chaîne du Jugement ?',
    options: ['Ne combattre que la nuit', 'Ne l’utiliser que contre la Brigade Fantôme sous peine de mort', 'Donner 1 an de sa vie par coup', 'Fermer les yeux pendant l’attaque', 'Ne jamais utiliser son Nen'],
    correctIndex: 1,
    difficulty: 'moyen',
    points: 20,
    explanation: 'Sa règle avec le Serment de Nen lui transperce le coeur s’il utilise la chaîne contre un non-membre de la Brigade.'
  },
  {
    id: 'hxh-3',
    manga: 'Hunter x Hunter',
    question: 'Comment s’appelle le jeu de plateau traditionnel auquel Meruem et Komugi jouent sans relâche ?',
    options: ['Gungi', 'Shogi', 'Go', 'Hanafuda', 'Mahjong'],
    correctIndex: 0,
    difficulty: 'difficile',
    points: 30,
    explanation: 'Le Gungi est un jeu tactique à trois dimensions créé dans la république de Rokario.'
  },
  {
    id: 'hxh-4',
    manga: 'Hunter x Hunter',
    question: 'Quel est le nom de la terrible bombe miniature utilisée par le président Netero contre Meruem ?',
    options: ['La Rose du Pauvre (Miniature Rose)', 'L’Atome Funeste', 'Le Lotus Pourpre', 'Le Rayon Zéro de Guanyin', 'La Rupture Stellaire'],
    correctIndex: 0,
    difficulty: 'extreme',
    points: 50,
    explanation: 'La Rose Miniature (Poor Man’s Rose) est une arme de destruction massive à faible coût dotée d’un poison radioactif mortel.'
  },

  // --- SOLO LEVELING ---
  {
    id: 'sl-1',
    manga: 'Solo Leveling',
    question: 'Quel était le surnom de Sung Jinwoo avant son éveil au Double Donjon ?',
    options: ['Le Monarque Noir', 'Le Plus Faible des Chasseurs de Rang E', 'L’Ombre Déchue', 'Le Chasseur Solitaire', 'Le Survivant'],
    correctIndex: 1,
    difficulty: 'facile',
    points: 10,
    explanation: 'Il était moqué comme le plus faible des chasseurs de toute l’humanité.'
  },
  {
    id: 'sl-2',
    manga: 'Solo Leveling',
    question: 'Quel est le mot d’ordre magique que prononce Sung Jinwoo pour extraire les ombres de ses ennemis ?',
    options: ['Debout ! (Arise)', 'Réveillez-vous !', 'Obéissez !', 'Résurrection !', 'À genoux !'],
    correctIndex: 0,
    difficulty: 'moyen',
    points: 20,
    explanation: 'Le commandement légendaire de Jinwoo est « Arise » (« Debout »).'
  },
  {
    id: 'sl-3',
    manga: 'Solo Leveling',
    question: 'Quel soldat de l’ombre chevalier en armure rouge devient le fidèle commandant de Jinwoo ?',
    options: ['Iron', 'Igris', 'Tank', 'Beru', 'Bellion'],
    correctIndex: 1,
    difficulty: 'difficile',
    points: 30,
    explanation: 'Le Chevalier Sanglant Igris est vaincu par Jinwoo dans la salle du trône du changement de classe.'
  },
  {
    id: 'sl-4',
    manga: 'Solo Leveling',
    question: 'Qui était le tout premier Monarque des Ombres dont Jinwoo a hérité le coeur ténébreux ?',
    options: ['Ashborn', 'Antares', 'Baran', 'Yogumunt', 'Sillad'],
    correctIndex: 0,
    difficulty: 'extreme',
    points: 50,
    explanation: 'Ashborn, le plus grand éclat de lumière devenu Monarque des Ombres, a choisi Jinwoo comme successeur.'
  }
];

// Helper to filter or pick questions ensuring balanced 20 questions
export function getQuizQuestions(count: number = 20, mangaFilter?: string): QuizQuestion[] {
  let pool = [...ANIME_QUESTIONS];
  if (mangaFilter && mangaFilter !== 'Tous') {
    const filtered = pool.filter(q => q.manga.toLowerCase() === mangaFilter.toLowerCase());
    if (filtered.length >= 5) {
      pool = filtered;
    }
  }
  
  // Shuffle array
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Guild War question generator: 10 questions from Manga 1 + 10 questions from Manga 2
export function getGuildWarQuestions(manga1: string, manga2: string): QuizQuestion[] {
  const pool1 = ANIME_QUESTIONS.filter(q => q.manga.toLowerCase().includes(manga1.toLowerCase()) || manga1.toLowerCase().includes(q.manga.toLowerCase()));
  const pool2 = ANIME_QUESTIONS.filter(q => q.manga.toLowerCase().includes(manga2.toLowerCase()) || manga2.toLowerCase().includes(q.manga.toLowerCase()));

  const selected1 = (pool1.length >= 10 ? pool1 : ANIME_QUESTIONS.slice(0, 10)).sort(() => Math.random() - 0.5).slice(0, 10);
  const selected2 = (pool2.length >= 10 ? pool2 : ANIME_QUESTIONS.slice(10, 20)).sort(() => Math.random() - 0.5).slice(0, 10);

  return [...selected1, ...selected2].sort(() => Math.random() - 0.5);
}
