"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, User, Clock, Shield, ShieldAlert } from "lucide-react";

export default function CreateVotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [hostName, setHostName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expireHours, setExpireHours] = useState(24);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = async () => {
    if (!title.trim() || !hostName.trim() || options.some((opt) => !opt.trim())) return;
    setLoading(true);

    try {
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expireHours);

      // 1. Create Poll
      const { data: poll, error: pollError } = await supabase
        .from("polls")
        .insert([{
          title,
          host_name: hostName,
          is_anonymous: isAnonymous,
          expires_at: expiresAt.toISOString(),
          is_active: true
        }])
        .select()
        .single();

      if (pollError) throw pollError;

      // 2. Create Options
      const optionsData = options.map((opt) => ({
        poll_id: poll.id,
        text: opt,
        count: 0,
      }));

      const { error: optionsError } = await supabase
        .from("options")
        .insert(optionsData);

      if (optionsError) throw optionsError;

      // 3. Redirect
      localStorage.setItem(`vote_user_name_${poll.id}`, hostName);
      router.push(`/games/vote/${poll.id}`);
    } catch (error) {
      console.error("Error creating vote:", error);
      alert("Failed to create vote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-10 px-4">
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create a New Vote</h1>
          <p className="text-muted-foreground">Customize your poll settings.</p>
        </div>

        <div className="space-y-6 bg-card border rounded-xl p-6 shadow-sm">

          {/* Host Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2">
                <User size={16} /> Host Nickname <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your nickname"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Question <span className="text-destructive">*</span></label>
              <input
                type="text"
                placeholder="What should we eat for lunch?"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none">Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddOption}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus size={16} /> Add another option
            </button>
          </div>

          <div className="my-4 border-t" />

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Anonymous Toggle */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2">
                {isAnonymous ? <Shield size={16} className="text-primary" /> : <ShieldAlert size={16} className="text-muted-foreground" />}
                Anonymous Voting
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                />
                <label htmlFor="anonymous" className="text-xs text-muted-foreground cursor-pointer select-none">
                  Hide voter identities
                </label>
              </div>
            </div>

            {/* Expiration */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2">
                <Clock size={16} /> Duration
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={expireHours}
                onChange={(e) => setExpireHours(Number(e.target.value))}
              >
                <option value={2}>2 Hours</option>
                <option value={6}>6 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !title.trim() || !hostName.trim() || options.some(opt => !opt.trim())}
            className="w-full flex items-center justify-center h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {loading ? "Creating..." : "Create Vote"}
          </button>
        </div>
      </div>
    </div>
  );
}
