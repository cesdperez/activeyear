import type { GarminLocale } from '#lib/types/index.js';

const fields = [
	'Activity Type',
	'Date',
	'Favorite',
	'Title',
	'Distance',
	'Calories',
	'Time',
	'Moving Time',
	'Elapsed Time',
	'Total Ascent'
];
function headers(values: string[]): Record<string, string> {
	return Object.fromEntries(
		values.map((value, index) => [value, fields[index]]).filter(([value]) => value)
	);
}

export const GARMIN_LOCALES: GarminLocale[] = [
	{
		headers: headers([
			'Tipo de actividad',
			'Fecha',
			'Favorito',
			'Título',
			'Distancia',
			'Calorías',
			'Tiempo',
			'Tiempo en movimiento',
			'Tiempo transcurrido',
			'Ascenso total'
		]),
		types: {
			Carrera: 'Running',
			'Entrenamiento en cinta': 'Treadmill Running',
			'Trail running': 'Trail Running',
			Ciclismo: 'Cycling',
			'Ciclismo en sala': 'Indoor Cycling',
			'Ciclismo en carretera': 'Road Cycling',
			'Ciclismo de montaña': 'Mountain Biking',
			'Esquí de fondo': 'Cross Country Skiing',
			'Natación en piscina': 'Pool Swim',
			'Natación en aguas abiertas': 'Open Water Swimming',
			Caminar: 'Walking',
			Senderismo: 'Hiking',
			'Entrenamiento de fuerza': 'Strength Training'
		}
	},
	{
		headers: {
			...headers([
				'Aktivitätstyp',
				'Datum',
				'Favorit',
				'Titel',
				'Distanz',
				'Kalorien',
				'Zeit',
				'Zeit in Bewegung',
				'Verstrichene Zeit',
				'Anstieg gesamt'
			]),
			Gesamtzeit: 'Time'
		},
		types: {
			Laufen: 'Running',
			Laufbandtraining: 'Treadmill Running',
			Schwimmbadschwimmen: 'Pool Swim',
			Freiwasserschwimmen: 'Open Water Swimming',
			Gehen: 'Walking',
			Wandern: 'Hiking',
			Trailrunning: 'Trail Running',
			Radfahren: 'Cycling',
			Rennradfahren: 'Road Cycling',
			Mountainbiken: 'Mountain Biking',
			'Indoor Cycling': 'Indoor Cycling',
			'Virtuelles Radfahren': 'Virtual Cycling',
			Krafttraining: 'Strength Training',
			Cardio: 'Cardio',
			Yoga: 'Yoga'
		}
	},
	{
		headers: headers([
			"Type d'activité",
			'Date',
			'Favori',
			'Titre',
			'Distance',
			'Calories',
			'Durée',
			'',
			'',
			'Ascension totale'
		]),
		types: {
			'Course à pied': 'Running',
			'Course à pied sur tapis roulant': 'Treadmill Running',
			Trail: 'Trail Running',
			Cyclisme: 'Cycling',
			"Vélo d'intérieur": 'Indoor Cycling',
			'Vélo de route': 'Road Cycling',
			VTT: 'Mountain Biking',
			'Ski de fond': 'Cross Country Skiing',
			'Marche à pied': 'Walking',
			Randonnée: 'Hiking',
			Musculation: 'Strength Training',
			'Nat. piscine': 'Pool Swim',
			'Natation en eau libre': 'Open Water Swimming'
		}
	},
	{
		headers: headers([
			'Tipo di attività',
			'Data',
			'Preferita',
			'Titolo',
			'Distanza',
			'Calorie',
			'Tempo',
			'Tempo in movimento',
			'Tempo trascorso',
			'Ascesa totale'
		]),
		types: {
			Corsa: 'Running',
			Camminata: 'Walking',
			'Nuoto in piscina': 'Pool Swim',
			Escursionismo: 'Hiking',
			'Allenamento di forza': 'Strength Training',
			'Corsa su tapis roulant': 'Treadmill Running',
			Ciclismo: 'Cycling',
			'Ciclismo su strada': 'Road Cycling',
			'Ciclismo indoor': 'Indoor Cycling',
			'Mountain bike': 'Mountain Biking',
			'Sci di fondo': 'Cross Country Skiing',
			Cardio: 'Cardio',
			'Esercizio di Respirazione': 'other'
		}
	},
	{
		headers: headers([
			'Activiteittype',
			'Datum',
			'Favoriet',
			'Titel',
			'Afstand',
			'Calorieën',
			'Tijd',
			'Tijd bewogen',
			'Verstreken tijd',
			'Totale stijging'
		]),
		types: {
			Hardlopen: 'Running',
			'Hardlopen op een loopband': 'Treadmill Running',
			Fietsen: 'Cycling',
			Indoorcycling: 'Indoor Cycling',
			Wegwielrennen: 'Road Cycling',
			Mountainbiken: 'Mountain Biking',
			Langlaufen: 'Cross Country Skiing',
			'Virtueel fietsen': 'Virtual Cycling',
			Krachttraining: 'Strength Training',
			Wandelen: 'Walking',
			Zwembad: 'Pool Swim',
			'Zwemmen in open water': 'Open Water Swimming',
			Peddelsurfen: 'Stand Up Paddleboarding',
			Multisport: 'Multisport',
			Yoga: 'Yoga',
			HIIT: 'HIIT',
			Pilates: 'Pilates'
		}
	},
	{
		headers: headers([
			'Tipo de atividade',
			'Data',
			'Favorito',
			'Título',
			'Distância',
			'Calorias',
			'Tempo',
			'Tempo em movimento',
			'Duração',
			'Subida total'
		]),
		types: {
			Corrida: 'Running',
			'Corrida em esteira': 'Treadmill Running',
			Ciclismo: 'Cycling',
			'Ciclismo em local fechado': 'Indoor Cycling',
			'Ciclismo de estrada': 'Road Cycling',
			'Mountain bike': 'Mountain Biking',
			'Corrida em trilha': 'Trail Running',
			Caminhada: 'Walking',
			'Natação em piscina': 'Pool Swim',
			Cardiovascular: 'Cardio',
			Ioga: 'Yoga',
			Outros: 'other',
			'Esportes aquáticos': 'other',
			'Academia e equipamentos de fitness': 'other'
		}
	}
];
