"use client";

import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import SkillsService from "@/services/SkillsService";
import { showErrorToast } from "@/utils/toast";
import { cn } from "@/lib/utils";

type SkillPickerProps = {
  label: string;
  placeholder: string;
  skills: string[];
  onChange: (skills: string[]) => void;
  badgeVariant: "teach" | "learn";
  error?: string;
};

export function SkillPicker({
  label,
  placeholder,
  skills,
  onChange,
  badgeVariant,
  error,
}: SkillPickerProps) {
  const [query, setQuery] = useState("");

  const {
    mutate: searchSkills,
    isPending,
    data: suggestions = [],
  } = useMutation({
    mutationFn: async (chars: string) => SkillsService.getSkills(chars),
    onError: (err: Error) => showErrorToast(err.message),
  });

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    onChange([...skills, trimmed]);
    setQuery("");
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((item) => item !== skill));
  };

  const showSuggestions = query.length >= 2;

  return (
    <Field label={label} error={error}>
      <div className="relative flex gap-2">
        <Input
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (value.length >= 2) {
              searchSkills(value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill(query);
            }
          }}
        />
        <Button type="button" onClick={() => addSkill(query)}>
          Add
        </Button>
        {showSuggestions ? (
          <div
            className={cn(
              "border-border bg-popover absolute top-full left-0 z-[var(--z-dropdown)] mt-1 max-h-48 w-full overflow-y-auto rounded-lg border p-2 shadow-md"
            )}
          >
            {isPending ? (
              <div className="flex justify-center p-2">
                <Spinner size="sm" />
              </div>
            ) : suggestions.length > 0 ? (
              <div className="flex flex-col gap-1">
                {suggestions.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    className="hover:bg-muted rounded-md px-2 py-1.5 text-left text-sm"
                    onClick={() => addSkill(skill.title)}
                  >
                    {skill.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground p-2 text-sm">
                No skills found
              </p>
            )}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant={badgeVariant} className="gap-1 pr-1">
            {skill}
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              className="hover:text-destructive rounded-full p-0.5"
              onClick={() => removeSkill(skill)}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
    </Field>
  );
}
