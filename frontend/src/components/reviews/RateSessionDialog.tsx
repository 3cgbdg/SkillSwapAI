"use client";

import { useState } from "react";

import { StarRating } from "@/components/composites";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitReview } from "@/hooks/useReviews";

export function RateSessionDialog({
  open,
  onOpenChange,
  sessionId,
  sessionTitle,
  friendName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionTitle: string;
  friendName?: string;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { mutate: submitReview, isPending } = useSubmitReview();

  const handleSubmit = () => {
    if (rating === 0) return;
    submitReview(
      { sessionId, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setRating(0);
          setComment("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate this session</DialogTitle>
          <DialogDescription>
            {friendName
              ? `How was "${sessionTitle}" with ${friendName}?`
              : `How was "${sessionTitle}"?`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Rating</Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="review-comment">Comment (optional)</Label>
            <Textarea
              id="review-comment"
              placeholder="Share how the session went…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={rating === 0 || isPending}
            loading={isPending}
            onClick={handleSubmit}
          >
            Submit review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
