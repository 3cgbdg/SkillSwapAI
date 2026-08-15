"use client";

import SkillsService from "@/services/SkillsService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export function InlineSkillPicker({
  mode = "learn",
}: {
  mode?: "learn" | "teach";
}) {
  const [value, setValue] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (title: string) =>
      mode === "teach"
        ? SkillsService.addKnownSkill(title)
        : SkillsService.addWantToLearnSkill(title),
    onSuccess: (_, title) => {
      queryClient.setQueryData(["profile"], (old: any) => {
        if (!old) return old;
        const key = mode === "teach" ? "knownSkills" : "skillsToLearn";
        return {
          ...old,
          [key]: [...(old[key] || []), { id: "temporary-id", title }],
        };
      });
      showSuccessToast(
        mode === "teach" ? "Teaching skill added" : "Learning skill added"
      );
      setValue("");
    },
    onError: (err: Error) => showErrorToast(err.message),
  });

  return (
    <form
      className="flex w-full max-w-md flex-col gap-4 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const title = value.trim();
        if (!title) return;
        mutation.mutate(title);
      }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          mode === "teach" ? "Skill you can teach…" : "Skill you want to learn…"
        }
        aria-label={
          mode === "teach" ? "Skill you can teach" : "Skill you want to learn"
        }
      />
      <Button
        type="submit"
        loading={mutation.isPending}
        disabled={!value.trim()}
      >
        Add skill
      </Button>
    </form>
  );
}
