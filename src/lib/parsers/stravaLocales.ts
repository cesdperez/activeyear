import type { StravaLocale } from '#lib/types/index.js';

export const STRAVA_LOCALES: StravaLocale[] = [
	{
		headers: {
			'Fecha de la actividad': 'Activity Date',
			'Nombre de la actividad': 'Activity Name',
			'Tipo de actividad': 'Activity Type',
			'Tiempo en movimiento': 'Moving Time',
			Distancia: 'Distance',
			'Desnivel positivo': 'Elevation Gain',
			Calorías: 'Calories'
		},
		types: {
			Carrera: 'Run',
			Caminata: 'Walk',
			Natación: 'Swim',
			'Vuelta ciclista': 'Ride',
			Bicicleta: 'Ride',
			'Entrenamiento con pesas': 'Weight Training',
			Yoga: 'Yoga',
			Entrenamiento: 'Workout'
		},
		months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
	},
	{
		headers: {
			"Date de l'activité": 'Activity Date',
			"Nom de l'activité": 'Activity Name',
			"Type d'activité": 'Activity Type',
			'Durée de déplacement': 'Moving Time',
			Distance: 'Distance',
			'Dénivelé positif': 'Elevation Gain',
			Calories: 'Calories'
		},
		types: {
			'Course à pied': 'Run',
			Vélo: 'Ride',
			Marche: 'Walk',
			Natation: 'Swim',
			Randonnée: 'Hike',
			'Entraînement aux poids': 'Weight Training',
			'Ski alpin': 'Alpine Ski',
			Entraînement: 'Workout'
		},
		months: [
			'janv',
			'févr',
			'mars',
			'avr',
			'mai',
			'juin',
			'juil',
			'août',
			'sept',
			'oct',
			'nov',
			'déc'
		]
	},
	{
		headers: {
			Aktivitätsdatum: 'Activity Date',
			'Name der Aktivität': 'Activity Name',
			Aktivitätsart: 'Activity Type',
			Bewegungszeit: 'Moving Time',
			Distanz: 'Distance',
			Höhenzunahme: 'Elevation Gain',
			Kalorien: 'Calories'
		},
		types: {
			Lauf: 'Run',
			Radfahrt: 'Ride',
			Kanu: 'Canoeing',
			Schwimmen: 'Swim',
			Wanderung: 'Hike',
			Spaziergang: 'Walk',
			Krafttraining: 'Weight Training'
		},
		months: []
	},
	{
		headers: {
			'Data dell’attività': 'Activity Date',
			'Nome attività': 'Activity Name',
			'Tipo attività': 'Activity Type',
			'Tempo in movimento': 'Moving Time',
			Distanza: 'Distance',
			'Dislivello complessivo': 'Elevation Gain',
			Calorie: 'Calories'
		},
		types: { Corsa: 'Run', Ciclismo: 'Ride', Camminata: 'Walk', Escursione: 'Hike', Nuoto: 'Swim' },
		months: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
	},
	{
		headers: {
			'Datum van activiteit': 'Activity Date',
			'Naam activiteit': 'Activity Name',
			Activiteitstype: 'Activity Type',
			Beweegtijd: 'Moving Time',
			Afstand: 'Distance'
		},
		types: {
			Hardloopsessie: 'Run',
			Fietsrit: 'Ride',
			Wandeling: 'Walk',
			Zwemmen: 'Swim',
			Krachttraining: 'Weight Training'
		},
		months: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
	},
	{
		headers: {
			'Data da atividade': 'Activity Date',
			'Nome da atividade': 'Activity Name',
			'Tipo de atividade': 'Activity Type',
			'Tempo em movimento': 'Moving Time',
			Distância: 'Distance'
		},
		types: {
			Corrida: 'Run',
			Caminhada: 'Walk',
			Pedalada: 'Ride',
			Natação: 'Swim',
			Trilha: 'Hike',
			Musculação: 'Weight Training'
		},
		months: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
	}
];
