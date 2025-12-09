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
    signOutProcess: string
    calendar: string
    darkMode: string
    lightMode: string
    autoMode: string
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
  calendar: {
    // Calendar navigation
    goToToday: string
    loadingCalendar: string

    // Day status
    workoutPlanned: string
    workoutCompleted: string
    workoutIncomplete: string
    restDay: string

    // Day actions dialog
    manageWorkout: string
    restDayTitle: string
    restDayDescription: string
    muscleRecovery: string
    activeRest: string
    exercisesScheduled: string
    moreExercises: string

    // Action buttons
    createWorkout: string
    markAsRest: string
    edit: string
    postpone: string
    clearDay: string
    clearing: string

    // Status badges
    completed: string
    incomplete: string
    planned: string
    rest: string

    // Weight and exercise info
    freeWeight: string
    sets: string
    seconds: string

    // Months
    january: string
    february: string
    march: string
    april: string
    may: string
    june: string
    july: string
    august: string
    september: string
    october: string
    november: string
    december: string

    // Days of week (full names)
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string

    // Days of week (short)
    mon: string
    tue: string
    wed: string
    thu: string
    fri: string
    sat: string
    sun: string
  }
  workoutForm: {
    // Main titles
    newWorkout: string
    editWorkout: string
    loadingWorkoutData: string
    savingWorkout: string

    // Messages
    workoutSavedSuccessfully: string
    exerciseCreatedSuccessfully: string
    columnCreatedSuccessfully: string
    columnActivated: string
    columnDeactivated: string
    errorCreatingExercise: string
    errorCreatingColumn: string
    errorSavingWorkout: string
    connectionError: string
    addAtLeastOneExercise: string

    // Buttons
    cancel: string
    save: string
    saving: string
    addExercise: string
    addExerciseShort: string
    columnSettings: string
    columnSettingsShort: string
    exerciseManager: string
    exerciseManagerShort: string

    // Exercise form
    exerciseName: string
    selectExercise: string
    createCustomExercise: string
    muscleGroup: string
    selectMuscleGroup: string
    sets: string
    reps: string
    weight: string
    restTime: string
    notes: string
    edit: string
    bodyweight: string

    // Exercise actions
    saveExercise: string
    editExercise: string
    removeExercise: string
    expandExercise: string
    collapseExercise: string
    markAsCompleted: string
    markAsIncomplete: string

    // Column settings
    columnSettingsTitle: string
    addCustomColumn: string
    columnName: string
    columnType: string
    text: string
    number: string
    boolean: string
    addColumn: string
    activeColumns: string
    inactiveColumns: string
    activate: string
    deactivate: string
    close: string

    // Exercise manager
    exerciseManagerTitle: string
    addNewExercise: string
    editExerciseTitle: string
    deleteExercise: string
    confirmDeleteExercise: string
    exerciseDeletedSuccessfully: string
    errorDeletingExercise: string

    // Toolbar
    exercisesCount: string
    activeColumnsCount: string

    // Drag and drop
    dragToReorder: string

    // Set records
    setNumber: string
    completed: string
    incomplete: string
    addSet: string
    removeSet: string

    // Validation
    exerciseNameRequired: string
    muscleGroupRequired: string
    setsRequired: string
    repsRequired: string
    invalidNumber: string
    minimumValue: string
    maximumValue: string
  }
  postponeDialog: {
    title: string
    subtitle: string
    currentWorkout: string
    exercisesScheduled: string
    postponeBy: string
    newDate: string
    postponeMode: string
    singleWorkout: string
    singleWorkoutDescription: string
    allFollowing: string
    allFollowingDescription: string
    cancel: string
    postpone: string
    postponing: string
    daysMinimum: string
    postponedSuccessfully: string
    errorPostponing: string
    connectionErrorPostponing: string
  }
  exerciseManager: {
    title: string
    titleShort: string
    createNewExercise: string
    exerciseName: string
    exerciseNamePlaceholder: string
    muscleGroup: string
    muscleGroupRequired: string
    selectMuscleGroup: string
    createExercise: string
    yourCustomExercises: string
    yourCustomExercisesShort: string
    noCustomExercises: string
    createOneAbove: string
    createdDate: string
    exerciseCreatedSuccessfully: string
    exerciseUpdatedSuccessfully: string
    exerciseDeletedSuccessfully: string
    errorCreatingExercise: string
    errorUpdatingExercise: string
    errorDeletingExercise: string
    confirmDelete: string
  }
  columnSettings: {
    title: string
    titleShort: string
    createNewColumn: string
    columnName: string
    columnNamePlaceholder: string
    dataType: string
    text: string
    number: string
    boolean: string
    createColumn: string
    availableColumns: string
    toggleDescription: string
    noCustomColumns: string
    active: string
    inactive: string
    close: string
    deleteColumn: string
    confirmDeleteTitle: string
    confirmDeleteMessage: string
    confirmDeleteWarning: string
    confirmDelete: string
    cancelDelete: string
  }
  defaultExercises: {
    [key: string]: string
  }
  exerciseHistory: {
    personalRecord: string
    maxWeight: string
    achievedOn: string
    vsAnterior: string
    noRecordYet: string
    comparedToLastWorkout: string
    comparedWith: string
    weight: string
    reps: string
    setsCompleted: string
    same: string
    weightProgress: string
    recentWorkouts: string
    noHistoryYet: string
    incomplete: string
    bodyweight: string
    sets: string
    prDay: string
    bodyweightExercise: string
    historyButton: string
  }
}
