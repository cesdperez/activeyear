import { describe, it, expect } from 'vitest';
import { sportNames, sportIcons } from './sports.js';

describe('sport mappings', () => {
    it('should have all required sport names', () => {
        const required = ['running', 'cycling', 'swimming', 'walking', 'hiking', 'strength', 'yoga', 'paddling', 'rowing', 'cardio', 'other'];
        required.forEach(sport => {
            expect(sportNames[sport]).toBeDefined();
            expect(typeof sportNames[sport]).toBe('string');
        });
    });

    it('should have all required sport icons', () => {
        const required = ['running', 'cycling', 'swimming', 'walking', 'hiking', 'strength', 'yoga', 'paddling', 'rowing', 'cardio', 'other'];
        required.forEach(sport => {
            expect(sportIcons[sport]).toBeDefined();
        });
    });
});
