"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import SearchResults from "./SearchResults";
import { FloatingPanelSurface } from "@/components/composites/FloatingPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FoundSkills, FoundUsers } from "@/types/common";

interface SearchInputMobileProps {
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

const SearchInputMobile = ({
  word,
  isPending,
  foundUsers,
  foundSkills,
  onWordChange,
  onSearch,
  onAddLearn,
  onCreateFriendRequest,
  onRemoveSkill,
}: SearchInputMobileProps) => {
  const [open, setOpen] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onWordChange(value);
    if (value.length >= 2) {
      await onSearch(value);
    }
  };

  const close = () => {
    setOpen(false);
    onWordChange("");
  };

  return (
    <div className="relative md:hidden">
      {open ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close search"
          onClick={close}
        >
          <X className="size-6" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open search"
          onClick={() => setOpen(true)}
        >
          <Search className="size-6" />
        </Button>
      )}
      {open ? (
        <FloatingPanelSurface className="absolute top-full right-0 left-0 mt-2 gap-3 p-4">
          <Input
            value={word}
            onChange={handleChange}
            placeholder="Search for skills or users..."
            aria-label="Search for skills or users"
            autoFocus
          />
          {word.length >= 2 ? (
            <div className="max-h-64 overflow-auto">
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
        </FloatingPanelSurface>
      ) : null}
    </div>
  );
};

export default SearchInputMobile;
