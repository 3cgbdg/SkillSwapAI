"use client";

import { Card, CardContent } from "@/components/ui/card";

const Page = () => {
  return (
    <Card className="flex h-[400px] items-center justify-center rounded-2xl">
      <CardContent>
        <h1 className="text-center text-6xl font-bold text-primary">
          Not found 404
        </h1>
      </CardContent>
    </Card>
  );
};

export default Page;
