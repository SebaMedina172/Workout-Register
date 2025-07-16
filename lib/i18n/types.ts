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
}
