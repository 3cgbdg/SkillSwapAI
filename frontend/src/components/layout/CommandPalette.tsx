"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import SearchResults from "@/components/layout/headerComponents/SearchResults";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useHeaderSearch } from "@/hooks/useHeaderSearch";
import useFriends from "@/hooks/useFriends";
import { useQueryClient } from "@tanstack/react-query";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { createFriendRequest } = useFriends();
  const {
    word,
    setWord,
    foundUsers,
    foundSkills,
    isPending,
    addLearnSkill,
    removeSkill,
  } = useHeaderSearch();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search skills or users…"
        value={word}
        onValueChange={setWord}
      />
      <CommandList>
        <CommandEmpty>
          {isPending ? "Searching…" : "Type to search or pick a destination."}
        </CommandEmpty>
        {word.length >= 2 &&
        (foundUsers.length > 0 || foundSkills.length > 0) ? (
          <div className="p-2">
            <SearchResults
              foundSkills={foundSkills}
              foundUsers={foundUsers}
              onAddLearn={(skill) => {
                addLearnSkill(skill);
                queryClient.setQueryData(["profile"], (old: unknown) => {
                  if (!old || typeof old !== "object") return old;
                  const profile = old as {
                    skillsToLearn?: { id: string; title: string }[];
                  };
                  return {
                    ...profile,
                    skillsToLearn: [
                      ...(profile.skillsToLearn || []),
                      { id: "temporary-id", title: skill },
                    ],
                  };
                });
              }}
              onCreateFriendRequest={(userId) =>
                createFriendRequest({ id: userId })
              }
              onRemoveSkill={removeSkill}
            />
          </div>
        ) : null}
        <CommandGroup heading="Go to">
          {[
            ["/dashboard", "Home"],
            ["/discover", "Discover"],
            ["/learning", "Learning"],
            ["/schedule", "Schedule"],
            ["/inbox", "Inbox"],
            ["/profile", "Profile"],
          ].map(([href, label]) => (
            <CommandItem
              key={href}
              onSelect={() => {
                setOpen(false);
                router.push(href);
              }}
            >
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
