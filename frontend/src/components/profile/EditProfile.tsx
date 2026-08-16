"use client";
import AddSkills from "@/components/profile/AddSkills";
import { Dispatch, useEffect, useState } from "react";
import { SetStateAction } from "react";
import { UserRound } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  editProfileFormData,
  editProfileSchema,
} from "@/validation/editProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import ProfilesService from "@/services/ProfilesService";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Spinner } from "@/components/ui/spinner";
import useProfile from "@/hooks/useProfile";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { PageBody, PageHeader } from "@/components/layouts";

const EditProfile = ({
  setIsEditing,
}: {
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}) => {
  const { data: user } = useProfile();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<editProfileFormData>({
    resolver: zodResolver(editProfileSchema),
  });
  const [isCurrentlyEditing, setIsCurrentlyEditing] = useState<boolean>(false);

  const { mutate: saveChanges } = useMutation({
    mutationFn: async (data: Partial<editProfileFormData>) => {
      if (user) {
        const resData = await ProfilesService.updateProfile(user.id, data);
        queryClient.setQueryData(["profile"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            ...data,
          };
        });
        return resData;
      } else return null;
    },
    onSuccess: (data) => {
      showSuccessToast(data?.message || "Profile updated");
      setIsCurrentlyEditing(false);
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  const { mutate: deleteAvatarImage } = useMutation({
    mutationFn: async () => {
      const resData = await ProfilesService.deleteAvatarImage();
      queryClient.setQueryData(["profile"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          imageUrl: undefined,
        };
      });
      return resData;
    },
    onSuccess: (data) => {
      showSuccessToast(data?.message || "Avatar deleted");
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  const { mutate: uploadAvatarImage, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("image", file);
      const data = await ProfilesService.uploadAvatarImage(form);
      queryClient.setQueryData(["profile"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          imageUrl: data.url,
        };
      });
      return data;
    },
    onSuccess: (data) => {
      showSuccessToast(data.message || "Avatar uploaded");
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatarImage(file);
  };

  const onSubmit: SubmitHandler<editProfileFormData> = async (data) => {
    if (user) {
      const dataToUpdate = (
        Object.keys(data) as (keyof editProfileFormData)[]
      ).reduce((acc, key) => {
        const value = data[key];
        if (value !== undefined && value !== (user as any)[key]) {
          acc[key] = value;
        }
        return acc;
      }, {} as Partial<editProfileFormData>);
      saveChanges(dataToUpdate);
    }
  };

  useEffect(() => {
    if (!user) return;
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("bio", user.bio || "");
  }, [user, setValue]);

  return (
    <PageBody>
      <PageHeader
        title="Edit profile"
        description="Update your photo, personal details, and skills."
        actions={
          <Button type="button" onClick={() => setIsEditing(false)}>
            Finish editing
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="flex flex-col justify-between gap-4 md:col-span-1">
            <CardHeader className="gap-3.5">
              <CardTitle className="text-lg leading-7">
                Profile Picture
              </CardTitle>
              <div className="mx-auto flex size-30 items-center justify-center">
                {!isPending ? (
                  user?.imageUrl ? (
                    <UserAvatar
                      name={user.name}
                      imageUrl={user.imageUrl}
                      size="xl"
                      className="size-[120px]"
                    />
                  ) : (
                    <UserRound size={52} />
                  )
                ) : (
                  <Spinner size={42} />
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <label className={cn(buttonVariants(), "w-full cursor-pointer")}>
                Update Picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => deleteAvatarImage()}
              >
                Remove Picture
              </Button>
            </CardContent>
          </Card>

          <Card className="gap-4 md:col-span-2">
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <CardHeader className="gap-1">
                <CardTitle className="text-lg leading-7">
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3.5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    defaultValue={user?.name}
                    placeholder="Enter your name"
                    type="text"
                    {...register("name", {
                      onChange: () => setIsCurrentlyEditing(true),
                    })}
                  />
                  {errors.name && (
                    <span
                      data-testid="error"
                      className="font-medium text-destructive"
                    >
                      {errors.name.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    defaultValue={user?.email}
                    placeholder="Enter your email"
                    type="text"
                    {...register("email", {
                      onChange: () => setIsCurrentlyEditing(true),
                    })}
                  />
                  {errors.email && (
                    <span
                      data-testid="error"
                      className="font-medium text-destructive"
                    >
                      {errors.email.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bio">Bio/About Me</Label>
                  <Textarea
                    id="bio"
                    defaultValue={user?.bio}
                    placeholder="Enter your bio"
                    className="min-h-14"
                    {...register("bio", {
                      onChange: () => setIsCurrentlyEditing(true),
                    })}
                  />
                  {errors.bio && (
                    <span
                      data-testid="error"
                      className="font-medium text-destructive"
                    >
                      {errors.bio.message}
                    </span>
                  )}
                </div>
              </CardContent>
              {isCurrentlyEditing && (
                <div className="flex items-center justify-end gap-4 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      setIsCurrentlyEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              )}
            </form>
          </Card>
        </div>
        <AddSkills />
      </div>
    </PageBody>
  );
};

export default EditProfile;
