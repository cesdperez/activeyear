import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';
import type { faq as en } from '../en/faq.js';

export const faq: typeof en = {
	items: [
		{
			question: 'Qu’est-ce que c’est ?',
			answer: `Un bilan gratuit de ${TARGET_YEAR} pour Garmin et Strava. Importez votre export d’activités pour voir votre distance, dénivelé, temps, sports, records et plus longue série.`
		},
		{
			question: 'Mes données restent-elles privées ?',
			answer:
				'Oui. Votre fichier est lu sur votre appareil et ne le quitte jamais. Aucun compte, cookie ni suivi. Nous comptons seulement quelques événements anonymes, comme le thème que vous exportez, pour améliorer l’application.'
		},
		{
			question: 'Quel fichier faut-il utiliser ?',
			answer: `Le CSV Activities de Garmin Connect ou activities.csv de votre export Strava. Si vous importez un fichier Garmin, vous choisissez ensuite si votre compte utilise les unités ${upload.metric} ou ${upload.imperial}.`
		},
		{
			question: 'Que puis-je partager ?',
			answer:
				'Trois cartes au format story : un résumé, vos sports et vos temps forts, en six styles : Neon, Minimal, Retro, Classic, Synthwave et Lightmile.'
		},
		{
			question: 'Puis-je rouvrir mon bilan plus tard ?',
			answer: `Oui. Utilisez ${dashboard.saveMyYear} sur le tableau de bord pour télécharger un petit fichier .json. Déposez-le dans la zone d’import pour rouvrir votre bilan.`
		},
		{
			question: 'Est-ce compatible avec Strava ?',
			answer:
				'Oui. Demandez l’export de votre compte dans les paramètres Strava, puis importez son fichier activities.csv.'
		},
		{
			question: 'Est-ce gratuit ?',
			answer: 'Oui. Sans inscription ni publicité, et le code est open source sur GitHub.'
		}
	],
	garminSteps: [
		{
			text: 'Dans un navigateur sur ordinateur (pas l’application), connectez-vous sur',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Allez dans Activités → Toutes les activités' },
		{
			text: `Faites défiler la page jusqu’au chargement de toutes les activités de ${TARGET_YEAR}`
		},
		{
			text: 'Cliquez sur « Export CSV » (Exporter en CSV), en haut à droite. Le fichier se télécharge aussitôt.'
		}
	],
	garminNote:
		'Inutile de demander l’export complet des données Garmin : il prend des jours et contient un autre fichier.',
	stravaSteps: [
		{
			text: 'Dans un navigateur sur ordinateur (pas l’application), connectez-vous sur',
			link: { href: 'https://www.strava.com/account', label: 'strava.com' }
		},
		{
			text: 'Sous « Download or Delete Your Account » (Télécharger ou supprimer votre compte), cliquez sur « Get Started » (Commencer), puis sur « Request your archive » (Demander votre archive)'
		},
		{
			text: 'Attendez l’e-mail avec le lien de téléchargement. Il arrive en général en quelques heures.'
		},
		{ text: 'Décompressez le fichier et importez activities.csv' }
	],
	stravaNote:
		'Strava doit être réglé en anglais, espagnol, allemand, français, italien, néerlandais ou portugais.',
	heading: 'Questions',
	guidesAria: 'Choisissez votre source de données'
};
