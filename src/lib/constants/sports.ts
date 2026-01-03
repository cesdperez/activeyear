import {
    PersonSimpleRun,
    PersonSimpleBike,
    PersonSimpleSwim,
    PersonSimpleWalk,
    Mountains,
    Barbell,
    PersonSimpleTaiChi,
    Target,
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
    other: Target,
};
