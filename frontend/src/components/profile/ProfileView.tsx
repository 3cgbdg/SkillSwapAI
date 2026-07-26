"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";

export type ProfileViewData = {
  name: string;
  imageUrl?: string | null;
  bio?: string | null;
  knownSkills?: { id: string; title: string }[];
  skillsToLearn?: { id: string; title: string }[];
};

export function ProfileView({
  profile,
  actions,
  editHref,
}: {
  profile: ProfileViewData;
  actions?: ReactNode;
  editHref?: string;
}) {
  const skillBadge = (title: string, key: string) => (
    <Badge key={key} variant="teach" className="py-2">
      {title}
    </Badge>
  );

  const skillsSection = (
    <>
      <Card className="flex flex-col p-6 pt-[21px]">
        <CardHeader className="mb-4 p-0">
          <CardTitle className="text-2xl leading-6">Skills I Know</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 p-0">
          {profile.knownSkills?.length ? (
            profile.knownSkills.map((skill) =>
              skillBadge(skill.title, skill.id)
            )
          ) : (
            <span className="font-medium leading-5">No skills yet</span>
          )}
        </CardContent>
      </Card>
      <Card className="flex flex-col p-6 pt-[21px]">
        <CardHeader className="mb-4 p-0">
          <CardTitle className="text-2xl leading-6">
            Skills I Want to Learn
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 p-0">
          {profile.skillsToLearn?.length ? (
            profile.skillsToLearn.map((skill) =>
              skillBadge(skill.title, skill.id)
            )
          ) : (
            <span className="font-medium leading-5">No skills yet</span>
          )}
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="flex items-start justify-center gap-6 md:grid md:grid-cols-5">
      <Card className="col-span-3 p-6">
        <div className="flex flex-col items-center gap-4">
          <UserAvatar
            name={profile.name}
            imageUrl={profile.imageUrl}
            size="xl"
          />
          <div className="flex w-full flex-col items-center gap-2 text-center md:items-start md:text-left">
            <h1 className="text-3xl font-bold leading-9">{profile.name}</h1>
            {editHref ? (
              <Link
                href={editHref}
                className="text-primary text-sm font-medium underline-offset-2 hover:underline"
              >
                Edit profile
              </Link>
            ) : null}
          </div>
          {profile.bio ? (
            <div className="w-full">
              <h3 className="text-lg leading-7">Bio:</h3>
              <p className="text-muted-foreground text-sm">{profile.bio}</p>
            </div>
          ) : null}
          {actions ? (
            <div className="flex w-full flex-col gap-2">
              <h3 className="text-lg leading-7">Actions:</h3>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                {actions}
              </div>
            </div>
          ) : null}
          <div className="flex w-full flex-col gap-8 md:hidden">
            {skillsSection}
          </div>
        </div>
      </Card>
      <div className="col-span-2 hidden flex-col gap-8 md:flex">
        {skillsSection}
      </div>
    </div>
  );
}
