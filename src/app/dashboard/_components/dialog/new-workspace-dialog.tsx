"use client";
import React, { useState } from "react";
import { v4 as idv4 } from "uuid";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createWorkspace } from "@/lib/queries/workspace";
import { addCollaborators } from "@/lib/queries/collaborator";
import { uploadImage } from "@/lib/queries/storage";
import { useUserStore } from "@/lib/store/use-user-store";
import type { User, Workspace } from "@/types/supabase.types";
import CollaboratorSearch from "@/components/global/collaborator-search.global";
import PermissionSelect from "@/components/global/permission-select.global";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fileSchema,
  WorkspaceValidator,
  WorkspaceValidatorSchema,
} from "../../_schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function NewWorkspaceDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a workspace</DialogTitle>
          <DialogDescription>
            Organize your projects and collaborate with others.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <WorkspaceCreator closeDialog={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

const WorkspaceCreator: React.FC<{ closeDialog: () => void }> = ({
  closeDialog,
}) => {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkspaceValidatorSchema>({
    resolver: zodResolver(WorkspaceValidator),
    defaultValues: { title: "", description: "", permissions: "private" },
  });

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = fileSchema.safeParse(file);
    if (!validation.success) {
      return toast.error("Banner Upload failed", {
        description: validation.error.errors[0].message,
      });
    }

    form.setValue("bannerFile", file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: WorkspaceValidatorSchema) => {
    if (!currentUser?.id) return toast.error("User not authenticated");

    setIsSubmitting(true);
    let imageUrl = "";

    try {
      if (values.bannerFile) imageUrl = await uploadImage(values.bannerFile);

      const workspaceData: Workspace = {
        id: idv4(),
        createdAt: new Date().toISOString(),
        title: values.title,
        description: values.description,
        workspaceOwner: currentUser.id,
        isDeleted: false,
        emoji: null,
        imageUrl,
      };

      const { data, error } = await createWorkspace(workspaceData);
      if (error || !data) throw new Error("Workspace creation failed");

      if (values.permissions === "shared" && collaborators.length > 0) {
        await addCollaborators(collaborators, workspaceData.id);
      }

      toast.success(`Workspace "${values.title}" created successfully!`);
      router.refresh();
      closeDialog();
    } catch (err) {
      console.error("Workspace Creation Error:", err);
      toast.error("Failed to create workspace");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {bannerPreview && (
          <div className="relative w-full h-40 rounded-md overflow-hidden">
            <Image
              src={bannerPreview}
              alt="Banner preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="bannerFile"
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Workspace name"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Workspace description"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permissions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permissions</FormLabel>
              <FormControl>
                <PermissionSelect
                  defaultValue={field.value}
                  setPermission={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("permissions") === "shared" && (
          <CollaboratorSearch
            existingCollaborators={collaborators}
            getCollaborator={(c) => setCollaborators([...collaborators, c])}
            removeCollaborator={(c) =>
              setCollaborators(collaborators.filter((col) => col.id !== c.id))
            }>
            <Button type="button" variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add collaborators
            </Button>
          </CollaboratorSearch>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Form>
  );
};
