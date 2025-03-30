"use client";

import ErrorBlock from "@/components/error-block";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoaderIcon } from "lucide-react";
import React from "react";
import { useCompleteProfile } from "./_hooks/use-complete-profile";
import AvatarComponent from "@/components/avatar-component";
import { Textarea } from "@/components/ui/textarea";

export default function CompleteSignUpPage() {
  const { errors, form, isLoadingSubmit, submitHandler } = useCompleteProfile();

  return (
    <>
      <h1 className="mb-3 w-full text-left text-2xl font-bold md:text-3xl">
        Complete your profile
      </h1>
      <p className="mb-8 w-full  text-left">
        Please, fill this form down below to continue using{" "}
        <span className="font-bold underline">Station.</span>
      </p>

      <Form {...form}>
        <form
          onSubmit={submitHandler}
          className="flex w-full flex-col gap-y-3"
          autoComplete="off">
          <FormField
            control={form.control}
            name="avatarFile"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <AvatarComponent
                      className="size-10"
                      src={form.getValues("avatar")}
                      alt={form.getValues("fullname")}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      placeholder="Upload your profile picture..."
                      onChange={(e) => {
                        if (!e.target.files || e.target.files.length === 0)
                          return;
                        const file = e.target.files[0];
                        form.setValue("avatar", URL.createObjectURL(file));
                        form.setValue("avatarFile", file);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name..."
                    type="text"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your username..."
                    type="text"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>About You</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ErrorBlock className="m-0" message={errors.root?.apiError.message} />

          <Button
            size="lg"
            className="w-full"
            type="submit"
            disabled={isLoadingSubmit}>
            {isLoadingSubmit && (
              <LoaderIcon className="animate mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </form>
      </Form>
    </>
  );
}
