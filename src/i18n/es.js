/**
 * Español.
 *
 * Traducido, no revisado por un hablante nativo — véase `language.machineWarning`.
 * Cuando este texto y el original en inglés difieran, manda el inglés.
 *
 * «Temperatura de bulbo húmedo» es el término establecido y se mantiene aunque
 * sea largo: es el que aparece en la literatura, y quien busque más información
 * necesita esa palabra exacta.
 */

export const es = {
  units: {
    celsius: '°C',
    percent: '%',
  },

  meta: {
    title: 'wetbulb — la temperatura que decide si puedes enfriarte',
    description:
      'La temperatura del aire no dice si el calor es peligroso. La de bulbo húmedo sí. ' +
      'Descubre dónde estás, si un ventilador ayuda y qué hora de hoy es realmente la peor. ' +
      'Funciona sin conexión; consulta el tiempo real si se lo pides.',
  },

  masthead: {
    lede: 'El calor mata a más personas que cualquier otro fenómeno meteorológico — y la cifra que aparece en cada aviso es la equivocada.',
    blurbBefore: 'La temperatura del aire casi no dice nada sobre si un cuerpo puede disipar calor.',
    blurbTerm: 'La temperatura de bulbo húmedo',
    blurbAfter:
      'sí lo decide. A 45 °C en aire seco del desierto una persona sana suda y sobrevive. ' +
      'A 35 °C en aire húmedo no puede, porque el sudor no tiene adónde evaporarse.',
    whatLabel: 'qué es esto',
    what:
      'Una calculadora y un conjunto de decisiones, no un servicio de avisos. Dale dos ' +
      'números, o deja que consulte el tiempo real por horas de un lugar — los controles ' +
      'funcionan igual en ambos casos.',
    privacyBefore: 'Sin cuenta, sin rastreo. Funciona sin red alguna — y si le pides el tiempo real, solo envía tus coordenadas a',
    privacyAfter: '.',
  },

  language: {
    label: 'Idioma',
    machineWarningTitle: 'Esta traducción no ha sido revisada por un hablante nativo',
    machineWarning:
      'La produjo el mismo sistema que escribió la herramienta. Donde una frase de aquí y la ' +
      'versión inglesa difieran, la correcta es la inglesa. Si algo suena mal — sobre todo una ' +
      'instrucción — abre una incidencia, por favor.',
    original: 'Leer el original en inglés',
  },

  where: {
    heading: 'Tiempo real, si lo quieres',
    sub:
      'Todo lo de abajo funciona solo con los dos controles. Consultar datos por horas añade ' +
      'tres cosas que los controles no pueden saber: qué hora de hoy es realmente la peor, ' +
      'cuántas noches seguidas no han dado alivio y si este calor es nuevo para ti.',
    searchLabel: 'Buscar un lugar',
    searchPlaceholder: 'Colonia, Delhi, Phoenix…',
    lookUp: 'Buscar',
    useLocation: 'Usar mi ubicación',
    lookingUp: 'Buscando el lugar…',
    fetching: 'Consultando el tiempo por horas de {place}…',
    askingLocation: 'Preguntando al navegador dónde estás…',
    sent: 'Coordenadas enviadas: {latitude}, {longitude}. Nada más salió de este navegador.',
  },

  errors: {
    offline: 'Sin conexión. Los controles siguen funcionando — esta herramienta nunca necesitó la red.',
    timeout: 'El servicio meteorológico no respondió a tiempo. Inténtalo otra vez o usa los controles.',
    denied: 'Se denegó el permiso de ubicación. Busca un lugar o ajusta los controles.',
    unsupported: 'Este navegador no comparte la ubicación. Busca un lugar en su lugar.',
    notFound: 'No hay ningún lugar con ese nombre. Prueba con una población mayor cercana.',
    server: 'El servicio meteorológico devolvió un error. No es algo que puedas arreglar — inténtalo más tarde.',
    malformed: 'El servicio meteorológico respondió con algo que esta aplicación no sabe leer.',
    generic: 'Algo falló al consultar el tiempo.',
  },

  findings: {
    sourceHourly: 'previsión horaria',
    sourceDaily: 'mínimas diarias',
    sourcePast: 'últimos 7 días',

    peakOffsetTitle: {
      _count: 'hours',
      one: 'La peor hora llega una hora {direction} que la más calurosa',
      many: 'La peor hora llega {hours} horas {direction} que la más calurosa',
      other: 'La peor hora llega {hours} horas {direction} que la más calurosa',
    },
    peakEarlier: 'antes',
    peakLater: 'después',
    peakOffsetDetail:
      'El termómetro alcanza su máximo a las {hottestHour} con {hottestTemp} °C. Pero el aire ' +
      'es más duro para un cuerpo a las {worstHour}, cuando marca {worstTemp} °C — {difference} °C ' +
      'menos y {worstHumidity} % de humedad. Bulbo húmedo {worstWet} frente a {hottestWet}.',
    peakSameTitle: 'Hoy los máximos coinciden',
    peakSameDetail:
      'Hoy la hora más calurosa y la más peligrosa caen ambas a las {hour}. Es la excepción, ' +
      'no la regla.',

    nightsTitle: {
      _count: 'current',
      one: 'Una noche sin alivio',
      many: '{current} noches sin alivio',
      other: '{current} noches sin alivio',
    },
    nightsMore: {
      _count: 'ahead',
      one: ', y viene una más',
      many: ', y vienen {ahead} más',
      other: ', y vienen {ahead} más',
    },
    nightsDetail:
      'La noche es cuando el cuerpo descarga el calor acumulado durante el día. Por encima de ' +
      '{threshold} °C deja de hacerlo. El daño de una ola de calor se acumula al tercer y ' +
      'cuarto día, y esta racha dura {total}.',
    nightsRun: {
      _count: 'total',
      one: 'una noche',
      many: '{total} noches',
      other: '{total} noches',
    },
    nightsCoolTitle: 'Las noches todavía se enfrían',
    nightsCoolDetail:
      'Todas las noches de este periodo bajan de {threshold} °C, así que el cuerpo tiene su ' +
      'oportunidad de recuperarse. Esa es la mayor diferencia entre una semana incómoda y una ' +
      'peligrosa.',

    acclimatisedTitle: 'Tu cuerpo ya conoce este calor',
    acclimatisedDetail:
      'Hoy se llega a {today} °C y la semana pasada ya alcanzó {recent} °C. Las personas ' +
      'aclimatadas sudan antes y pierden menos sal al hacerlo.',
    unacclimatisedTitle: 'Hace {difference} °C más que cualquier día de la semana pasada',
    unacclimatisedDetail:
      'Hoy se llega a {today} °C; el día más cálido de los últimos {days} días fue de {recent} °C. ' +
      'La aclimatación tarda una o dos semanas, y por eso la primera ola de calor de un verano ' +
      'es sistemáticamente la más peligrosa — con temperaturas que esas mismas personas ' +
      'ignorarán en agosto.',
  },

  chart: {
    heading: 'Qué te hace este aire',
    sub: 'Arrastra el punto o usa los campos. Cada línea sale de la misma física que las cifras de al lado.',
    tempLabel: 'Temperatura del aire',
    humidityLabel: 'Humedad relativa',
    presetsLabel: 'O prueba una real',
    axisTemp: 'temperatura del aire °C',
    axisHumidity: 'humedad relativa %',
    legendMeasured: '{value}° medido',
    legendTheoretical: '{value}° teórico',
    legendYours: 'el tuyo',
    legendNoFan: 'sin ventilador',
    legendIsopleth: 'bulbo húmedo',
    ariaLabel:
      'Diagrama de estado del aire. Tu punto: {temp} grados con {humidity} por ciento de ' +
      'humedad, bulbo húmedo {wetBulb} grados.',
    youLabel: 'tú',
    pointTitle: '{temp} °C con {humidity} % — bulbo húmedo {wetBulb} °C',
  },

  readout: {
    wetBulb: 'Temperatura de bulbo húmedo',
    threshold: 'Tu umbral',
    margin: 'Margen',
    fan: 'Un ventilador aquí',
    heatIndex: 'Índice de calor',
    dewPoint: 'Punto de rocío',
    sourceStull: 'Stull 2011',
    sourceReference: 'referencia',
    sourceShifted: '−{shift} desplazado',
    sourceMargin: 'umbral − bulbo húmedo',
    sourceBalance: 'balance térmico',
    sourceNWS: 'NWS',
    sourceMagnus: 'Magnus',
    marginLeft: '{value} °C de margen',
    marginPast: '{value} °C por encima',
    fanHelps: 'ayuda',
    fanMarginal: 'apenas',
    fanHarmful: 'lo empeora',
    accuracyGood: 'dentro del rango que ajustó Stull (error < ~1 °C)',
    accuracyPoor: 'por debajo del 5 % de humedad el ajuste se desvía; tómalo solo como indicativo',
    accuracyEdge: 'fuera del rango ajustado — el valor es una extrapolación',
  },

  bands: {
    safe: 'Cómodo',
    safeHeadline: 'Tu cuerpo tiene margen de sobra aquí.',
    watch: 'Para vigilar',
    watchHeadline: 'Llevadero, pero es el día en torno al cual conviene organizar el resto.',
    strain: 'Esfuerzo real',
    strainHeadline: 'Tu cuerpo trabaja para mantenerse fresco y va perdiendo terreno poco a poco.',
    danger: 'Peligroso',
    dangerHeadline: 'Con condiciones así aparecen las enfermedades por calor.',
    critical: 'Más allá del límite',
    criticalHeadline: 'A este aire un cuerpo ya no puede cederle calor. Sal de ahí.',
  },

  who: {
    heading: 'Quién está en este aire',
    sub:
      'Los límites publicados describen a personas jóvenes, sanas y aclimatadas en reposo — ' +
      'que no son quienes mueren en las olas de calor. Cada uno de estos factores mueve el ' +
      'umbral un número declarado de grados.',
    groupBody: 'Para quién es esto',
    groupHealth: 'Salud',
    groupMedication: 'Medicación',
    groupSituation: 'Ahora mismo',
    noneSelectedBefore: 'Nada seleccionado — las cifras de arriba describen a un',
    noneSelectedTerm: 'adulto joven, sano y aclimatado sentado a la sombra',
    noneSelectedAfter: '. En ellos se midieron los límites publicados.',
    selected: {
      _count: 'count',
      one:
        'Un factor seleccionado. El umbral baja {shift} °C de bulbo húmedo, hasta ' +
        '{threshold} °C. Cada factor adicional contaría menos que el anterior: tres factores ' +
        'de riesgo no hacen a nadie tres veces más frágil.',
      many:
        '{count} factores seleccionados. El umbral baja {shift} °C de bulbo húmedo, hasta ' +
        '{threshold} °C. Cada factor adicional cuenta menos que el anterior: tres factores de ' +
        'riesgo no hacen a nadie tres veces más frágil.',
      other:
        '{count} factores seleccionados. El umbral baja {shift} °C de bulbo húmedo, hasta ' +
        '{threshold} °C. Cada factor adicional cuenta menos que el anterior: tres factores de ' +
        'riesgo no hacen a nadie tres veces más frágil.',
    },
  },

  factors: {
    age65: 'Más de 65 años',
    age65Why: 'la producción de sudor cae con la edad y la señal de sed se debilita, así que tanto el enfriamiento como el aviso para beber llegan tarde',
    age75: 'Más de 75 años',
    age75Why: 'los mismos efectos, más avanzados — la mayoría de las muertes por calor están en este grupo, en casa, solas',
    infant: 'Bebé o niño pequeño',
    infantWhy: 'mucha superficie para su masa, una respuesta de sudoración inmadura y ninguna forma de salir de la habitación o pedir agua',
    pregnant: 'Embarazada',
    pregnantWhy: 'mayor producción basal de calor metabólico y más demanda de volumen sanguíneo',
    unacclimatised: 'Primeros días de calor del año',
    unacclimatisedWhy: 'la aclimatación tarda una o dos semanas — la primera ola de calor de un verano es sistemáticamente la más peligrosa, con temperaturas que después no preocupan a nadie',
    cardiovascular: 'Enfermedad cardíaca o circulatoria',
    cardiovascularWhy: 'enfriarse significa bombear sangre a la piel, un trabajo para el que el corazón puede no tener reserva',
    respiratory: 'Enfermedad pulmonar',
    respiratoryWhy: 'el calor y el ozono que lo acompaña aumentan ambos la carga respiratoria',
    diabetes: 'Diabetes',
    diabetesWhy: 'puede reducir tanto la sudoración como la percepción del esfuerzo por calor',
    kidney: 'Enfermedad renal',
    kidneyWhy: 'el equilibrio de líquidos tiene menos margen para absorber las pérdidas por sudor',
    anticholinergic: 'Anticolinérgicos',
    anticholinergicWhy: 'suprimen la sudoración directamente — el mayor efecto de un medicamento aquí. Muchos antihistamínicos, algunos antidepresivos y fármacos para la vejiga',
    diuretic: 'Diuréticos',
    diureticWhy: 'menos líquido circulante que perder antes de que falle la sudoración',
    betablocker: 'Betabloqueantes',
    betablockerWhy: 'limitan la subida de frecuencia cardíaca de la que depende el riego de la piel',
    antipsychotic: 'Antipsicóticos',
    antipsychoticWhy: 'pueden interferir con la propia regulación térmica del cerebro',
    stimulant: 'Estimulantes',
    stimulantWhy: 'aumentan la producción de calor mientras enmascaran el agotamiento que te haría parar',
    alcohol: 'Beber alcohol',
    alcoholWhy: 'deshidrata y quita el juicio que diría basta',
    exertion: 'Trabajo físico o ejercicio',
    exertionWhy: 'el músculo en trabajo puede producir diez veces el calor del reposo — todos los límites de supervivencia publicados suponen a alguien sentado sin moverse',
    noAircon: 'Sin aire acondicionado disponible',
    noAirconWhy: 'sin recurso si las medidas pasivas no bastan',
    alone: 'Solo, sin nadie que compruebe',
    aloneWhy: 'el golpe de calor quita justo el juicio necesario para reconocer un golpe de calor — que otra persona se dé cuenta suele ser el verdadero mecanismo de seguridad',
  },

  actions: {
    heading: 'Qué hacer, por orden',
    sub: 'Ordenado por lo que vale cada cosa en estas condiciones. La primera línea es la que más importa.',

    leaveTitle: 'Ve a un aire más fresco ahora',
    leaveDetail:
      'Ni sombra ni ventilador: aire de verdad más fresco. Un edificio público, un centro ' +
      'comercial, un sótano, un coche con aire acondicionado. Con este aire, quedarse y ' +
      'aguantar no es una opción.',
    fanOffTitle: 'Apaga el ventilador',
    fanOffDetail:
      '{reason}. En vez de eso, mójate la piel: un paño húmedo o un pulverizador hacen la ' +
      'evaporación que tu sudor ya no da abasto para hacer.',
    fanOnTitle: 'Aquí un ventilador ayuda',
    fanOnDetail:
      'Apúntalo hacia ti, no hacia la habitación: el frescor viene del aire que corre sobre la ' +
      'piel. El consejo de siempre dice apagar los ventiladores por encima de 35 °C; con aire ' +
      'tan húmedo ese consejo está justo al revés.',
    wetSkinTitle: 'Mójate la piel',
    wetSkinDetail:
      'Un paño húmedo en el cuello, los antebrazos y la cara, o un pulverizador. Esto funciona ' +
      'cuando ya no funciona nada más, porque aporta la evaporación para la que tu cuerpo ya ' +
      'no tiene sudor. Y además es lo más barato de esta lista.',
    shadeTitle: 'Da sombra a las ventanas desde fuera',
    shadeDetail:
      'Contraventanas, toldos, incluso una sábana colgada fuera detienen unas cinco veces más ' +
      'calor que una persiana por dentro. Una vez que la luz atraviesa el cristal el calor ya ' +
      'está en la habitación y las cortinas solo lo ocultan.',
    stopWorkTitle: 'Deja el trabajo físico',
    stopWorkDetail:
      'Todos los límites de supervivencia publicados dan por hecho que la persona está sentada ' +
      'sin moverse. Un músculo que trabaja produce hasta diez veces el calor del reposo, y es ' +
      'lo único de esta página que controlas del todo.',
    checkInTitle: 'Queda con alguien en que te llame',
    checkInDetail:
      'El golpe de calor quita justo el juicio que haría falta para reconocerlo. Una llamada a ' +
      'una hora fija protege más que cualquier propósito de vigilarte tú mismo.',
    drinkTitle: 'Bebe por horario, no por sed',
    drinkDetail:
      'La sed es una señal poco fiable en este grupo, y cuando llega el déficit ya está ahí. Un ' +
      'vaso cada hora, apetezca o no.',
    pharmacistTitle: 'Pregunta en la farmacia por tu medicación y el calor',
    pharmacistDetail:
      'Algunos medicamentos suprimen la sudoración por completo. No dejes ningún tratamiento ' +
      'por tu cuenta, pero en la farmacia te dicen en dos minutos si el tuyo está en esa ' +
      'lista, y de eso depende cuánto cuidado hace falta hoy.',
    ventilateTitle: 'Abre solo cuando fuera esté más fresco que dentro',
    ventilateDetail:
      'La regla que casi todo el mundo aplica al revés. Una ventana abierta por la tarde es una fuente de ' +
      'calor. Todo cerrado durante el día, y abierto de par en par en cuanto la temperatura ' +
      'exterior baje de la interior, normalmente al final de la tarde.',
    emergencyTitle: 'Conoce la señal que lo cambia todo',
    emergencyDetail:
      'Confusión, agitación, o alguien que ha dejado de sudar con este calor, es una urgencia ' +
      'médica, no una mala tarde. Llama a emergencias y después enfríalo con agua mientras esperas.',

    fanReasonHelps: 'el aire en movimiento se lleva mucho más sudor del calor que trae — aquí el ventilador hace un trabajo real',
    fanReasonMarginal: 'el ventilador todavía ayuda, pero apenas; está cerca del punto en que el calor que te sopla anula la evaporación que consigue',
    fanReasonHarmful: 'el aire está más caliente que tu piel y tu sudoración ya está al límite, así que más aire solo te trae calor — un ventilador empeora esto',
  },

  day: {
    heading: 'El día, hora a hora',
    subModelled:
      'Dos preguntas sobre un mismo eje de tiempo: cuándo este aire es peor y cuándo abrir una ' +
      'ventana deja de importar calor. Sin una previsión consultada ambas curvas son un modelo ' +
      'construido a partir de una máxima y una mínima, y por eso van punteadas.',
    subMeasured:
      'Valores horarios medidos para este lugar. La marca grande es la hora más peligrosa, la ' +
      'pequeña la más calurosa — rara vez son la misma hora, y esa diferencia es la razón de ' +
      'ser de esta herramienta.',
    lowLabel: 'Mínima de hoy',
    highLabel: 'Máxima de hoy',
    buildingLabel: 'Tu edificio',
    axisHour: 'hora del día',
    axisWetBulb: 'bulbo húmedo °C',
    axisCelsius: '°C',
    thresholdLabel: 'tu umbral {value}°',
    nightsCaption: 'las noches por debajo de {threshold} °C dan una oportunidad al cuerpo',
    today: 'hoy',
    markHottest: 'Hora más calurosa: {hour}, {temp} °C',
    markWorst: 'Hora más peligrosa: {hour}, bulbo húmedo {wetBulb} °C',
    aria: 'Temperatura de bulbo húmedo a lo largo del día. Hora más calurosa {hottest}, hora más peligrosa {worst}.',
    nightTooltip: '{date}: mínima {low}',
    nightTooltipHot: '{date}: mínima {low} — sin alivio',
    unknown: 'desconocida',
    nightsAria: {
      _count: 'count',
      one: 'Una noche sin alivio en este periodo.',
      many: '{count} noches seguidas sin alivio en este periodo.',
      other: '{count} noches seguidas sin alivio en este periodo.',
    },
    notEnough: 'datos insuficientes',
    legendOutdoors: 'exterior (modelado)',
    legendIndoors: 'interior (modelado)',
    legendWindow: 'merece la pena abrir',
    legendWetBulb: 'bulbo húmedo (medido)',
    legendThreshold: 'tu umbral',
    legendPast: 'por encima de tu umbral',
    windowSummary:
      'Abre todo a partir de las {opens} y ciérralo de nuevo antes de las {closes}. El aire más ' +
      'frío llega hacia las {best}, {gain} °C por debajo de la habitación.',
    windowNone:
      'Hoy el aire exterior nunca baja lo suficiente por debajo de la habitación. No hay buena ' +
      'hora para ventilar — mantén todo cerrado y a la sombra, y enfríate a ti mismo.',
    windowInsufficient: 'Datos horarios insuficientes para juzgar la ventilación.',
  },

  buildings: {
    heavy: 'Mampostería maciza, muros gruesos',
    heavyNote: 'se mantiene fresco durante días y luego, una vez caliente, caliente durante días',
    medium: 'Piso o casa corriente',
    mediumNote: 'sigue el día con la mitad de la oscilación, tres horas por detrás',
    light: 'Última planta o buhardilla',
    lightNote: 'el tejado irradia hacia la habitación toda la tarde — el tipo de vivienda más peligroso',
    glazed: 'Ventanales orientados al sol',
    glazedNote: 'el vidrio deja entrar el sol de onda corta y atrapa el calor de onda larga en que se convierte',
  },

  globe: {
    heading: 'Dónde vive el calor',
    sub:
      'No el tiempo de hoy — la forma del problema. Cada celda es la temperatura de bulbo húmedo ' +
      'que alcanza un lugar en una estación cálida normal, a partir de tres años de reanálisis. ' +
      'Arrastra para girar, usa la rueda para acercar. Busca un lugar arriba y el globo va allí.',
    ariaLabel: 'Un globo que muestra dónde la temperatura de bulbo húmedo es estructuralmente alta',
    note: '{cells} celdas de tierra a {step}°, percentil {percentile} de bulbo húmedo, {from}–{to}.',
    noWebGL:
      'Este navegador no puede dibujar el globo (no hay WebGL). Todo lo demás de la página ' +
      'funciona sin él.',
    band1: '< 22°',
    band1Note: 'sin restricción por calor',
    band2: '22–25°',
    band2Note: 'perceptible en verano',
    band3: '25–27°',
    band3Note: 'trabajar se hace duro',
    band4: '27–29°',
    band4Note: 'peligroso para los vulnerables',
    band5: '29–31°',
    band5Note: 'acercándose al límite medido',
    band6: '≥ 31°',
    band6Note: 'por encima, en una estación cálida normal',
    bandEmpty: '{note} — ninguna celda aquí',
    factHotCellsTitle: {
      _count: 'count',
      one: 'Una de {total} celdas de tierra supera los 26 °C',
      many: '{count} de {total} celdas de tierra superan los 26 °C',
      other: '{count} de {total} celdas de tierra superan los 26 °C',
    },
    factHotCellsDetail:
      'y no están dispersas: el delta del Ganges, el Punyab, la Llanura del Norte de China, el ' +
      'Golfo. Aproximadamente una quinta parte de la humanidad vive dentro de ese puñado de ' +
      'celdas, y esa es toda la razón de dibujar este mapa.',
    factCeilingTitle: 'Nada aquí llega a {limit} °C — y eso no es tranquilizador',
    factCeilingDetail:
      'Este es el percentil 95 de toda una estación cálida, así que describe el tiempo que tiene ' +
      'un lugar la mayoría de los veranos, no su peor hora. Horas sueltas suben mucho más: se ' +
      'han registrado 35 °C de bulbo húmedo en la costa del Golfo Pérsico. Una celda de 28 °C ' +
      'pasa horas reales muy por encima de 31.',
    factHottestTitle: 'Celda más caliente: {value} °C en {latitude}° {ns}, {longitude}° {ew}',
    factHottestDetail:
      'Cada celda mide {step}° — unos 650 km — así que promedia una costa con una meseta y una ' +
      'ciudad con un campo. Los lugares reales dentro de ella se apartan en ambas direcciones.',
    north: 'N',
    south: 'S',
    east: 'E',
    west: 'O',
  },

  measures: {
    heading: 'Qué enfría de verdad una habitación',
    sub:
      'La mayoría de los consejos sobre calor son una lista plana en la que «cierra las cortinas» ' +
      'aparece junto a «da sombra a la ventana desde fuera», como si fueran comparables. Se ' +
      'diferencian en un factor de cinco.',
    worth: 'vale {value}×',
    externalShade: 'Da sombra al cristal desde fuera',
    externalShadeDetail:
      'Contraventanas, toldos, una sombrilla, una sábana sujeta fuera — cualquier cosa que ' +
      'detenga la luz antes de que cruce el cristal. Unas cinco veces el efecto de la misma tela ' +
      'colgada por dentro.',
    nightVent: 'Expulsa el calor por la noche',
    nightVentDetail:
      'Ventanas de lados opuestos abiertas a la vez durante las horas frescas. La ventilación ' +
      'cruzada mueve varias veces el aire de una sola ventana abierta, y es la única forma de ' +
      'sacar de los muros el calor de ayer.',
    internalBlind: 'Cierra cortinas y persianas',
    internalBlindDetail:
      'Merece la pena, y es mucho más débil de lo que parece: cuando la luz alcanza una cortina ' +
      'interior la energía ya está en la habitación. Que sea clara y reflectante ayuda un poco.',
    appliances: 'Apaga todo lo que caliente',
    appliancesDetail:
      'Un horno, una secadora, un ordenador de sobremesa y una docena de pilotos en espera son ' +
      'unos cientos de vatios de calefacción en una habitación que intentas enfriar. Cocina fuera ' +
      'o en frío.',
    oneRoom: 'Renuncia al piso, defiende una habitación',
    oneRoomDetail:
      'Elige la habitación más fresca — orientada al norte, planta baja, muros pesados — y cierra ' +
      'el resto. Enfriar una habitación es posible; enfriar un piso, con estos medios, no.',
    dampCloth: 'Enfríate a ti, no a la habitación',
    dampClothDetail:
      'Un paño mojado en el cuello y los antebrazos, los pies en agua fresca, ropa húmeda. Cuando ' +
      'el aire no se puede cambiar esto es lo que queda, y funciona — añade la evaporación que tu ' +
      'sudor ya no consigue.',
  },

  presets: {
    mild: 'Día cálido de verano',
    mildNote: 'la clase de día que no preocupa a nadie, y con razón',
    europe: 'Ola de calor europea',
    europeNote: 'caluroso, seco, sobrevivible — y aun así llena hospitales, por quién está dentro',
    gulf: 'Costa del Golfo, húmedo',
    gulfNote: 'siete grados más fresco que la ola de calor de arriba, y mucho más peligroso',
    desert: 'Desierto, seco absoluto',
    desertNote: 'la cifra más alta de aquí, y no el peor aire de esta lista',
    monsoon: 'Premonzón, Asia del Sur',
    monsoonNote: 'por encima del límite medido en adultos jóvenes sanos en cámara climática',
    indoors: 'Un piso sin ventilación',
    indoorsNote: 'donde ocurren de verdad la mayoría de las muertes por calor — dentro, no al sol',
  },

  limits: {
    heading: 'Lo que esto no puede hacer',
    doctorLabel: 'no es un médico',
    doctor:
      'Nada de esto es consejo médico, y los umbrales están calibrados con fisiología publicada, ' +
      'no contigo. Si alguien está confuso, agitado, o ha dejado de sudar con calor, eso es una ' +
      'urgencia — llama, no calcules.',
    forecastLabel: 'no es una previsión',
    forecast:
      'No sabe qué tiempo hace a menos que le pidas que lo consulte. Los avisos oficiales de calor ' +
      'saben cosas que esto no sabe, entre ellas cuánto lleva durando el calor.',
    limitsLabel: 'dos límites, no uno',
    limitsText:
      '35 °C de bulbo húmedo es el límite teórico. Alrededor de 31 °C es donde el esfuerzo se ha ' +
      'medido realmente en jóvenes sanos. Citar solo los 35 hace que el peligro parezca cuatro ' +
      'grados más lejos de lo que está.',
    shadeLabel: 'sombra y quietud',
    shade:
      'Toda cifra de aquí supone sombra y reposo. El sol directo equivale a varios grados; el ' +
      'trabajo físico puede multiplicar por diez tu producción de calor.',
  },

  footer: {
    source: 'Código, fuentes y batería de pruebas en GitHub',
    tagline: 'hecho para comprobarse, no para creerse',
  },
};
