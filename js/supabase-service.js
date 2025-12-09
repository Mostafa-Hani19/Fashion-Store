// Supabase Service
class SupabaseService {
    static client = null;

    static async initialize() {
        if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
            console.error('Supabase configuration missing');
            return;
        }

        const { createClient } = supabase;
        this.client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }

    static getClient() {
        if (!this.client) {
            throw new Error('Supabase not initialized. Call initialize() first.');
        }
        return this.client;
    }
}

