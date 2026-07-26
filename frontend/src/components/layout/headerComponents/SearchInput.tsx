"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import SearchResults from "./SearchResults";
import { FloatingPanelSurface } from "@/components/composites/FloatingPanel";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FoundSkills, FoundUsers } from "@/types/common";

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
        className="bg-muted/30 border-border min-w-[220px] rounded-lg"
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
        <FloatingPanelSurface className="absolute top-full left-0 mt-2 max-h-64 min-w-[280px] rounded-lg p-3">
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
        </FloatingPanelSurface>
      ) : null}
    </div>
  );
};

export default SearchInput;
