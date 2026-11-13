import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';
import type { faq as en } from '../en/faq.js';

export const faq: typeof en = {
	items: [
		{
			question: 'Was ist das?',
			answer: `Ein kostenloser Jahresrückblick ${TARGET_YEAR} für Sportlerinnen und Sportler auf Garmin und Strava. Lade deinen Aktivitätenexport hoch und entdecke dein Sportjahr: Gesamtdistanz, Höhenmeter, Zeit und Kalorien, eine Aufteilung nach Sportart, persönliche Rekorde, Highlights und deine längste Serie.`
		},
		{
			question: 'Sind meine Daten privat?',
			answer:
				'Ja. Die Datei wird auf deinem Gerät gelesen und ausgewertet und du brauchst kein Konto. Um die App zu verbessern, erfassen wir einige anonyme Zählwerte, etwa welches Design du exportierst und ob Uploads funktionieren. Keine Cookies, kein Tracking und deine Aktivitätsdaten verlassen nie dein Gerät.'
		},
		{
			question: 'Welche Datei brauche ich?',
			answer: `Die Activities-CSV aus Garmin Connect oder activities.csv aus dem Export deines Strava-Kontos, auf Englisch, Spanisch, Deutsch, Französisch, Italienisch, Niederländisch oder Portugiesisch. Wenn dein Garmin-Konto imperiale Einheiten verwendet, wähle ${upload.imperial} auf der Upload-Seite. Unterstützt werden Laufen, Radfahren, Schwimmen, Gehen, Wandern, Krafttraining, Yoga, Paddeln, Rudern, Cardio, Wintersport, Schlägersport und Klettern.`
		},
		{
			question: 'Was kann ich teilen?',
			answer:
				'Drei Karten im Story-Format (1080 × 1920 PNG): eine Zusammenfassung, eine Aufteilung nach Sportart und deine Highlights, in sechs Stilen: Neon, Minimal, Retro, Classic, Synthwave und Lightmile.'
		},
		{
			question: 'Kann ich meinen Rückblick später wieder öffnen?',
			answer: `Ja. Lade über „${dashboard.saveMyYear}“ auf deinem Dashboard eine kleine .json-Datei herunter und ziehe sie jederzeit in den Upload-Bereich, um den Rückblick wieder zu öffnen. Sie bleibt auf deinem Gerät.`
		},
		{
			question: 'Funktioniert es mit Strava?',
			answer:
				'Ja. Lade activities.csv aus dem Export deines Strava-Kontos hoch (Settings, My Account, Download or Delete Your Account). Strava muss auf Englisch, Spanisch, Deutsch, Französisch, Italienisch, Niederländisch oder Portugiesisch eingestellt sein.'
		},
		{
			question: 'Ist es kostenlos?',
			answer: 'Ja. Ohne Anmeldung und Werbung. Der Code ist auf GitHub quelloffen.',
			tip: {
				text: 'Wenn dir die App gefällt, freue ich mich über ein Trinkgeld:',
				label: 'Spendier mir ein Gel auf Ko-fi'
			}
		}
	],
	garminSteps: [
		{
			text: 'Melde dich an unter',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Gehe zu Activities → All Activities' },
		{ text: `Scrolle nach unten, bis alle Aktivitäten aus ${TARGET_YEAR} geladen sind` },
		{ text: 'Klicke auf Export CSV (Symbol oben rechts)' }
	],
	garminNote:
		'Nutze die Website auf einem Computer. Die Garmin Connect App kann keine Daten exportieren.',
	stravaSteps: [
		{
			text: 'Melde dich an unter',
			link: { href: 'https://www.strava.com/account', label: 'strava.com' }
		},
		{ text: 'Gehe zu Settings → My Account → Download or Delete Your Account' },
		{ text: 'Klicke auf Request your archive' },
		{ text: 'Öffne den Download-Link aus der E-Mail von Strava und entpacke die Datei' },
		{ text: 'Lade activities.csv hoch' }
	],
	stravaNote:
		'Lade nur activities.csv hoch. Strava muss auf Englisch, Spanisch, Deutsch, Französisch, Italienisch, Niederländisch oder Portugiesisch eingestellt sein.',
	heading: 'Fragen',
	guidesAria: 'Wähle deine Datenquelle'
};
