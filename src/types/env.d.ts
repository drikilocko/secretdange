declare namespace NodeJS {
    interface ProcessEnv {
        readonly EXPO_PUBLIC_SUPABASE_URL: string;
        readonly EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
    }
}

declare module '*.jpeg' {
    const value: any;
    export default value;
}

declare module '*.jpg' {
    const value: any;
    export default value;
}

declare module '*.png' {
    const value: any;
    export default value;
}
