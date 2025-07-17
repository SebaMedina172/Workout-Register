export type Language = "es" | "en"

export interface Translations {
  auth: {
    appTitle: string
    appDescription: string
    customRoutines: string
    progressTracking: string
    detailedStats: string
    accessYourAccount: string
    welcome: string
    signInToAccount: string
    continueWithGoogle: string
    orContinueWithEmail: string
    signIn: string
    signUp: string
    email: string
    password: string
    confirmPassword: string
    emailRequired: string
    validEmailRequired: string
    passwordRequired: string
    passwordMinLength: string
    confirmPasswordRequired: string
    passwordsDontMatch: string
    welcomeBack: string
    unexpectedSignInError: string
    accountCreatedSuccess: string
    unexpectedSignUpError: string
    googleConnectionError: string
    signingIn: string
    creatingAccount: string
    createAccount: string
    passwordRequirements: string
    atLeast6Characters: string
    passwordsMatch: string
    termsAndPrivacy: string
  }
  stats: {
    statistics: string
    calendar: string
    back: string
    weeklyProgressAnalysis: string
    trainingDays: string
    restDays: string
    unregistered: string
    missedDays: string
    planCompliance: string
    trainingTime: string
    consistency: string
    ofTotalDays: string
    scheduledCorrectly: string
    unplannedDays: string
    plannedButNotExecuted: string
    plannedVsExecuted: string
    estimatedMinutes: string
    daysWithRegisteredActivity: string
    excellent: string
    good: string
    improve: string
    setsByMuscleGroup: string
    distribution: string
    notWorked: string
    totalSets: string
    sets: string
    percentage: string
    weeklyProgress: string
    completed: string
    rest: string
    planned: string
    missed: string
    scheduledDay: string
    toComplete: string
    notCompleted: string
    unplanned: string
    weekOf: string
    today: string
    loadingStats: string
    statsLoaded: string
    errorLoadingStats: string
    error: string
    mon: string
    tue: string
    wed: string
    thu: string
    fri: string
    sat: string
    sun: string
  }
  navigation: {
    signOut: string
    calendar: string
  }
  muscleGroups: {
    Pecho: string
    Espalda: string
    "Deltoides anterior": string
    "Deltoides medio": string
    "Deltoides posterior": string
    Bíceps: string
    Tríceps: string
    Antebrazos: string
    Cuádriceps: string
    Isquiotibiales: string
    Glúteo: string
    Gemelos: string
    Abductores: string
    Abdominales: string
    Oblicuos: string
  }
}
