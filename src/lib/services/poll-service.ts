import { supabase } from "../supabase";

export interface Poll {
  id: string;
  title: string;
  host_name: string;
  is_anonymous: boolean;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface Option {
  id: string;
  poll_id: string;
  text: string;
  count: number;
}

export const pollService = {
  async createPoll(data: {
    title: string;
    hostName: string;
    isAnonymous: boolean;
    expireHours: number;
    options: string[];
  }) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + data.expireHours);

    // 1. Create Poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert([{
        title: data.title,
        host_name: data.hostName,
        is_anonymous: data.isAnonymous,
        expires_at: expiresAt.toISOString(),
        is_active: true
      }])
      .select()
      .single();

    if (pollError) throw pollError;

    // 2. Create Options
    const optionsData = data.options.map((opt) => ({
      poll_id: poll.id,
      text: opt,
      count: 0,
    }));

    const { error: optionsError } = await supabase
      .from("options")
      .insert(optionsData);

    if (optionsError) throw optionsError;

    return poll;
  },

  async getPoll(id: string) {
    const { data, error } = await supabase
      .from("polls")
      .select("*, options(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Add more methods here as needed for voting, etc.
};
