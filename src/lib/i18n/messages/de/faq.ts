import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';
import type { faq as en } from '../en/faq.js';

export const faq: typeof en = {
	items: [
		{
			question: 'Was ist das?',
			answer: `Ein kostenloser Jahresrückblick ${TARGET_YEAR} für Garmin und Strava. Lade deinen Aktivitätenexport hoch und sieh deine Distanz, Höhenmeter, Zeit, Sportarten, Rekorde und längste Serie.`
		},
		{
			question: 'Sind meine Daten privat?',
			answer:
				'Ja. Deine Datei wird auf deinem Gerät gelesen und verlässt es nie. Kein Konto, keine Cookies, kein Tracking. Wir erfassen nur einige anonyme Ereignisse, etwa welches Design du exportierst, um die App zu verbessern.'
		},
		{
			question: 'Welche Datei brauche ich?',
			answer: `Die Activities-CSV aus Garmin Connect oder activities.csv aus deinem Strava-Export. Wenn du eine Garmin-Datei hochlädst, wählst du danach die Einheiten deines Kontos: ${upload.metric} oder ${upload.imperial}.`
		},
		{
			question: 'Was kann ich teilen?',
			answer:
				'Drei Karten im Story-Format: eine Zusammenfassung, deine Sportarten und deine Highlights, in sechs Stilen: Neon, Minimal, Retro, Classic, Synthwave und Lightmile.'
		},
		{
			question: 'Kann ich meinen Rückblick später wieder öffnen?',
			answer: `Ja. Lade über „${dashboard.saveMyYear}“ auf deinem Dashboard eine kleine .json-Datei herunter. Ziehe sie in den Upload-Bereich, um den Rückblick wieder zu öffnen.`
		},
		{
			question: 'Funktioniert es mit Strava?',
			answer:
				'Ja. Fordere deinen Kontoexport in den Strava-Einstellungen an und lade dann activities.csv daraus hoch.'
		},
		{
			question: 'Ist es kostenlos?',
			answer: 'Ja. Ohne Anmeldung und Werbung. Der Code ist auf GitHub quelloffen.'
		}
	],
	garminSteps: [
		{
			text: 'Melde dich im Browser auf einem Computer (nicht in der App) an unter',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Gehe zu Aktivitäten → Alle Aktivitäten' },
		{ text: `Scrolle nach unten, bis alle Aktivitäten aus ${TARGET_YEAR} geladen sind` },
		{
			text: 'Klicke oben rechts auf „Export CSV“ (CSV exportieren). Die Datei wird sofort heruntergeladen.'
		}
	],
	garminNote:
		'Den vollständigen Datenexport von Garmin brauchst du nicht, er dauert Tage und enthält eine andere Datei.',
	stravaSteps: [
		{
			text: 'Melde dich im Browser auf einem Computer (nicht in der App) an unter',
			link: { href: 'https://www.strava.com/account', label: 'strava.com' }
		},
		{
			text: 'Klicke unter „Download or Delete Your Account“ (Konto herunterladen oder löschen) auf „Get Started“ (Los geht’s) und dann auf „Request your archive“ (Archiv anfordern)'
		},
		{
			text: 'Warte auf die E-Mail mit dem Download-Link. Sie kommt meist innerhalb weniger Stunden.'
		},
		{ text: 'Entpacke die Datei und lade activities.csv hoch' }
	],
	stravaNote:
		'Strava muss auf Englisch, Spanisch, Deutsch, Französisch, Italienisch, Niederländisch oder Portugiesisch eingestellt sein.',
	heading: 'Fragen',
	guidesAria: 'Wähle deine Datenquelle'
};
