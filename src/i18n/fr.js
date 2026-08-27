/**
 * Français.
 *
 * Traduit, non relu par un locuteur natif — voir `language.machineWarning`.
 * En cas de divergence entre ce texte et l'original anglais, c'est l'anglais
 * qui fait foi.
 *
 * « Température du thermomètre mouillé » est le terme employé en météorologie
 * francophone. Il est long, et on le garde : c'est celui qu'il faut connaître
 * pour chercher plus loin.
 */

export const fr = {
  units: {
    celsius: '°C',
    percent: '%',
  },

  meta: {
    title: 'wetbulb — la température qui décide si vous pouvez vous refroidir',
    description:
      'La température de l’air ne dit pas si la chaleur est dangereuse. Celle du thermomètre ' +
      'mouillé, si. Voyez où vous en êtes, si un ventilateur aide, et quelle heure d’aujourd’hui ' +
      'est réellement la pire. Fonctionne hors ligne ; récupère la météo réelle si vous le demandez.',
  },

  masthead: {
    lede: 'La chaleur tue plus que n’importe quel autre phénomène météorologique — et le chiffre affiché dans chaque alerte est le mauvais.',
    blurbBefore: 'La température de l’air ne dit presque rien sur la capacité d’un corps à évacuer sa chaleur.',
    blurbTerm: 'La température du thermomètre mouillé',
    blurbAfter:
      'en décide. À 45 °C dans l’air sec du désert, une personne en bonne santé transpire et ' +
      'survit. À 35 °C dans l’air humide, elle ne le peut pas : la sueur n’a nulle part où s’évaporer.',
    whatLabel: 'ce que c’est',
    what:
      'Un calculateur et une série de décisions, pas un service d’alerte. Donnez-lui deux ' +
      'nombres, ou laissez-le récupérer la météo horaire d’un lieu — les curseurs fonctionnent ' +
      'dans les deux cas.',
    privacyBefore: 'Pas de compte, pas de pistage. Fonctionne sans aucun réseau — et si vous demandez la météo réelle, il n’envoie que vos coordonnées à',
    privacyAfter: '.',
  },

  language: {
    label: 'Langue',
    machineWarningTitle: 'Cette traduction n’a pas été relue par un locuteur natif',
    machineWarning:
      'Elle a été produite par le système qui a écrit l’outil. Là où une phrase d’ici et la ' +
      'version anglaise divergent, c’est l’anglaise qui est juste. Si quelque chose sonne faux — ' +
      'surtout une consigne — merci d’ouvrir un ticket.',
    original: 'Lire l’original en anglais',
  },

  where: {
    heading: 'La météo réelle, si vous voulez',
    sub:
      'Tout ce qui suit fonctionne avec les deux curseurs seuls. Récupérer les données horaires ' +
      'ajoute trois choses que les curseurs ne peuvent pas savoir : quelle heure d’aujourd’hui ' +
      'est vraiment la pire, combien de nuits d’affilée n’ont donné aucun répit, et si cette ' +
      'chaleur vous est nouvelle.',
    searchLabel: 'Chercher un lieu',
    searchPlaceholder: 'Cologne, Delhi, Phoenix…',
    lookUp: 'Chercher',
    useLocation: 'Utiliser ma position',
    lookingUp: 'Recherche du lieu…',
    fetching: 'Récupération de la météo horaire pour {place}…',
    askingLocation: 'Demande de votre position au navigateur…',
    sent: 'Coordonnées envoyées : {latitude}, {longitude}. Rien d’autre n’a quitté ce navigateur.',
  },

  errors: {
    offline: 'Pas de connexion. Les curseurs fonctionnent toujours — cet outil n’a jamais eu besoin du réseau.',
    timeout: 'Le service météo n’a pas répondu à temps. Réessayez, ou utilisez les curseurs.',
    denied: 'Autorisation de localisation refusée. Cherchez plutôt un lieu, ou réglez les curseurs.',
    unsupported: 'Ce navigateur ne partage pas de position. Cherchez plutôt un lieu.',
    notFound: 'Aucun lieu de ce nom. Essayez une ville plus grande à proximité.',
    server: 'Le service météo a renvoyé une erreur. Rien que vous puissiez corriger — réessayez plus tard.',
    malformed: 'Le service météo a répondu quelque chose que cette application ne sait pas lire.',
    generic: 'Un problème est survenu lors de la récupération de la météo.',
  },

  findings: {
    sourceHourly: 'prévision horaire',
    sourceDaily: 'minimales quotidiennes',
    sourcePast: '7 derniers jours',

    peakOffsetTitle: {
      _count: 'hours',
      one: 'La pire heure arrive {hours} heure {direction} que la plus chaude',
      many: 'La pire heure arrive {hours} heures {direction} que la plus chaude',
      other: 'La pire heure arrive {hours} heures {direction} que la plus chaude',
    },
    peakEarlier: 'plus tôt',
    peakLater: 'plus tard',
    peakOffsetDetail:
      'Le thermomètre culmine à {hottestHour} avec {hottestTemp} °C. Mais l’air est le plus dur ' +
      'pour un corps à {worstHour}, quand il fait {worstTemp} °C — {difference} °C de moins et ' +
      '{worstHumidity} % d’humidité. Thermomètre mouillé {worstWet} contre {hottestWet}.',
    peakSameTitle: 'Aujourd’hui les pics coïncident',
    peakSameDetail:
      'Aujourd’hui l’heure la plus chaude et la plus dangereuse tombent toutes deux à {hour}. ' +
      'C’est l’exception, pas la règle.',

    nightsTitle: {
      _count: 'current',
      one: '{current} nuit sans répit',
      many: '{current} nuits sans répit',
      other: '{current} nuits sans répit',
    },
    nightsMore: {
      _count: 'ahead',
      one: ', et {ahead} autre à venir',
      many: ', et {ahead} autres à venir',
      other: ', et {ahead} autres à venir',
    },
    nightsDetail:
      'La nuit est le moment où un corps évacue la chaleur accumulée dans la journée. Au-dessus ' +
      'de {threshold} °C il cesse de le faire. Les dégâts d’une canicule s’accumulent au ' +
      'troisième et au quatrième jour, et cette série dure {total}.',
    nightsRun: {
      _count: 'total',
      one: '{total} nuit',
      many: '{total} nuits',
      other: '{total} nuits',
    },
    nightsCoolTitle: 'Les nuits refroidissent encore',
    nightsCoolDetail:
      'Chaque nuit de cette période descend sous {threshold} °C, le corps a donc sa chance de ' +
      'récupérer. C’est la plus grande différence entre une semaine pénible et une semaine ' +
      'dangereuse.',

    acclimatisedTitle: 'Votre corps connaît déjà cette chaleur',
    acclimatisedDetail:
      'Aujourd’hui atteint {today} °C et la semaine dernière montait déjà à {recent} °C. Les ' +
      'personnes acclimatées transpirent plus tôt et perdent moins de sel en le faisant.',
    unacclimatisedTitle: 'Il fait {difference} °C de plus que tout ce qu’a connu la semaine dernière',
    unacclimatisedDetail:
      'Aujourd’hui atteint {today} °C ; le jour le plus chaud des {days} derniers jours était à ' +
      '{recent} °C. L’acclimatation demande une à deux semaines, c’est pourquoi la première ' +
      'canicule d’un été est régulièrement la plus dangereuse — à des températures que les ' +
      'mêmes personnes ignoreront en août.',
  },

  chart: {
    heading: 'Ce que cet air vous fait',
    sub: 'Faites glisser le point, ou utilisez les champs. Chaque ligne vient de la même physique que les chiffres à côté.',
    tempLabel: 'Température de l’air',
    humidityLabel: 'Humidité relative',
    presetsLabel: 'Ou essayez-en un vrai',
    axisTemp: 'température de l’air °C',
    axisHumidity: 'humidité relative %',
    legendMeasured: '{value}° mesuré',
    legendTheoretical: '{value}° théorique',
    legendYours: 'le vôtre',
    legendNoFan: 'sans ventilateur',
    legendIsopleth: 'thermomètre mouillé',
    ariaLabel:
      'Diagramme d’état de l’air. Votre point : {temp} degrés à {humidity} pour cent ' +
      'd’humidité, thermomètre mouillé {wetBulb} degrés.',
    youLabel: 'vous',
    pointTitle: '{temp} °C à {humidity} % — thermomètre mouillé {wetBulb} °C',
  },

  readout: {
    wetBulb: 'Température du thermomètre mouillé',
    threshold: 'Votre seuil',
    margin: 'Marge',
    fan: 'Un ventilateur ici',
    heatIndex: 'Indice de chaleur',
    dewPoint: 'Point de rosée',
    sourceStull: 'Stull 2011',
    sourceReference: 'référence',
    sourceShifted: '−{shift} décalé',
    sourceMargin: 'seuil − thermomètre mouillé',
    sourceBalance: 'bilan thermique',
    sourceNWS: 'NWS',
    sourceMagnus: 'Magnus',
    marginLeft: '{value} °C de marge',
    marginPast: '{value} °C au-delà',
    fanHelps: 'aide',
    fanMarginal: 'à peine',
    fanHarmful: 'aggrave les choses',
    accuracyGood: 'dans la plage ajustée par Stull (erreur < ~1 °C)',
    accuracyPoor: 'sous 5 % d’humidité l’ajustement dérive ; à ne prendre qu’à titre indicatif',
    accuracyEdge: 'hors de la plage ajustée — la valeur est une extrapolation',
  },

  bands: {
    safe: 'Confortable',
    safeHeadline: 'Votre corps a largement de la marge ici.',
    watch: 'À surveiller',
    watchHeadline: 'Gérable, mais c’est la journée autour de laquelle il faut s’organiser.',
    strain: 'Contrainte réelle',
    strainHeadline: 'Votre corps travaille pour rester frais et perd du terrain lentement.',
    danger: 'Dangereux',
    dangerHeadline: 'C’est dans ces conditions que surviennent les pathologies de la chaleur.',
    critical: 'Au-delà de la limite',
    criticalHeadline: 'Dans cet air, un corps ne peut plus évacuer sa chaleur. Sortez de là.',
  },

  who: {
    heading: 'Qui se trouve dans cet air',
    sub:
      'Les limites publiées décrivent des personnes jeunes, en bonne santé, acclimatées et au ' +
      'repos — qui ne sont pas celles qui meurent pendant les canicules. Chacun de ces facteurs ' +
      'déplace le seuil d’un nombre de degrés indiqué.',
    groupBody: 'Pour qui c’est',
    groupHealth: 'Santé',
    groupMedication: 'Médicaments',
    groupSituation: 'En ce moment',
    noneSelectedBefore: 'Rien de sélectionné — les chiffres ci-dessus décrivent un',
    noneSelectedTerm: 'adulte jeune, en bonne santé, acclimaté, assis immobile à l’ombre',
    noneSelectedAfter: '. C’est sur eux que les limites publiées ont été mesurées.',
    selected: {
      _count: 'count',
      one:
        '{count} facteur sélectionné. Le seuil descend de {shift} °C de thermomètre mouillé, à ' +
        '{threshold} °C. Chaque facteur supplémentaire compterait moins que le précédent : ' +
        'trois facteurs de risque ne rendent personne trois fois plus fragile.',
      many:
        '{count} facteurs sélectionnés. Le seuil descend de {shift} °C de thermomètre mouillé, ' +
        'à {threshold} °C. Chaque facteur supplémentaire compte moins que le précédent : trois ' +
        'facteurs de risque ne rendent personne trois fois plus fragile.',
      other:
        '{count} facteurs sélectionnés. Le seuil descend de {shift} °C de thermomètre mouillé, ' +
        'à {threshold} °C. Chaque facteur supplémentaire compte moins que le précédent : trois ' +
        'facteurs de risque ne rendent personne trois fois plus fragile.',
    },
  },

  factors: {
    age65: 'Plus de 65 ans',
    age65Why: 'la production de sueur diminue avec l’âge et le signal de soif s’affaiblit, si bien que le refroidissement et l’envie de boire arrivent tous deux trop tard',
    age75: 'Plus de 75 ans',
    age75Why: 'les mêmes effets, plus avancés — la plupart des décès de canicule sont dans ce groupe, à l’intérieur, seuls',
    infant: 'Nourrisson ou jeune enfant',
    infantWhy: 'une grande surface pour leur masse, une réponse sudorale immature, et aucun moyen de quitter la pièce ou de demander à boire',
    pregnant: 'Enceinte',
    pregnantWhy: 'production de chaleur métabolique de base plus élevée et besoins accrus en volume sanguin',
    unacclimatised: 'Premiers jours de chaleur de l’année',
    unacclimatisedWhy: 'l’acclimatation demande une à deux semaines — la première canicule d’un été est régulièrement la plus dangereuse, à des températures qui ne feront plus réagir personne ensuite',
    cardiovascular: 'Maladie cardiaque ou circulatoire',
    cardiovascularWhy: 'se refroidir signifie pomper du sang vers la peau, un travail pour lequel le cœur peut ne pas avoir de réserve',
    respiratory: 'Maladie pulmonaire',
    respiratoryWhy: 'la chaleur et l’ozone qui l’accompagne augmentent tous deux la charge respiratoire',
    diabetes: 'Diabète',
    diabetesWhy: 'peut émousser à la fois la transpiration et la perception de la contrainte thermique',
    kidney: 'Maladie rénale',
    kidneyWhy: 'l’équilibre hydrique a moins de marge pour absorber les pertes dues à la sueur',
    anticholinergic: 'Anticholinergiques',
    anticholinergicWhy: 'ils suppriment directement la transpiration — le plus fort effet médicamenteux ici. Beaucoup d’antihistaminiques, certains antidépresseurs et traitements de la vessie',
    diuretic: 'Diurétiques',
    diureticWhy: 'moins de liquide circulant à perdre avant que la transpiration ne flanche',
    betablocker: 'Bêtabloquants',
    betablockerWhy: 'ils plafonnent la hausse de fréquence cardiaque dont dépend l’irrigation de la peau',
    antipsychotic: 'Antipsychotiques',
    antipsychoticWhy: 'peuvent perturber la régulation thermique du cerveau lui-même',
    stimulant: 'Stimulants',
    stimulantWhy: 'augmentent la production de chaleur tout en masquant l’épuisement qui vous ferait arrêter',
    alcohol: 'Consommation d’alcool',
    alcoholWhy: 'déshydrate, et supprime le jugement qui dirait stop',
    exertion: 'Travail physique ou sport',
    exertionWhy: 'un muscle au travail peut produire dix fois la chaleur du repos — toutes les limites de survie publiées supposent quelqu’un assis immobile',
    noAircon: 'Pas de climatisation disponible',
    noAirconWhy: 'aucun recours si les mesures passives ne suffisent pas',
    alone: 'Seul, personne ne vient voir',
    aloneWhy: 'le coup de chaleur retire précisément le jugement nécessaire pour le reconnaître — que quelqu’un d’autre le remarque est souvent le véritable dispositif de sécurité',
  },

  actions: {
    heading: 'Que faire, dans l’ordre',
    sub: 'Classé selon ce que chaque mesure vaut dans ces conditions. La première ligne est celle qui compte le plus.',

    leaveTitle: 'Mettez-vous au frais, maintenant',
    leaveDetail:
      'Ni de l’ombre ni un ventilateur : de l’air vraiment plus frais. Un bâtiment public, ' +
      'un centre commercial, une cave, une voiture climatisée. Dans cet air, rester et tenir ' +
      'n’est pas une option.',
    fanOffTitle: 'Éteignez le ventilateur',
    fanOffDetail:
      '{reason}. Mouillez plutôt votre peau : un linge humide ou un brumisateur fait ' +
      'l’évaporation que votre sueur n’arrive plus à assurer.',
    fanOnTitle: 'Ici, le ventilateur aide',
    fanOnDetail:
      'Dirigez-le vers vous, pas vers la pièce : la fraîcheur vient de l’air qui passe sur ' +
      'la peau. Le conseil habituel dit d’éteindre les ventilateurs au-dessus de 35 °C ; dans un ' +
      'air aussi humide, ce conseil est exactement à l’envers.',
    wetSkinTitle: 'Mouillez votre peau',
    wetSkinDetail:
      'Un linge humide sur la nuque, les avant-bras et le visage, ou un brumisateur. Cela ' +
      'fonctionne quand plus rien d’autre ne fonctionne, parce que cela ajoute l’évaporation pour ' +
      'laquelle votre corps n’a plus de sueur. C’est aussi le moins cher de cette liste.',
    shadeTitle: 'Ombragez les fenêtres par l’extérieur',
    shadeDetail:
      'Volets extérieurs, stores, même un drap accroché dehors arrêtent environ cinq fois plus de ' +
      'chaleur qu’un store intérieur. Une fois la lumière passée à travers la vitre, la chaleur ' +
      'est déjà dans la pièce et les rideaux ne font que la cacher.',
    stopWorkTitle: 'Arrêtez le travail physique',
    stopWorkDetail:
      'Toutes les limites de survie publiées supposent quelqu’un assis immobile. Un muscle au ' +
      'travail produit jusqu’à dix fois la chaleur du repos, et c’est la seule variable ici que ' +
      'vous contrôlez entièrement.',
    checkInTitle: 'Faites en sorte que quelqu’un prenne de vos nouvelles',
    checkInDetail:
      'Le coup de chaleur retire précisément le jugement qu’il faudrait pour le reconnaître. Un ' +
      'appel à heure fixe protège mieux que toute intention de vous surveiller vous-même.',
    drinkTitle: 'Buvez à heures fixes, pas selon la soif',
    drinkDetail:
      'La soif est un signal peu fiable dans ce groupe, et quand elle arrive le déficit est déjà ' +
      'là. Un verre toutes les heures, que vous en ayez envie ou non.',
    pharmacistTitle: 'Parlez de vos médicaments et de la chaleur à votre pharmacien',
    pharmacistDetail:
      'Certains médicaments suppriment complètement la transpiration. N’arrêtez aucun ' +
      'traitement de votre propre initiative, mais un pharmacien vous dira en deux minutes ' +
      'si le vôtre figure sur cette liste, et cela change la prudence qu’il faut aujourd’hui.',
    ventilateTitle: 'N’ouvrez que lorsqu’il fait plus frais dehors que dedans',
    ventilateDetail:
      'La règle que presque tout le monde applique à l’envers. Une fenêtre ouverte l’après-midi ' +
      'est une source de chaleur. Tout fermé la journée, grand ouvert dès que la température ' +
      'extérieure passe sous celle de l’intérieur, en général en fin de soirée.',
    emergencyTitle: 'Connaissez le signe qui change tout',
    emergencyDetail:
      'Confusion, agitation, ou quelqu’un qui a cessé de transpirer par une telle chaleur : c’est ' +
      'une urgence médicale, pas un mauvais après-midi. Appelez les secours, puis refroidissez la ' +
      'personne à l’eau en attendant.',

    fanReasonHelps: 'l’air en mouvement emporte bien plus de sueur qu’il n’apporte de chaleur — ici le ventilateur fait un vrai travail',
    fanReasonMarginal: 'le ventilateur aide encore, mais à peine ; il est proche du point où la chaleur qu’il souffle sur vous annule l’évaporation qu’il permet',
    fanReasonHarmful: 'l’air est plus chaud que votre peau et votre transpiration est déjà à sa limite, un air plus rapide ne fait donc que vous apporter de la chaleur — un ventilateur aggrave cela',
  },

  day: {
    heading: 'La journée, heure par heure',
    subModelled:
      'Deux questions sur un même axe de temps : quand cet air est au pire, et quand ouvrir une ' +
      'fenêtre cesse d’importer de la chaleur. Sans prévision récupérée, les deux courbes sont un ' +
      'modèle construit à partir d’un maximum et d’un minimum, d’où les pointillés.',
    subMeasured:
      'Valeurs horaires mesurées pour ce lieu. Le grand repère est l’heure la plus dangereuse, le ' +
      'petit la plus chaude — ce sont rarement la même heure, et cet écart est la raison d’être ' +
      'de cet outil.',
    lowLabel: 'Minimale du jour',
    highLabel: 'Maximale du jour',
    buildingLabel: 'Votre bâtiment',
    axisHour: 'heure du jour',
    axisWetBulb: 'thermomètre mouillé °C',
    axisCelsius: '°C',
    thresholdLabel: 'votre seuil {value}°',
    nightsCaption: 'les nuits sous {threshold} °C donnent une chance au corps',
    today: 'aujourd’hui',
    markHottest: 'Heure la plus chaude : {hour}, {temp} °C',
    markWorst: 'Heure la plus dangereuse : {hour}, thermomètre mouillé {wetBulb} °C',
    aria: 'Température du thermomètre mouillé au fil de la journée. Heure la plus chaude {hottest}, heure la plus dangereuse {worst}.',
    nightTooltip: '{date} : minimale {low}',
    nightTooltipHot: '{date} : minimale {low} — aucun répit',
    unknown: 'inconnue',
    nightsAria: {
      _count: 'count',
      one: '{count} nuit sans répit sur cette période.',
      many: '{count} nuits consécutives sans répit sur cette période.',
      other: '{count} nuits consécutives sans répit sur cette période.',
    },
    notEnough: 'données insuffisantes',
    legendOutdoors: 'extérieur (modélisé)',
    legendIndoors: 'intérieur (modélisé)',
    legendWindow: 'vaut la peine d’ouvrir',
    legendWetBulb: 'thermomètre mouillé (mesuré)',
    legendThreshold: 'votre seuil',
    legendPast: 'au-delà de votre seuil',
    windowSummary:
      'Ouvrez tout à partir de {opens} et refermez avant {closes}. L’air le plus froid arrive ' +
      'vers {best}, {gain} °C sous la température de la pièce.',
    windowNone:
      'L’air extérieur ne descend jamais assez sous celui de la pièce aujourd’hui. Aucune bonne ' +
      'heure pour aérer — gardez tout fermé et ombragé, et refroidissez-vous vous-même.',
    windowInsufficient: 'Données horaires insuffisantes pour juger de l’aération.',
  },

  buildings: {
    heavy: 'Maçonnerie massive, murs épais',
    heavyNote: 'reste frais pendant des jours, puis reste chaud pendant des jours une fois traversé par la chaleur',
    medium: 'Appartement ou maison ordinaire',
    mediumNote: 'suit la journée avec environ la moitié de l’amplitude, trois heures plus tard',
    light: 'Dernier étage, ou chambre sous les toits',
    lightNote: 'le toit rayonne dans la pièce toute la soirée — le type de logement le plus dangereux',
    glazed: 'Grandes fenêtres exposées au soleil',
    glazedNote: 'le verre laisse entrer le soleil en ondes courtes et piège la chaleur en ondes longues qu’il devient',
  },

  globe: {
    heading: 'Où vit la chaleur',
    sub:
      'Pas la météo du jour — la forme du problème. Chaque cellule est la température du ' +
      'thermomètre mouillé qu’un lieu atteint lors d’une saison chaude normale, d’après trois ans ' +
      'de réanalyse. Faites glisser pour tourner, la molette pour zoomer. Cherchez un lieu ' +
      'ci-dessus et le globe s’y rend.',
    ariaLabel: 'Un globe montrant où la température du thermomètre mouillé est structurellement élevée',
    note: '{cells} cellules terrestres à {step}°, {percentile}e centile du thermomètre mouillé, {from}–{to}.',
    noWebGL:
      'Ce navigateur ne peut pas dessiner le globe (WebGL indisponible). Tout le reste de la page ' +
      'fonctionne sans lui.',
    band1: '< 22°',
    band1Note: 'aucune contrainte de chaleur',
    band2: '22–25°',
    band2Note: 'perceptible en été',
    band3: '25–27°',
    band3Note: 'travailler devient difficile',
    band4: '27–29°',
    band4Note: 'dangereux pour les personnes vulnérables',
    band5: '29–31°',
    band5Note: 'proche de la limite mesurée',
    band6: '≥ 31°',
    band6Note: 'au-delà, lors d’une saison chaude normale',
    bandEmpty: '{note} — aucune cellule ici',
    factHotCellsTitle: {
      _count: 'count',
      one: '{count} cellule terrestre sur {total} dépasse 26 °C',
      many: '{count} cellules terrestres sur {total} dépassent 26 °C',
      other: '{count} cellules terrestres sur {total} dépassent 26 °C',
    },
    factHotCellsDetail:
      'et elles ne sont pas dispersées : le delta du Gange, le Pendjab, la plaine de Chine du ' +
      'Nord, le Golfe. Environ un cinquième de l’humanité vit dans cette poignée de cellules, et ' +
      'c’est toute la raison de dessiner cette carte.',
    factCeilingTitle: 'Rien ici n’atteint {limit} °C — et ce n’est pas rassurant',
    factCeilingDetail:
      'Il s’agit du 95e centile sur toute une saison chaude : cela décrit le temps qu’un lieu ' +
      'connaît la plupart des étés, pas sa pire heure. Des heures isolées montent bien plus haut : ' +
      '35 °C de thermomètre mouillé ont été relevés sur la côte du golfe Persique. Une cellule à ' +
      '28 °C passe de vraies heures bien au-delà de 31.',
    factHottestTitle: 'Cellule la plus chaude : {value} °C à {latitude}° {ns}, {longitude}° {ew}',
    factHottestDetail:
      'Chaque cellule fait {step}° — environ 650 km — elle moyenne donc une côte avec un plateau ' +
      'et une ville avec un champ. Les lieux réels à l’intérieur s’en écartent dans les deux sens.',
    north: 'N',
    south: 'S',
    east: 'E',
    west: 'O',
  },

  measures: {
    heading: 'Ce qui refroidit vraiment une pièce',
    sub:
      'La plupart des conseils sur la chaleur forment une liste plate où « fermez les rideaux » ' +
      'côtoie « ombragez la fenêtre depuis l’extérieur », comme s’ils étaient comparables. Ils ' +
      'diffèrent d’un facteur cinq environ.',
    worth: 'vaut {value}×',
    externalShade: 'Ombragez la vitre depuis l’extérieur',
    externalShadeDetail:
      'Volets, stores, un parasol, un drap fixé dehors — tout ce qui arrête la lumière avant ' +
      'qu’elle traverse le verre. Environ cinq fois l’effet du même tissu suspendu à l’intérieur.',
    nightVent: 'Chassez la chaleur pendant la nuit',
    nightVentDetail:
      'Des fenêtres ouvertes ensemble sur des côtés opposés pendant les heures fraîches. La ' +
      'ventilation traversante déplace plusieurs fois l’air d’une seule fenêtre ouverte, et c’est ' +
      'le seul moyen de faire ressortir des murs la chaleur de la veille.',
    internalBlind: 'Fermez rideaux et stores',
    internalBlindDetail:
      'Cela vaut la peine, et c’est bien plus faible qu’il n’y paraît : quand la lumière atteint ' +
      'un rideau intérieur, l’énergie est déjà dans la pièce. Clair et réfléchissant aide un peu.',
    appliances: 'Éteignez tout ce qui chauffe',
    appliancesDetail:
      'Un four, un sèche-linge, un ordinateur fixe et une douzaine de veilleuses, cela fait ' +
      'quelques centaines de watts de chauffage dans une pièce que vous essayez de refroidir. ' +
      'Cuisinez dehors ou froid.',
    oneRoom: 'Renoncez à l’appartement, défendez une pièce',
    oneRoomDetail:
      'Choisissez la pièce la plus fraîche — exposée au nord, au rez-de-chaussée, aux murs lourds — ' +
      'et fermez le reste. Refroidir une pièce est réalisable ; refroidir un appartement, avec ces ' +
      'moyens, non.',
    dampCloth: 'Refroidissez-vous, pas la pièce',
    dampClothDetail:
      'Un linge mouillé sur la nuque et les avant-bras, les pieds dans l’eau fraîche, des ' +
      'vêtements humides. Quand l’air ne peut pas être changé, c’est ce qui reste — et cela ' +
      'fonctionne, car cela ajoute l’évaporation que votre sueur n’assure plus.',
  },

  presets: {
    mild: 'Journée d’été chaude',
    mildNote: 'le genre de journée dont personne ne s’inquiète, et à juste titre',
    europe: 'Canicule européenne',
    europeNote: 'chaud, sec, survivable — et qui remplit tout de même les hôpitaux, à cause de qui s’y trouve',
    gulf: 'Côte du Golfe, humide',
    gulfNote: 'sept degrés de moins que la canicule ci-dessus, et bien plus dangereux',
    desert: 'Désert, absolument sec',
    desertNote: 'le chiffre le plus élevé ici, et pas le pire air de cette liste',
    monsoon: 'Prémousson, Asie du Sud',
    monsoonNote: 'au-delà de la limite mesurée sur de jeunes adultes en bonne santé en chambre climatique',
    indoors: 'Un logement sans ventilation',
    indoorsNote: 'là où surviennent réellement la plupart des décès par chaleur — à l’intérieur, pas au soleil',
  },

  limits: {
    heading: 'Ce que ceci ne peut pas faire',
    doctorLabel: 'pas un médecin',
    doctor:
      'Rien ici n’est un avis médical, et les seuils sont calés sur la physiologie publiée, pas ' +
      'sur vous. Si quelqu’un est confus, agité, ou a cessé de transpirer par la chaleur, c’est ' +
      'une urgence — appelez, ne calculez pas.',
    forecastLabel: 'pas une prévision',
    forecast:
      'Il ne sait pas quel temps il fait tant que vous ne lui demandez pas de regarder. Les ' +
      'alertes canicule officielles savent des choses qu’il ignore, notamment depuis combien de ' +
      'temps la chaleur dure.',
    limitsLabel: 'deux limites, pas une',
    limitsText:
      '35 °C de thermomètre mouillé est la limite théorique. C’est autour de 31 °C que la ' +
      'contrainte a réellement été mesurée sur de jeunes sujets en bonne santé. Ne citer que les ' +
      '35 fait paraître le danger quatre degrés plus loin qu’il ne l’est.',
    shadeLabel: 'à l’ombre, et immobile',
    shade:
      'Chaque chiffre ici suppose l’ombre et le repos. Le soleil direct équivaut à plusieurs ' +
      'degrés ; le travail physique peut multiplier par dix votre production de chaleur.',
  },

  footer: {
    source: 'Code, sources et suite de tests sur GitHub',
    tagline: 'fait pour être vérifié, pas pour être cru',
  },
};
