const SUPABASE_URL = 'https://fokkqhiypuvnxgzooxyg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZva2txaGl5cHV2bnhnem9veHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0Mzk4MDAsImV4cCI6MjA4MzAxNTgwMH0.Z-LfrthW2BeQ2am2uPsRyxCmwQs_qNN1aZ5sFLtStKc';

// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Helpers
async function signUp(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    return { data, error };
}

async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    return { data, error };
}

async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
}

async function getSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    return data.session;
}

// Data Helpers
async function fetchConfigs() {
    const { data, error } = await supabaseClient
        .from('api_configs')
        .select('*')
        .order('created_at', { ascending: true });
    return { data, error };
}

async function saveConfig(config) {
    const session = await getSession();
    if (!session) return { error: 'Not authenticated' };

    const configData = {
        ...config,
        user_id: session.user.id,
        updated_at: new Date()
    };

    if (config.id) {
        const { data, error } = await supabaseClient
            .from('api_configs')
            .update(configData)
            .eq('id', config.id)
            .select();
        return { data, error };
    } else {
        const { data, error } = await supabaseClient
            .from('api_configs')
            .insert([configData])
            .select();
        return { data, error };
    }
}

async function deleteConfig(id) {
    const { error } = await supabaseClient
        .from('api_configs')
        .delete()
        .eq('id', id);
    return { error };
}

async function setActiveConfig(id) {
    // First, set all to inactive
    const session = await getSession();
    await supabaseClient
        .from('api_configs')
        .update({ is_active: false })
        .eq('user_id', session.user.id);

    // Then set the chosen one to active
    const { data, error } = await supabaseClient
        .from('api_configs')
        .update({ is_active: true })
        .eq('id', id)
        .select();
    return { data, error };
}
