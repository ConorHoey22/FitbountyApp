// AsyncStorage key for a pending single-activity weekly re-plan.
// Set by UpdatePlanIndividualSelectionModal before it sends the user to
// PlanYourWeekScreen: 'cardio' = only re-plan cardio days, 'workouts' = only
// re-plan workout days. PlanYourWeekScreen reads it on every focus (so it works
// however the user arrives, including Home's UserHasWeeklyPlanSetup redirect)
// and clears it once the plan is saved.
export const REPLAN_MODE_KEY = 'replanMode';
