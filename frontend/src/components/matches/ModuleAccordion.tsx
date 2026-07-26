"use client";

import PlansService from "@/services/PlansService";
import { IGeneratedModule } from "@/types/plan";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const ModuleAccordion = ({
  module,
  planId,
  itemValue,
}: {
  planId: string;
  module: IGeneratedModule;
  itemValue: string;
}) => {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const completed = module.status !== "INPROGRESS";

  const { mutate: setModuleStatusToCompleted } = useMutation({
    mutationFn: async () => {
      const res = await PlansService.setModuleStatusToCompleted(
        planId,
        module.id
      );
      return res;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["plans", id] });
      const previous = queryClient.getQueryData(["plans", id]);
      queryClient.setQueryData(
        ["plans", id],
        (old: { modules?: IGeneratedModule[] } | undefined) => {
          if (!old?.modules) return old;
          return {
            ...old,
            modules: old.modules.map((m) =>
              m.id === module.id ? { ...m, status: "COMPLETED" as const } : m
            ),
          };
        }
      );
      return { previous };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["plans", id] });
      queryClient.invalidateQueries({ queryKey: ["matches", id] });
      showSuccessToast(
        data.message || "Module complete — nice work on your skill swap!"
      );
    },
    onError: (err: Error, _v, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["plans", id], context.previous);
      }
      showErrorToast(err.message);
    },
  });

  return (
    <AccordionItem
      value={itemValue}
      className="rounded-[10px] border border-border bg-muted/40 px-4"
    >
      <AccordionTrigger className="min-h-[94px] py-4 hover:no-underline">
        <div className="flex w-full flex-row items-start justify-between gap-2 sm:items-center">
          <div className="flex max-w-[280px] flex-col gap-2 sm:max-w-[450px] sm:gap-4">
            <div className="flex items-start gap-2 sm:items-center sm:gap-4">
              <Checkbox checked={completed} disabled className="mt-1 sm:mt-0" />
              <h3 className="break-words text-sm font-semibold leading-5 sm:text-lg sm:leading-7">
                {module.title}
              </h3>
            </div>
            <Badge
              variant={completed ? "default" : "secondary"}
              className={cn(
                "w-fit sm:hidden",
                !completed && "text-muted-foreground"
              )}
            >
              {completed ? "Completed" : "In Progress"}
            </Badge>
          </div>
          <Badge
            variant={completed ? "default" : "secondary"}
            className={cn(
              "hidden sm:inline-flex",
              !completed && "text-muted-foreground"
            )}
          >
            {completed ? "Completed" : "In Progress"}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 pb-4">
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold">Objectives:</h4>
          <div>
            {module.objectives.map((objective, objectiveIdx) => (
              <p
                key={`${module.id}-objective-${objectiveIdx}`}
                className="text-sm leading-5 text-muted-foreground"
              >
                {objective}
              </p>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold">Activities:</h4>
          <div>
            {module.activities.map((activity, activityIdx) => (
              <p
                key={`${module.id}-activity-${activityIdx}`}
                className="text-sm leading-5 text-muted-foreground"
              >
                {activity}
              </p>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={16} />
          <div className="flex items-center gap-[7px]">
            <span className="font-semibold text-foreground">Timeline:</span>
            <span>{module.timeline} weeks</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold">Resources:</h4>
          <div className="flex flex-col gap-1">
            {module.resources.map((resource) => (
              <div key={resource.id}>
                <Link
                  target="_blank"
                  href={resource.link}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                >
                  <span>{resource.title}</span>
                  <LinkIcon size={12} />
                </Link>
                <p className="text-sm leading-5 text-muted-foreground">
                  {resource.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        {module.status == "INPROGRESS" && (
          <Button
            type="button"
            className="w-fit"
            onClick={() => setModuleStatusToCompleted()}
          >
            Set to completed
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default ModuleAccordion;
