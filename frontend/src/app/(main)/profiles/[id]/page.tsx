"use client";

import FullSreenLoader from "@/components/FullSreenLoader";
import ChatsService from "@/services/ChatsService";
import ProfilesService from "@/services/ProfilesService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MessageSquareMore, UserRound } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { showErrorToast } from "@/utils/toast";

const Page = () => {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    data: profile,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => ProfilesService.getProfileById(id),
  });

  // handling api error

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "An error occurred");
    }
  }, [error, isError]);

  // for getting to chat or creating it
  const { mutate: createChat } = useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: { friendId: string; friendName: string };
    }) => ChatsService.createChat(payload),
    onSuccess: (data) => {
      router.push(`/chats/${data.chatId}`);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  return (
    <>
      {profile && (
        <div className="md:grid grid-cols-5 flex  justify-center items-start   gap-6">
          {/* loading screen */}

          {isLoading && <FullSreenLoader />}

          {/*  */}
          <div className="_border col-span-3 rounded-[10px] p-6">
            <div className="flex flex-col gap-4 items-center">
              <div className=" _border size-24 relative flex items-center justify-center rounded-full overflow-hidden">
                {!profile?.imageUrl ? (
                  <UserRound size={48} />
                ) : (
                  <Image
                    className="object-cover"
                    src={profile.imageUrl}
                    fill
                    alt="profile image"
                  />
                )}
              </div>
              <h1 className="page-title">{profile.name}</h1>
              {profile.bio !== null && profile.bio.length > 0 && (
                <div className="w-full ">
                  <h3 className="text-lg leading-7 ">Bio:</h3>
                  <p className="text-gray text-sm">{profile.bio}</p>
                </div>
              )}
              <div className="flex flex-col gap-2 w-full">
                <h3 className="text-lg leading-7 ">Actions:</h3>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() =>
                      createChat({
                        payload: { friendId: id, friendName: profile.name },
                      })
                    }
                    className="button-blue flex items-center gap-5"
                  >
                    <MessageSquareMore size={20} />
                    <span>Message {profile.name}</span>
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/calendar?schedule=true&name=${encodeURIComponent(profile.name)}`
                      )
                    }
                    className="button-transparent rounded-md! flex items-center gap-5"
                  >
                    <Calendar size={20} />
                    <span>Schedule Session</span>
                  </button>
                </div>
              </div>
              {/* for 768< */}
              <div className="flex md:hidden flex-col gap-8">
                {/* for known skills */}
                <div className="_border p-6 pt-[21px] rounded-2xl flex flex-col">
                  <h2 className="text-2xl leading-6 font-bold mb-4">
                    Skills I Know
                  </h2>
                  <div className="basis-full">
                    <div className="flex gap-2 flex-wrap mb-6 overflow-y-auto   max-h-[170px] ">
                      {profile?.knownSkills &&
                        profile?.knownSkills?.length > 0 ? (
                        profile.knownSkills.map((skill, idx) => (
                          <div
                            key={idx}
                            className="bg-blue text-sm leading-5 font-medium h-fit flex w-fit gap-2 px-3.5 text-white py-2 items-center rounded-2xl"
                          >
                            {skill.title}
                          </div>
                        ))
                      ) : (
                        <span className="font-medium  leading-5 ">
                          No skills yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* for want-to-learn skills */}
                <div className="_border p-6 pt-[21px] rounded-2xl flex flex-col">
                  <h2 className="text-2xl leading-6 font-bold mb-4">
                    Skills I Want to Learn
                  </h2>
                  <div className="basis-full">
                    <div className="flex gap-2  flex-wrap mb-6 overflow-y-auto max-h-[170px] ">
                      {profile?.skillsToLearn &&
                        profile?.skillsToLearn?.length > 0 ? (
                        profile.skillsToLearn.map((skill, idx) => (
                          <div
                            key={idx}
                            className="bg-blue text-sm leading-5 font-medium h-fit flex w-fit gap-2 px-3.5 text-white py-2 items-center rounded-2xl"
                          >
                            {skill.title}
                          </div>
                        ))
                      ) : (
                        <span className="font-medium  leading-5 ">
                          No skills yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* for 768> */}
          <div className=" md:flex hidden col-span-2 flex-col gap-8">
            {/* for known skills */}
            <div className="_border p-6 pt-[21px] rounded-2xl flex flex-col">
              <h2 className="text-2xl leading-6 font-bold mb-4">
                Skills I Know
              </h2>
              <div className="basis-full">
                <div className="flex gap-2 flex-wrap mb-6 overflow-y-auto   max-h-[170px] ">
                  {profile?.knownSkills && profile?.knownSkills?.length > 0 ? (
                    profile.knownSkills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="bg-blue text-sm leading-5 font-medium h-fit flex w-fit gap-2 px-3.5 text-white py-2 items-center rounded-2xl"
                      >
                        {skill.title}
                      </div>
                    ))
                  ) : (
                    <span className="font-medium  leading-5 ">
                      No skills yet
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* for want-to-learn skills */}
            <div className="_border p-6 pt-[21px] rounded-2xl flex flex-col">
              <h2 className="text-2xl leading-6 font-bold mb-4">
                Skills I Want to Learn
              </h2>
              <div className="basis-full">
                <div className="flex gap-2  flex-wrap mb-6 overflow-y-auto max-h-[170px] ">
                  {profile?.skillsToLearn &&
                    profile?.skillsToLearn?.length > 0 ? (
                    profile.skillsToLearn.map((skill, idx) => (
                      <div
                        key={idx}
                        className="bg-blue text-sm leading-5 font-medium h-fit flex w-fit gap-2 px-3.5 text-white py-2 items-center rounded-2xl"
                      >
                        {skill.title}
                      </div>
                    ))
                  ) : (
                    <span className="font-medium  leading-5 ">
                      No skills yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div >
      )}
    </>
  );
};

export default Page;
