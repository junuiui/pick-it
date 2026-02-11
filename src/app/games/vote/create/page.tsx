"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, User, Clock, Shield, ShieldAlert } from "lucide-react";
import { pollService } from "@/lib/services/poll-service";
import { useUserStore } from "@/lib/stores/useUserStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function CreateVotePage() {
  const router = useRouter();
  const { nickname, setNickname } = useUserStore();
  const [title, setTitle] = useState("");
  const [hostName, setHostName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expireHours, setExpireHours] = useState(24);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);

  // Sync store nickname to local state on mount
  useEffect(() => {
    if (nickname) setHostName(nickname);
  }, [nickname]);

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
      // 1. Persist host nickname
      setNickname(hostName);

      // 2. Create Poll via service layer
      const poll = await pollService.createPoll({
        title,
        hostName,
        isAnonymous,
        expireHours,
        options
      });

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

  const isValid = title.trim() && hostName.trim() && options.every(opt => opt.trim());

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-10 px-4">
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create a New Vote</h1>
          <p className="text-muted-foreground">Customize your poll settings.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Poll Details</CardTitle>
            <CardDescription>Enter your nickname and the question you want to ask.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Host Info */}
            <div className="space-y-4">
              <Input
                label="Host Nickname *"
                placeholder="Enter your nickname"
                leftIcon={<User size={16} />}
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
              />

              <Input
                label="Question *"
                placeholder="What should we eat for lunch?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">Options</label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      className="shrink-0"
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddOption}
                leftIcon={<Plus size={16} />}
                className="w-fit"
              >
                Add another option
              </Button>
            </div>

            <div className="my-4 border-t" />

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            <Button
              className="w-full"
              onClick={handleCreate}
              isLoading={loading}
              disabled={!isValid}
              size="lg"
            >
              {loading ? "Creating..." : "Create Vote"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
