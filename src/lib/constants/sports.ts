import {
    PersonSimpleRun,
    PersonSimpleBike,
    PersonSimpleSwim,
    PersonSimpleWalk,
    Mountains,
    Barbell,
    PersonSimpleTaiChi,
    Target,
    Heartbeat,
    Waves,
    Anchor,
} from "phosphor-svelte";

// Sport type display names
export const sportNames: Record<string, string> = {
    running: "Running",
    cycling: "Cycling",
    swimming: "Swimming",
    walking: "Walking",
    hiking: "Hiking",
    strength: "Strength",
    yoga: "Yoga",
    paddling: "Paddling",
    rowing: "Rowing",
    cardio: "Cardio",
    other: "Other",
};

// Sport icons mapping (using Phosphor for bold, activity-specific icons)
export const sportIcons: Record<string, typeof PersonSimpleRun> = {
    running: PersonSimpleRun,
    cycling: PersonSimpleBike,
    swimming: PersonSimpleSwim,
    walking: PersonSimpleWalk,
    hiking: Mountains,
    strength: Barbell,
    yoga: PersonSimpleTaiChi,
    paddling: Waves,
    rowing: Anchor,
    cardio: Heartbeat,
    other: Target,
};
export const sportColors = ["#00d4ff", "#00ff88", "#ff6b6b", "#ffd93d", "#c084fc"];
