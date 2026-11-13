import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';
import type { faq as en } from '../en/faq.js';

export const faq: typeof en = {
	items: [
		{
			question: 'Qu’est-ce que c’est ?',
			answer: `Un bilan gratuit de ${TARGET_YEAR} pour les sportifs sur Garmin et Strava. Importez vos activités et retrouvez votre année sportive : distance, dénivelé, temps et calories, répartition par sport, records personnels, temps forts et plus longue série.`
		},
		{
			question: 'Mes données restent-elles privées ?',
			answer:
				'Oui. Le fichier est lu et analysé sur votre appareil et aucun compte n’est nécessaire. Nous enregistrons quelques statistiques anonymes, comme le thème que vous exportez et le bon fonctionnement des imports, pour améliorer l’application. Aucun cookie, aucun suivi et vos données d’activité ne quittent jamais votre appareil.'
		},
		{
			question: 'Quel fichier faut-il utiliser ?',
			answer: `Le CSV Activities de Garmin Connect ou activities.csv issu de l’export de votre compte Strava, en anglais, espagnol, allemand, français, italien, néerlandais ou portugais. Si votre compte Garmin utilise les unités impériales, choisissez ${upload.imperial} sur la page d’import. Les activités comprennent la course, le vélo, la natation, la marche, la randonnée, la musculation, le yoga, les sports de pagaie, l’aviron, le cardio, les sports d’hiver, de raquette et l’escalade.`
		},
		{
			question: 'Que puis-je partager ?',
			answer:
				'Trois cartes au format story (PNG 1080 × 1920) : un résumé, une répartition par sport et vos temps forts, en style Neon, Minimal ou Retro.'
		},
		{
			question: 'Puis-je rouvrir mon bilan plus tard ?',
			answer: `Oui. Utilisez ${dashboard.saveMyYear} sur le tableau de bord pour télécharger un petit fichier .json, puis déposez-le dans la zone d’import pour rouvrir le bilan à tout moment. Il reste sur votre appareil.`
		},
		{
			question: 'Est-ce compatible avec Strava ?',
			answer:
				'Oui. Importez activities.csv issu de l’export de votre compte Strava (Settings, My Account, Download or Delete Your Account), avec Strava réglé en anglais, espagnol, allemand, français, italien, néerlandais ou portugais.'
		},
		{
			question: 'Est-ce gratuit ?',
			answer: 'Oui. Sans inscription ni publicité, et le code est open source sur GitHub.',
			tip: {
				text: 'Si l’application vous plaît, vous pouvez laisser un pourboire :',
				label: 'offrez-moi un gel sur Ko-fi'
			}
		}
	],
	garminSteps: [
		{
			text: 'Connectez-vous sur',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Allez dans Activities → All Activities' },
		{
			text: `Faites défiler la page jusqu’au chargement de toutes les activités de ${TARGET_YEAR}`
		},
		{ text: 'Cliquez sur Export CSV (icône en haut à droite)' }
	],
	garminNote:
		'Utilisez le site sur un ordinateur. L’application Garmin Connect ne permet pas l’export.',
	stravaSteps: [
		{
			text: 'Connectez-vous sur',
			link: { href: 'https://www.strava.com/account', label: 'strava.com' }
		},
		{ text: 'Allez dans Settings → My Account → Download or Delete Your Account' },
		{ text: 'Cliquez sur Request your archive' },
		{
			text: 'Ouvrez le lien de téléchargement envoyé par Strava par e-mail et décompressez le fichier'
		},
		{ text: 'Importez activities.csv' }
	],
	stravaNote:
		'Importez uniquement activities.csv. Strava doit être réglé en anglais, espagnol, allemand, français, italien, néerlandais ou portugais.',
	heading: 'Questions',
	guidesAria: 'Choisissez votre source de données'
};
