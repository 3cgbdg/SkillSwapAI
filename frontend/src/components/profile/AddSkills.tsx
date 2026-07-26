"use client";

import SkillsService from "@/services/SkillsService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { showErrorToast } from "@/utils/toast";
import { Spinner } from "@/components/ui/spinner";
import useProfile from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const AddSkills = () => {
  const [wantToLearnInput, setWantToLearnInput] = useState<string>("");
  const [knownInput, setKnownInput] = useState<string>("");
  const { data: user } = useProfile();
  const queryClient = useQueryClient();
  const [knownSuggestions, setKnownSuggestions] = useState<
    { id: string; title: string }[]
  >([]);
  const [learnSuggestions, setLearnSuggestions] = useState<
    { id: string; title: string }[]
  >([]);

  const knownSearchMutation = useMutation({
    mutationFn: async (data: string) => SkillsService.getSkills(data),
    onSuccess: (data) => setKnownSuggestions(data),
    onError: (err: Error) => showErrorToast(err.message),
  });

  const learnSearchMutation = useMutation({
    mutationFn: async (data: string) => SkillsService.getSkills(data),
    onSuccess: (data) => setLearnSuggestions(data),
    onError: (err: Error) => showErrorToast(err.message),
  });

  const mutationAddKnown = useMutation({
    mutationFn: async (str: string) => SkillsService.addKnownSkill(str),
    onSuccess: (_, title) => {
      queryClient.setQueryData(["profile"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          knownSkills: [
            ...(old.knownSkills || []),
            { id: "temporary-id", title },
          ],
        };
      });
    },
    onError: (err: Error) => showErrorToast(err.message),
  });

  const mutationAddLearn = useMutation({
    mutationFn: async (str: string) => SkillsService.addWantToLearnSkill(str),
    onSuccess: (_, title) => {
      queryClient.setQueryData(["profile"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          skillsToLearn: [
            ...(old.skillsToLearn || []),
            { id: "temporary-id", title },
          ],
        };
      });
    },
    onError: (err: Error) => showErrorToast(err.message),
  });

  const mutationDeleteKnown = useMutation({
    mutationFn: async (str: string) => SkillsService.deleteKnownSkill(str),
    onSuccess: (_, title) => {
      queryClient.setQueryData(["profile"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          knownSkills: old.knownSkills?.filter((s: any) => s.title !== title),
        };
      });
    },
    onError: (err: Error) => showErrorToast(err.message),
  });

  const mutationDeleteLearn = useMutation({
    mutationFn: async (str: string) =>
      SkillsService.deleteWantToLearnSkill(str),
    onSuccess: (_, title) => {
      queryClient.setQueryData(["profile"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          skillsToLearn: old.skillsToLearn?.filter(
            (s: any) => s.title !== title
          ),
        };
      });
    },
    onError: (err: Error) => showErrorToast(err.message),
  });

  const knownRef = useRef<HTMLInputElement>(null);
  const learnRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="flex flex-col p-6 pt-[21px]">
        <CardHeader className="mb-4 p-0">
          <CardTitle className="text-2xl leading-6">Skills I Know</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-0">
          <div className="mb-6 flex max-h-[170px] flex-wrap gap-2 overflow-y-auto">
            {user?.knownSkills && user.knownSkills.length > 0 ? (
              user.knownSkills.map((skill) => (
                <Badge key={skill.id} variant="teach" className="gap-2 py-2">
                  {skill.title}
                  <button
                    type="button"
                    onClick={() => mutationDeleteKnown.mutate(skill.title)}
                    className="cursor-pointer outline-none transition-colors hover:text-primary"
                    aria-label={`Remove ${skill.title}`}
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="font-medium leading-5">No skills yet</span>
            )}
          </div>
          <div className="relative flex items-center gap-2">
            <Input
              ref={knownRef}
              onChange={(e) => {
                setKnownInput(e.target.value);
                if (e.target.value.length > 2) {
                  knownSearchMutation.mutate(e.target.value);
                }
              }}
              placeholder="Add a skill you know..."
              type="text"
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              size="icon"
              className="shrink-0"
              onClick={() => {
                mutationAddKnown.mutate(knownInput);
                if (knownRef.current) knownRef.current.value = "";
                setKnownInput("");
              }}
            >
              <Plus />
            </Button>
            {knownInput.length > 2 && knownRef.current?.value !== "" && (
              <div className="absolute left-0 top-full z-10">
                <Card className="mt-1 max-h-60 w-full max-w-[90vw] gap-1 p-2 sm:max-w-[350px]">
                  {!knownSearchMutation.isPending ? (
                    knownSuggestions.length > 0 ? (
                      <div className="flex flex-wrap gap-1 overflow-y-auto">
                        {knownSuggestions.map((skill) => (
                          <Button
                            type="button"
                            key={skill.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              mutationAddKnown.mutate(skill.title);
                              if (knownRef.current) knownRef.current.value = "";
                              setKnownInput("");
                            }}
                          >
                            {skill.title}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Empty
                      </span>
                    )
                  ) : (
                    <Spinner size="md" />
                  )}
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col p-6 pt-[21px]">
        <CardHeader className="mb-4 p-0">
          <CardTitle className="text-2xl leading-6">
            Skills I Want to Learn
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-0">
          <div className="mb-6 flex max-h-[170px] flex-wrap gap-2 overflow-y-auto">
            {user?.skillsToLearn && user.skillsToLearn.length > 0 ? (
              user.skillsToLearn.map((skill) => (
                <Badge key={skill.id} variant="learn" className="gap-2 py-2">
                  {skill.title}
                  <button
                    type="button"
                    onClick={() => mutationDeleteLearn.mutate(skill.title)}
                    className="cursor-pointer outline-none transition-colors hover:text-primary"
                    aria-label={`Remove ${skill.title}`}
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="font-medium leading-5">No skills yet</span>
            )}
          </div>
          <div className="relative flex items-center gap-2">
            <Input
              ref={learnRef}
              onChange={(e) => {
                setWantToLearnInput(e.target.value);
                if (e.target.value.length > 2) {
                  learnSearchMutation.mutate(e.target.value);
                }
              }}
              placeholder="Add a skill you want to learn..."
              type="text"
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              size="icon"
              className="shrink-0"
              onClick={() => {
                mutationAddLearn.mutate(wantToLearnInput);
                if (learnRef.current) learnRef.current.value = "";
                setWantToLearnInput("");
              }}
            >
              <Plus />
            </Button>
            {wantToLearnInput.length > 2 && learnRef.current?.value !== "" && (
              <div className="absolute left-0 top-full z-10">
                <Card className="mt-1 max-h-60 w-full max-w-[90vw] gap-1 p-2 sm:max-w-[350px]">
                  {!learnSearchMutation.isPending ? (
                    learnSuggestions.length > 0 ? (
                      <div className="flex flex-wrap gap-1 overflow-y-auto">
                        {learnSuggestions.map((skill) => (
                          <Button
                            type="button"
                            key={skill.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              mutationAddLearn.mutate(skill.title);
                              if (learnRef.current) learnRef.current.value = "";
                              setWantToLearnInput("");
                            }}
                          >
                            {skill.title}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Empty
                      </span>
                    )
                  ) : (
                    <Spinner size="md" />
                  )}
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddSkills;
