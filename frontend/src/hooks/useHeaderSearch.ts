"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import SearchService from "@/services/SearchService";
import SkillsService from "@/services/SkillsService";
import { Found, FoundSkills, FoundUsers } from "@/types/common";
import { showErrorToast } from "@/utils/toast";

export function useHeaderSearch() {
  const [word, setWord] = useState("");
  const [foundUsers, setFoundUsers] = useState<FoundUsers[]>([]);
  const [foundSkills, setFoundSkills] = useState<FoundSkills[]>([]);

  const mutationSearch = useMutation({
    mutationFn: async (chars: string) => {
      const res = await SearchService.searchUsersAndSkillsByChars(chars);
      return res as Found[];
    },
    onSuccess: (data) => {
      setFoundUsers(data.filter((item) => item.name !== undefined));
      setFoundSkills(data.filter((item) => item.title !== undefined));
    },
    onError: (err: Error) => showErrorToast(err.message),
  });

  const search = useCallback(
    async (chars: string) => {
      if (chars.length < 2) {
        setFoundUsers([]);
        setFoundSkills([]);
        return;
      }
      await mutationSearch.mutateAsync(chars);
    },
    // mutationSearch itself is a new object every render; depending on it
    // recreates `search` every render and loops the effect below forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutationSearch.mutateAsync]
  );

  useEffect(() => {
    void search(word);
  }, [word, search]);

  const mutationAddLearn = useMutation({
    mutationFn: async (str: string) => SkillsService.addWantToLearnSkill(str),
    onError: (err: Error) => showErrorToast(err.message),
  });

  return {
    word,
    setWord,
    foundUsers,
    foundSkills,
    isPending: mutationSearch.isPending,
    search,
    addLearnSkill: (skill: string) => mutationAddLearn.mutate(skill),
    removeSkill: (skillId: string) =>
      setFoundSkills((prev) => prev.filter((item) => item.id !== skillId)),
  };
}
