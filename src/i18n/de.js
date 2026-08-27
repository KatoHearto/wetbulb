/**
 * Deutsch.
 *
 * Übersetzt, nicht geprüft — siehe `language.machineWarning`. Wo dieser Text
 * und das englische Original auseinandergehen, gilt das Original.
 *
 * Zwei Entscheidungen, die im Text nicht sichtbar sind:
 *
 * "Feuchtkugeltemperatur" statt "Kühlgrenztemperatur". Letzteres ist in der
 * deutschen Klimatechnik gebräuchlicher, ersteres beschreibt das Messverfahren
 * und ist damit für jemanden, der den Begriff zum ersten Mal liest, das
 * ehrlichere Wort.
 *
 * Die Handlungsanweisungen bleiben im Imperativ und kurz. Eine Warnung, die
 * höflich formuliert ist, wird als Vorschlag gelesen.
 */

export const de = {
  units: {
    celsius: '°C',
    percent: '%',
  },

  meta: {
    title: 'wetbulb – die Temperatur, die entscheidet, ob du dich abkühlen kannst',
    description:
      'Die Lufttemperatur sagt nichts darüber, ob Hitze gefährlich ist. Die ' +
      'Feuchtkugeltemperatur schon. Sieh nach, wo du stehst, ob ein Ventilator hilft und ' +
      'welche Stunde heute wirklich die schlimmste ist. Läuft offline; holt auf Wunsch das ' +
      'echte Wetter dazu.',
  },

  masthead: {
    lede:
      'Hitze tötet mehr Menschen als jede andere Wetterlage – und die Zahl in jeder Warnung ' +
      'ist die falsche.',
    blurbBefore: 'Die Lufttemperatur sagt fast nichts darüber, ob ein Körper Wärme abgeben kann.',
    blurbTerm: 'Die Feuchtkugeltemperatur',
    blurbAfter:
      'entscheidet darüber. Bei 45 °C in trockener Wüstenluft schwitzt ein gesunder Mensch ' +
      'und überlebt. Bei 35 °C in feuchter Luft nicht – dann nimmt die Luft den Schweiß nicht ' +
      'mehr auf.',
    whatLabel: 'was das hier ist',
    what:
      'Ein Rechner und eine Handvoll Entscheidungen, kein Warndienst. Gib ihm zwei Zahlen, ' +
      'oder lass ihn das stündliche Wetter für einen Ort abrufen – die Regler bleiben in ' +
      'beiden Fällen benutzbar.',
    privacyBefore:
      'Kein Konto, kein Tracking. Läuft komplett ohne Netz – und wenn du echtes Wetter ' +
      'abrufst, gehen nur deine Koordinaten an',
    privacyAfter: '.',
  },

  language: {
    label: 'Sprache',
    machineWarningTitle: 'Diese Übersetzung wurde nicht von einem Muttersprachler geprüft',
    machineWarning:
      'Sie stammt von demselben System, das auch das Werkzeug geschrieben hat. Wo ein Satz ' +
      'hier von der englischen Fassung abweicht, gilt die englische. Wenn etwas falsch klingt ' +
      '– besonders eine Handlungsanweisung – melde es bitte als Issue.',
    original: 'Das englische Original lesen',
  },

  where: {
    heading: 'Echtes Wetter, wenn du willst',
    sub:
      'Alles weiter unten funktioniert schon mit den beiden Reglern allein. Wer die stündlichen ' +
      'Werte abruft, erfährt drei Dinge zusätzlich, die kein Regler wissen kann: welche Stunde ' +
      'heute tatsächlich die schlimmste ist, wie viele Nächte am Stück keine Erholung gebracht ' +
      'haben, und ob dein Körper diese Hitze schon kennt.',
    searchLabel: 'Ort suchen',
    searchPlaceholder: 'Köln, Delhi, Phoenix…',
    lookUp: 'Suchen',
    useLocation: 'Meinen Standort verwenden',
    lookingUp: 'Ort wird gesucht…',
    fetching: 'Stündliche Wetterdaten für {place} werden abgerufen…',
    askingLocation: 'Der Browser wird nach deinem Standort gefragt…',
    sent:
      'Koordinaten gesendet: {latitude}, {longitude}. Sonst hat nichts diesen Browser ' +
      'verlassen.',
  },

  errors: {
    offline: 'Keine Verbindung. Die Regler funktionieren weiter – dieses Werkzeug brauchte das Netz nie.',
    timeout: 'Der Wetterdienst hat nicht rechtzeitig geantwortet. Versuch es noch einmal, oder nimm die Regler.',
    denied: 'Die Standortfreigabe wurde abgelehnt. Such stattdessen einen Ort, oder stell die Regler von Hand ein.',
    unsupported: 'Dieser Browser gibt keinen Standort heraus. Such stattdessen einen Ort.',
    notFound: 'Kein Ort dieses Namens. Versuch eine größere Stadt in der Nähe.',
    server: 'Der Wetterdienst meldet einen Fehler. Daran lässt sich von hier aus nichts machen – versuch es später noch einmal.',
    malformed:
      'Der Wetterdienst hat etwas zurückgegeben, womit dieses Werkzeug nichts anfangen kann.',
    generic: 'Beim Abrufen der Wetterdaten ist etwas schiefgegangen.',
  },

  findings: {
    sourceHourly: 'Stundenvorhersage',
    sourceDaily: 'Tagesminima',
    sourcePast: 'letzte 7 Tage',

    peakOffsetTitle: {
      _count: 'hours',
      one: 'Die schlimmste Stunde kommt eine Stunde {direction} als die heißeste',
      other: 'Die schlimmste Stunde kommt {hours} Stunden {direction} als die heißeste',
    },
    peakEarlier: 'früher',
    peakLater: 'später',
    peakOffsetDetail:
      'Das Thermometer erreicht seinen Höchststand um {hottestHour} mit {hottestTemp} °C. Am ' +
      'härtesten ist die Luft für einen Körper aber um {worstHour}, wenn sie {worstTemp} °C ' +
      'hat – {difference} °C kühler, dafür {worstHumidity} % Luftfeuchte. Die ' +
      'Feuchtkugeltemperatur liegt dann bei {worstWet} statt bei {hottestWet}.',
    peakSameTitle: 'Heute fallen die beiden Spitzen auf dieselbe Stunde',
    peakSameDetail:
      'Heute liegen die heißeste und die gefährlichste Stunde beide um {hour}. ' +
      'Das ist die Ausnahme, nicht die Regel.',

    nightsTitle: {
      _count: 'current',
      one: 'Eine Nacht ohne Erholung',
      other: '{current} Nächte ohne Erholung',
    },
    nightsMore: {
      _count: 'ahead',
      one: ', eine weitere kommt noch',
      other: ', {ahead} weitere kommen noch',
    },
    nightsDetail:
      'Nachts gibt der Körper die Wärme wieder ab, die er tagsüber aufgenommen hat. Über ' +
      '{threshold} °C hört er damit auf. Gefährlich wird eine Hitzewelle deshalb meist erst ' +
      'am dritten und vierten Tag – und diese Serie dauert {total}.',
    nightsRun: {
      _count: 'total',
      one: 'eine Nacht',
      other: '{total} Nächte',
    },
    nightsCoolTitle: 'Die Nächte kühlen noch ab',
    nightsCoolDetail:
      'Jede Nacht in diesem Zeitraum fällt unter {threshold} °C, der Körper bekommt also ' +
      'seine Gelegenheit, sich zu erholen. Das ist der wichtigste Unterschied überhaupt ' +
      'zwischen einer unangenehmen und einer gefährlichen Woche.',

    acclimatisedTitle: 'Dein Körper kennt diese Hitze schon',
    acclimatisedDetail:
      'Heute werden {today} °C erreicht, und letzte Woche waren es schon {recent} °C. Wer an ' +
      'Hitze gewöhnt ist, fängt früher an zu schwitzen und verliert dabei weniger Salz.',
    unacclimatisedTitle: 'Heute ist es {difference} °C heißer als an jedem Tag der letzten Woche',
    unacclimatisedDetail:
      'Heute werden {today} °C erreicht; der wärmste der vergangenen {days} Tage kam auf ' +
      '{recent} °C. Der Körper braucht ein bis zwei Wochen, um sich anzupassen – deshalb ist ' +
      'die erste Hitzewelle eines Sommers zuverlässig die gefährlichste, und zwar bei ' +
      'Temperaturen, die dieselben Leute im August achselzuckend hinnehmen.',
  },

  chart: {
    heading: 'Wo du in dieser Luft stehst',
    sub:
      'Zieh den Punkt, oder tipp die Werte in die Felder. Jede Linie beruht auf derselben ' +
      'Physik wie die Zahlen daneben.',
    tempLabel: 'Lufttemperatur',
    humidityLabel: 'Relative Luftfeuchte',
    presetsLabel: 'Oder nimm eine echte Lage',
    axisTemp: 'Lufttemperatur °C',
    axisHumidity: 'relative Luftfeuchte %',
    legendMeasured: '{value}° gemessen',
    legendTheoretical: '{value}° theoretisch',
    legendYours: 'dein Punkt',
    legendNoFan: 'kein Ventilator',
    legendIsopleth: 'Feuchtkugel',
    ariaLabel:
      'Zustandsdiagramm der Luft. Dein Punkt: {temp} Grad bei {humidity} Prozent ' +
      'Luftfeuchte, Feuchtkugel {wetBulb} Grad.',
    youLabel: 'du',
    pointTitle: '{temp} °C bei {humidity} % – Feuchtkugel {wetBulb} °C',
  },

  readout: {
    wetBulb: 'Feuchtkugeltemperatur',
    threshold: 'Deine Schwelle',
    margin: 'Abstand',
    fan: 'Ventilator hier',
    heatIndex: 'Hitzeindex',
    dewPoint: 'Taupunkt',
    sourceStull: 'Stull 2011',
    sourceReference: 'Referenz',
    sourceShifted: '−{shift} verschoben',
    sourceMargin: 'Schwelle − Feuchtkugel',
    sourceBalance: 'Wärmebilanz',
    sourceNWS: 'NWS',
    sourceMagnus: 'Magnus',
    marginLeft: '{value} °C übrig',
    marginPast: '{value} °C darüber',
    fanHelps: 'hilft',
    fanMarginal: 'kaum',
    fanHarmful: 'macht es schlimmer',
    accuracyGood: 'im Bereich, für den Stull die Formel angepasst hat (Fehler < ~1 °C)',
    accuracyPoor: 'unter 5 % Luftfeuchte wird die Näherung ungenau; nur als Anhaltspunkt lesen',
    accuracyEdge: 'außerhalb des angepassten Bereichs – der Wert ist eine Extrapolation',
  },

  bands: {
    safe: 'Angenehm',
    safeHeadline: 'Dein Körper hat hier reichlich Spielraum.',
    watch: 'Im Auge behalten',
    watchHeadline: 'Machbar – aber das ist der Tag, um den herum du alles andere planst.',
    strain: 'Echte Belastung',
    strainHeadline: 'Dein Körper arbeitet daran, kühl zu bleiben, und verliert langsam an Boden.',
    danger: 'Gefährlich',
    dangerHeadline: 'Unter solchen Bedingungen kommt es zu Hitzeerkrankungen.',
    critical: 'Jenseits der Grenze',
    criticalHeadline: 'An diese Luft kann ein Körper keine Wärme mehr abgeben. Geh hier raus.',
  },

  who: {
    heading: 'Wen diese Luft trifft',
    sub:
      'Die veröffentlichten Grenzwerte beschreiben junge, gesunde, akklimatisierte Menschen ' +
      'in Ruhe – und das sind nicht die, die in Hitzewellen sterben. Jeder dieser Faktoren ' +
      'senkt die Schwelle um eine angegebene Zahl von Grad.',
    groupBody: 'Für wen das gilt',
    groupHealth: 'Gesundheit',
    groupMedication: 'Medikamente',
    groupSituation: 'Gerade jetzt',
    noneSelectedBefore: 'Nichts ausgewählt – die Zahlen oben beschreiben einen',
    noneSelectedTerm: 'jungen, gesunden, akklimatisierten Erwachsenen, der ruhig im Schatten sitzt',
    noneSelectedAfter: '. An solchen Menschen wurden die veröffentlichten Grenzwerte gemessen.',
    selected: {
      _count: 'count',
      one:
        'Ein Faktor ausgewählt. Die Schwelle ist um {shift} °C Feuchtkugeltemperatur ' +
        'gesunken, auf {threshold} °C. Jeder weitere Faktor würde weniger zählen als der ' +
        'davor – drei Risikofaktoren machen niemanden dreimal so anfällig.',
      other:
        '{count} Faktoren ausgewählt. Die Schwelle ist um {shift} °C Feuchtkugeltemperatur ' +
        'gesunken, auf {threshold} °C. Jeder weitere Faktor zählt weniger als der davor – ' +
        'drei Risikofaktoren machen niemanden dreimal so anfällig.',
    },
  },

  factors: {
    age65: 'Über 65',
    age65Why:
      'die Schweißproduktion sinkt mit dem Alter und das Durstgefühl wird schwächer, also ' +
      'kommt beides zu spät: die Kühlung und das Signal, etwas zu trinken',
    age75: 'Über 75',
    age75Why: 'dieselben Effekte, weiter fortgeschritten – die meisten Hitzetoten gehören zu dieser Gruppe, drinnen, allein',
    infant: 'Säugling oder Kleinkind',
    infantWhy: 'viel Oberfläche im Verhältnis zur Masse, eine unreife Schweißreaktion und keine Möglichkeit, den Raum zu verlassen oder nach Wasser zu fragen',
    pregnant: 'Schwanger',
    pregnantWhy: 'der Grundumsatz erzeugt mehr Wärme, und der Kreislauf braucht mehr Blutvolumen',
    unacclimatised: 'Erste heiße Tage des Jahres',
    unacclimatisedWhy: 'die Akklimatisierung dauert ein bis zwei Wochen – die erste Hitzewelle eines Sommers ist verlässlich die gefährlichste, bei Temperaturen, die später niemanden mehr aufregen',
    cardiovascular: 'Herz- oder Kreislauferkrankung',
    cardiovascularWhy: 'Kühlung heißt, Blut in die Haut zu pumpen, und dafür hat das Herz womöglich keine Reserve',
    respiratory: 'Lungenerkrankung',
    respiratoryWhy: 'Hitze und das Ozon, das mit ihr kommt, erhöhen beide die Atemarbeit',
    diabetes: 'Diabetes',
    diabetesWhy: 'kann das Schwitzen dämpfen und die Hitzebelastung weniger spürbar machen',
    kidney: 'Nierenerkrankung',
    kidneyWhy: 'der Flüssigkeitshaushalt hat weniger Spielraum für die Verluste durch Schwitzen',
    anticholinergic: 'Anticholinergika',
    anticholinergicWhy:
      'sie unterdrücken das Schwitzen unmittelbar – von allen Medikamenten hier der stärkste ' +
      'Einfluss. Viele Antihistaminika, manche Antidepressiva und Mittel gegen ' +
      'Blasenbeschwerden',
    diuretic: 'Diuretika',
    diureticWhy:
      'weniger zirkulierende Flüssigkeit, die der Körper verlieren kann, bevor das Schwitzen ' +
      'nachlässt',
    betablocker: 'Betablocker',
    betablockerWhy: 'sie deckeln den Herzfrequenzanstieg, von dem die Hautdurchblutung abhängt',
    antipsychotic: 'Antipsychotika',
    antipsychoticWhy: 'können die Temperaturregelung des Gehirns selbst stören',
    stimulant: 'Stimulanzien',
    stimulantWhy: 'erhöhen die Wärmeproduktion und überdecken zugleich die Erschöpfung, die dich stoppen würde',
    alcohol: 'Alkohol trinken',
    alcoholWhy:
      'entwässert und nimmt dir genau das Urteilsvermögen, mit dem du rechtzeitig aufhören ' +
      'würdest',
    exertion: 'Körperliche Arbeit oder Sport',
    exertionWhy: 'arbeitende Muskeln erzeugen bis zum Zehnfachen der Ruhewärme – jeder veröffentlichte Überlebensgrenzwert setzt jemanden voraus, der still sitzt',
    noAircon: 'Keine Klimaanlage verfügbar',
    noAirconWhy: 'keine Reserve, falls die passiven Maßnahmen nicht reichen',
    alone: 'Allein, niemand schaut nach',
    aloneWhy: 'ein Hitzschlag nimmt genau das Urteilsvermögen, mit dem man ihn erkennen würde – dass jemand anderes es bemerkt, ist oft der eigentliche Schutz',
  },

  actions: {
    heading: 'Was zu tun ist, der Reihe nach',
    sub: 'Sortiert danach, was jede Maßnahme unter diesen Bedingungen wert ist. Die erste Zeile ist die wichtigste.',

    leaveTitle: 'Geh sofort in kühlere Luft',
    leaveDetail:
      'Schatten reicht nicht, ein Ventilator auch nicht – es muss wirklich kühlere Luft sein. ' +
      'Ein öffentliches Gebäude, ein Einkaufszentrum, ein Keller, ein Auto mit Klimaanlage. ' +
      'In dieser Luft kommt Bleiben und Durchhalten nicht in Frage.',
    fanOffTitle: 'Schalt den Ventilator aus',
    fanOffDetail:
      '{reason}. Mach stattdessen deine Haut nass – ein feuchtes Tuch oder eine Sprühflasche ' +
      'übernimmt die Verdunstung, die dein Schweiß nicht mehr schafft.',
    fanOnTitle: 'Ein Ventilator hilft hier',
    fanOnDetail:
      'Richte ihn auf dich, nicht in den Raum – die Kühlung entsteht durch Luft, die über die ' +
      'Haut streicht. Der verbreitete Rat lautet, Ventilatoren über 35 °C auszuschalten; in ' +
      'so feuchter Luft ist dieser Rat genau verkehrt.',
    wetSkinTitle: 'Mach deine Haut nass',
    wetSkinDetail:
      'Ein feuchtes Tuch auf Nacken, Unterarme und Gesicht, oder eine Sprühflasche. Das ' +
      'wirkt, wenn nichts anderes mehr wirkt, weil es die Verdunstung übernimmt, für die ' +
      'dein Körper keinen Schweiß mehr hat. Es ist außerdem das Billigste auf dieser Liste.',
    shadeTitle: 'Beschatte die Fenster von außen',
    shadeDetail:
      'Fensterläden, Markisen, sogar ein außen aufgehängtes Laken halten rund fünfmal mehr ' +
      'Wärme ab als Jalousien innen. Ist das Sonnenlicht erst durch das Glas, steckt die ' +
      'Wärme schon im Raum, und Vorhänge verdecken sie nur.',
    stopWorkTitle: 'Hör auf mit der körperlichen Arbeit',
    stopWorkDetail:
      'Jeder veröffentlichte Überlebensgrenzwert setzt jemanden voraus, der still sitzt. ' +
      'Arbeitende Muskeln erzeugen bis zum Zehnfachen der Ruhewärme, und das ist die eine ' +
      'Größe hier, die du vollständig in der Hand hast.',
    checkInTitle: 'Verabrede, dass jemand nach dir schaut',
    checkInDetail:
      'Ein Hitzschlag nimmt dir genau das Urteilsvermögen, mit dem du ihn erkennen würdest. ' +
      'Ein Anruf zu einer festen Uhrzeit schützt besser als jeder Vorsatz, dich selbst zu ' +
      'beobachten.',
    drinkTitle: 'Trink nach Plan, nicht nach Durst',
    drinkDetail:
      'Durst ist in dieser Gruppe ein unzuverlässiges Signal, und wenn er kommt, ist das ' +
      'Defizit schon da. Jede Stunde ein Glas, ob dir danach ist oder nicht.',
    pharmacistTitle: 'Frag in der Apotheke, wie deine Medikamente auf Hitze wirken',
    pharmacistDetail:
      'Manche Medikamente unterdrücken das Schwitzen vollständig. Setz nichts eigenmächtig ab ' +
      '– aber in der Apotheke sagt man dir in zwei Minuten, ob eines davon dazugehört, und ' +
      'danach richtet sich, wie vorsichtig du heute sein musst.',
    ventilateTitle: 'Öffne nur, wenn es draußen kühler ist als drinnen',
    ventilateDetail:
      'Die Regel, die die meisten falsch machen. Ein offenes Fenster am Nachmittag ist eine ' +
      'Wärmequelle. Tagsüber alles zu, und in dem Moment weit öffnen, in dem die ' +
      'Außentemperatur unter die Innentemperatur fällt – meist am späten Abend.',
    emergencyTitle: 'Erkenne das Zeichen, das alles ändert',
    emergencyDetail:
      'Verwirrtheit, Unruhe oder jemand, der bei solcher Hitze aufgehört hat zu schwitzen, ' +
      'ist ein medizinischer Notfall, kein schlechter Nachmittag. Ruf den Rettungsdienst und ' +
      'kühl die Person mit Wasser, während du wartest.',

    fanReasonHelps: 'bewegte Luft trägt weit mehr Schweiß fort, als sie Wärme heranbringt – der Ventilator leistet hier echte Arbeit',
    fanReasonMarginal:
      'der Ventilator hilft noch, aber kaum; er ist nahe an dem Punkt, an dem die Wärme, die ' +
      'er auf dich bläst, die zusätzliche Verdunstung wieder auffrisst',
    fanReasonHarmful:
      'die Luft ist heißer als deine Haut, und dein Schwitzen ist schon am Anschlag; ' +
      'schneller bewegte Luft bringt dir dann nur noch Wärme – ein Ventilator macht es ' +
      'schlimmer',
  },

  day: {
    heading: 'Der Tag, Stunde für Stunde',
    subModelled:
      'Zwei Fragen auf einer Zeitachse: wann diese Luft am schlimmsten ist und wann ein ' +
      'offenes Fenster aufhört, Wärme hereinzulassen. Solange keine Vorhersage abgerufen ist, ' +
      'sind beide Kurven ein Modell aus einem Höchst- und einem Tiefstwert – deshalb sind sie ' +
      'gestrichelt.',
    subMeasured:
      'Gemessene Stundenwerte für diesen Ort. Der große Punkt markiert die gefährlichste ' +
      'Stunde, der kleine die heißeste – sie fallen selten zusammen, und genau dieser ' +
      'Abstand ist der Grund, warum es dieses Werkzeug gibt.',
    lowLabel: 'Tiefstwert heute',
    highLabel: 'Höchstwert heute',
    buildingLabel: 'Dein Gebäude',
    axisHour: 'Stunde des Tages',
    axisWetBulb: 'Feuchtkugel °C',
    axisCelsius: '°C',
    thresholdLabel: 'deine Schwelle {value}°',
    nightsCaption: 'Nächte unter {threshold} °C geben dem Körper eine Chance',
    today: 'heute',
    markHottest: 'Heißeste Stunde: {hour}, {temp} °C',
    markWorst: 'Gefährlichste Stunde: {hour}, Feuchtkugel {wetBulb} °C',
    aria: 'Feuchtkugeltemperatur im Tagesverlauf. Heißeste Stunde {hottest}, gefährlichste Stunde {worst}.',
    nightTooltip: '{date}: Tiefstwert {low}',
    nightTooltipHot: '{date}: Tiefstwert {low} – keine Erholung',
    unknown: 'unbekannt',
    nightsAria: {
      _count: 'count',
      one: 'Eine Nacht ohne Erholung in diesem Zeitraum.',
      other: '{count} Nächte am Stück ohne Erholung in diesem Zeitraum.',
    },
    notEnough: 'zu wenig Daten',
    legendOutdoors: 'draußen (modelliert)',
    legendIndoors: 'drinnen (modelliert)',
    legendWindow: 'Öffnen lohnt sich',
    legendWetBulb: 'Feuchtkugel (gemessen)',
    legendThreshold: 'deine Schwelle',
    legendPast: 'über deiner Schwelle',
    windowSummary:
      'Öffne alles ab etwa {opens} und mach es bis {closes} wieder zu. Die kälteste Luft ' +
      'kommt gegen {best}, {gain} °C unter der Raumtemperatur.',
    windowNone:
      'Die Außenluft fällt heute nie weit genug unter die Raumtemperatur. Keine gute Stunde ' +
      'zum Lüften – halt alles geschlossen und verschattet und kühl stattdessen dich selbst.',
    windowInsufficient: 'Zu wenig Stundendaten, um das Lüften zu beurteilen.',
  },

  buildings: {
    heavy: 'Massives Mauerwerk, dicke Wände',
    heavyNote: 'bleibt tagelang kühl und dann, einmal durchgewärmt, tagelang heiß',
    medium: 'Normale Wohnung, normales Haus',
    mediumNote: 'folgt dem Tag mit etwa halbem Ausschlag, drei Stunden versetzt',
    light: 'Oberstes Geschoss oder Dachzimmer',
    lightNote:
      'das Dach strahlt den ganzen Abend in den Raum – die tödlichste Wohnung überhaupt',
    glazed: 'Große Fenster zur Sonne',
    glazedNote:
      'Glas lässt die kurzwellige Sonnenstrahlung herein und hält die langwellige Wärme fest, ' +
      'in die sie sich im Raum verwandelt',
  },

  globe: {
    heading: 'Wo die Hitze wohnt',
    sub:
      'Nicht das Wetter von heute – die Gestalt des Problems. Jede Zelle ist die ' +
      'Feuchtkugeltemperatur, die ein Ort in einer normalen heißen Jahreszeit erreicht, aus ' +
      'drei Jahren Reanalyse. Zieh zum Drehen, scroll zum Zoomen. Such oben einen Ort, dann ' +
      'dreht sich der Globus dorthin.',
    ariaLabel: 'Ein Globus, der zeigt, wo die Feuchtkugeltemperatur strukturell hoch ist',
    note:
      '{cells} Landzellen mit {step}° Kantenlänge, {percentile}. Perzentil der ' +
      'Feuchtkugeltemperatur, {from}–{to}.',
    noWebGL:
      'Dieser Browser kann den Globus nicht zeichnen (WebGL fehlt). Alles andere auf der ' +
      'Seite funktioniert ohne ihn.',
    band1: '< 22°',
    band1Note: 'Hitze setzt hier keine Grenzen',
    band2: '22–25°',
    band2Note: 'im Sommer spürbar',
    band3: '25–27°',
    band3Note: 'Arbeit wird schwer',
    band4: '27–29°',
    band4Note: 'gefährlich für empfindliche Menschen',
    band5: '29–31°',
    band5Note: 'nahe an der gemessenen Grenze',
    band6: '≥ 31°',
    band6Note: 'jenseits der Grenze – in einer normalen heißen Jahreszeit',
    bandEmpty: '{note} – hier keine Zelle',
    factHotCellsTitle: {
      _count: 'count',
      one: 'Eine von {total} Landzellen liegt über 26 °C',
      other: '{count} von {total} Landzellen liegen über 26 °C',
    },
    factHotCellsDetail:
      'und sie sind nicht verstreut: das Gangesdelta, der Punjab, die Nordchinesische Ebene, ' +
      'der Golf. Etwa ein Fünftel der Menschheit lebt in dieser Handvoll Zellen, und genau ' +
      'deshalb lohnt sich diese Karte.',
    factCeilingTitle: 'Nichts hier erreicht {limit} °C – und das ist keine Entwarnung',
    factCeilingDetail:
      'Das ist das 95. Perzentil über eine ganze heiße Jahreszeit hinweg, es beschreibt also ' +
      'das Wetter, das ein Ort in den meisten Sommern hat, nicht seine schlimmste Stunde. ' +
      'Einzelne Stunden gehen weit darüber hinaus: am Persischen Golf wurden 35 °C ' +
      'Feuchtkugeltemperatur gemessen. In einer Zelle mit 28 °C gibt es reale Stunden weit ' +
      'jenseits von 31.',
    factHottestTitle: 'Heißeste Zelle: {value} °C bei {latitude}° {ns}, {longitude}° {ew}',
    factHottestDetail:
      'Jede Zelle ist {step}° breit, etwa 650 km; sie wirft also eine Küste und ein Hochland, ' +
      'eine Stadt und ein Feld in einen Mittelwert. Echte Orte darin weichen nach beiden ' +
      'Seiten ab.',
    north: 'N',
    south: 'S',
    east: 'O',
    west: 'W',
  },

  measures: {
    heading: 'Was einen Raum wirklich kühlt',
    sub:
      'Die meisten Ratschläge zur Hitze sind eine Liste ohne Rangfolge, in der „Vorhänge ' +
      'zuziehen“ neben „das Fenster von außen beschatten“ steht, als wären die beiden ' +
      'vergleichbar. Sie unterscheiden sich um etwa das Fünffache.',
    worth: '{value}× Wirkung',
    externalShade: 'Das Glas von außen beschatten',
    externalShadeDetail:
      'Fensterläden, Markisen, ein Sonnenschirm, ein außen befestigtes Laken – alles, was das ' +
      'Sonnenlicht abfängt, bevor es durch das Glas kommt. Etwa fünfmal so wirksam wie ' +
      'derselbe Stoff, innen aufgehängt.',
    nightVent: 'Die Wärme nachts hinauslüften',
    nightVentDetail:
      'Öffne in den kühlen Stunden gleichzeitig Fenster auf gegenüberliegenden Seiten. ' +
      'Querlüftung bewegt ein Vielfaches der Luftmenge, die ein einzelnes offenes Fenster ' +
      'schafft, und sie ist die einzige Möglichkeit, die Wärme von gestern wieder aus den ' +
      'Wänden zu bekommen.',
    internalBlind: 'Vorhänge und Jalousien schließen',
    internalBlindDetail:
      'Lohnt sich, wirkt aber weit schwächer, als es sich anfühlt: wenn Licht einen Vorhang ' +
      'innen erreicht, ist die Energie schon im Raum. Helle, reflektierende Stoffe helfen ein ' +
      'wenig.',
    appliances: 'Alles ausschalten, was warm läuft',
    appliancesDetail:
      'Ein Backofen, ein Wäschetrockner, ein Rechner und ein Dutzend Standby-Lämpchen sind ein ' +
      'paar hundert Watt Heizung in einem Raum, den du kühlen willst. Koch draußen oder kalt.',
    oneRoom: 'Die Wohnung aufgeben, einen Raum verteidigen',
    oneRoomDetail:
      'Nimm den kühlsten Raum – nach Norden, Erdgeschoss, schwere Wände – und halte den Rest ' +
      'geschlossen. Einen Raum zu kühlen ist machbar; eine ganze Wohnung mit diesen Mitteln ' +
      'nicht.',
    dampCloth: 'Sich selbst kühlen, nicht den Raum',
    dampClothDetail:
      'Ein nasses Tuch auf Nacken und Unterarme, Füße in kühlem Wasser, feuchte Kleidung. ' +
      'Wenn sich die Luft nicht ändern lässt, bleibt nur noch das – und es wirkt, weil es die ' +
      'Verdunstung übernimmt, die dein Schweiß nicht mehr schafft.',
  },

  presets: {
    mild: 'Warmer Sommertag',
    mildNote: 'die Sorte Tag, über die sich niemand Gedanken macht, und das zu Recht',
    europe: 'Europäische Hitzewelle',
    europeNote:
      'heiß, trocken, überlebbar – und füllt trotzdem die Krankenhäuser, wegen der Menschen, ' +
      'die sie trifft',
    gulf: 'Golfküste, feucht',
    gulfNote: 'sieben Grad kühler als die Hitzewelle darüber, und weit gefährlicher',
    desert: 'Wüste, knochentrocken',
    desertNote: 'die höchste Zahl hier und nicht die schlimmste Luft auf dieser Liste',
    monsoon: 'Vormonsun, Südasien',
    monsoonNote: 'jenseits der Grenze, die an gesunden jungen Erwachsenen in der Klimakammer gemessen wurde',
    indoors: 'Eine Wohnung ohne Lüftung',
    indoorsNote: 'wo die meisten Hitzeopfer tatsächlich sterben – drinnen, nicht in der Sonne',
  },

  limits: {
    heading: 'Was das hier nicht kann',
    doctorLabel: 'kein Arzt',
    doctor:
      'Nichts hier ist medizinischer Rat, und die Schwellen sind auf veröffentlichte ' +
      'physiologische Messwerte geeicht, nicht auf dich. Wenn jemand verwirrt oder unruhig ' +
      'ist oder bei Hitze aufgehört hat zu schwitzen, ist das ein Notfall – anrufen, nicht ' +
      'rechnen.',
    forecastLabel: 'keine Wettervorhersage',
    forecast:
      'Es weiß nicht, wie das Wetter ist, solange du es nicht nachschlagen lässt. Amtliche ' +
      'Hitzewarnungen wissen Dinge, die dieses Werkzeug nicht weiß, unter anderem, wie lange ' +
      'die Hitze schon anhält.',
    limitsLabel: 'zwei Grenzen, nicht eine',
    limitsText:
      'Die theoretische Grenze liegt bei 35 °C Feuchtkugeltemperatur. Bei etwa 31 °C setzt ' +
      'die Belastung ein, die an jungen, gesunden Menschen tatsächlich gemessen wurde. Nur ' +
      'die 35 zu nennen lässt die Gefahr vier Grad weiter weg erscheinen, als sie ist.',
    shadeLabel: 'Schatten und Stillsitzen',
    shade:
      'Jede Zahl hier setzt Schatten und Ruhe voraus. Direkte Sonne wirkt wie mehrere Grad ' +
      'zusätzlich; körperliche Arbeit kann deine Wärmeproduktion verzehnfachen.',
  },

  footer: {
    source: 'Quelltext, Quellen und Testsuite auf GitHub',
    tagline: 'gebaut, um geprüft zu werden, nicht um geglaubt zu werden',
  },
};
