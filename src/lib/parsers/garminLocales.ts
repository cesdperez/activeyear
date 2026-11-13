interface GarminLocale {
	headers: Record<string, string>;
	types: Record<string, string>;
}

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
			'Trail running': 'Trail Running'
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
			Radfahren: 'Cycling',
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
			Ciclismo: 'Cycling',
			'Ciclismo su strada': 'Road Cycling',
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
