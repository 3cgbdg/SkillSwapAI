"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import SearchResults from "./SearchResults";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FoundSkills, FoundUsers } from "@/types/common";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  word: string;
  foundUsers: FoundUsers[];
  foundSkills: FoundSkills[];
  onWordChange: (value: string) => void;
  onSearch: (chars: string) => Promise<void>;
  onAddLearn: (skill: string, skillId: string) => void;
  onCreateFriendRequest: (userId: string) => void;
  onRemoveSkill: (skillId: string) => void;
  isPending: boolean;
}

const SearchInput = ({
  word,
  isPending,
  foundUsers,
  foundSkills,
  onWordChange,
  onSearch,
  onAddLearn,
  onCreateFriendRequest,
  onRemoveSkill,
}: SearchInputProps) => {
  const [focused, setFocused] = useState(false);
  const showResults = focused && word.length >= 2;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onWordChange(value);
    if (value.length >= 2) {
      await onSearch(value);
    }
  };

  const clear = () => {
    onWordChange("");
    setFocused(false);
  };

  return (
    <div className="relative hidden items-center gap-2 md:flex">
      <Search className="text-muted-foreground size-5 shrink-0" aria-hidden />
      <Input
        value={word}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        type="search"
        className="min-w-[220px]"
        placeholder="Search for skills or users..."
        aria-label="Search for skills or users"
      />
      {word ? (
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
          onClick={clear}
        >
          <X className="size-5" />
        </button>
      ) : null}
      {showResults ? (
        <div
          className={cn(
            "border-border bg-popover absolute top-full left-0 z-[var(--z-dropdown)] mt-2 flex max-h-64 min-w-[280px] flex-col overflow-auto rounded-lg border p-3 shadow-md"
          )}
        >
          {isPending ? (
            <Spinner size="md" className="mx-auto" />
          ) : (
            <SearchResults
              foundSkills={foundSkills}
              foundUsers={foundUsers}
              onAddLearn={onAddLearn}
              onCreateFriendRequest={onCreateFriendRequest}
              onRemoveSkill={onRemoveSkill}
            />
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SearchInput;
