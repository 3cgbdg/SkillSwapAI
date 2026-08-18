"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { SectionPanel, StarRating, SwapAxis } from "@/components/composites";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { IReview } from "@/types/review";

export type ProfileViewData = {
  name: string;
  imageUrl?: string | null;
  bio?: string | null;
  knownSkills?: { id: string; title: string }[];
  skillsToLearn?: { id: string; title: string }[];
  averageRating?: number | null;
  reviewCount?: number;
};

export function ProfileView({
  profile,
  actions,
  editHref,
  reviews,
}: {
  profile: ProfileViewData;
  actions?: ReactNode;
  editHref?: string;
  reviews?: { items: IReview[]; isLoading?: boolean };
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="p-6 md:col-span-3">
          <div className="flex flex-col items-center gap-4">
            <UserAvatar
              name={profile.name}
              imageUrl={profile.imageUrl}
              size="xl"
            />
            <div className="flex w-full flex-col items-center gap-4 text-center md:items-start md:text-left">
              <h2 className="font-heading text-h1">{profile.name}</h2>
              {editHref ? (
                <Link
                  href={editHref}
                  className="text-primary text-body-sm font-medium underline-offset-2 hover:underline"
                >
                  Edit profile
                </Link>
              ) : null}
            </div>
            {profile.bio ? (
              <div className="w-full">
                <h3 className="font-heading text-h3">Bio</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            ) : null}
            {actions ? (
              <div className="flex w-full flex-col gap-4">
                <h3 className="font-heading text-h3">Actions</h3>
                <div className="mt-1 flex flex-wrap items-center gap-4">
                  {actions}
                </div>
              </div>
            ) : null}
          </div>
        </Card>
        <div className="md:col-span-2">
          <SwapAxis
            teach={profile.knownSkills ?? []}
            learn={profile.skillsToLearn ?? []}
            teachLabel="Skills I Know"
            learnLabel="Skills I Want to Learn"
            max={50}
          />
        </div>
      </div>

      <SectionPanel title="Reviews">
        <div className="flex items-center gap-2">
          <StarRating value={Math.round(profile.averageRating ?? 0)} readOnly />
          <span className="text-muted-foreground text-body-sm">
            {profile.reviewCount
              ? `${profile.averageRating?.toFixed(1)} · ${profile.reviewCount} review${profile.reviewCount === 1 ? "" : "s"}`
              : "No reviews yet"}
          </span>
        </div>
        {reviews?.isLoading ? (
          <p className="text-muted-foreground mt-4 text-body-sm">
            Loading reviews…
          </p>
        ) : reviews && reviews.items.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-4">
            {reviews.items.map((review) => (
              <li key={review.id} className="flex items-start gap-3">
                <UserAvatar
                  name={review.reviewer.name ?? undefined}
                  imageUrl={review.reviewer.imageUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.reviewer.name}</span>
                    <StarRating value={review.rating} readOnly size="sm" />
                  </div>
                  {review.comment ? (
                    <p className="text-muted-foreground mt-1 text-body-sm">
                      {review.comment}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </SectionPanel>
    </div>
  );
}
