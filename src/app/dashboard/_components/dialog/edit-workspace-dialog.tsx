import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Custom Components
import PermissionSelect from "@/components/global/permission-select.global";

// Queries and Types
import { updateWorkspace } from "@/lib/queries/workspace";
import {
  getCollaborators,
  addCollaborators,
  removeCollaborator,
} from "@/lib/queries/collaborator";
import { uploadImage } from "@/lib/queries/storage";
import { PermissionsKey } from "@/types/global.type";
import { User, Workspace } from "@/types/supabase.types";
import {
  WorkspaceValidator,
  WorkspaceValidatorSchema,
  fileSchema,
} from "../../_schema";
import Invite from "@/components/global/invite";

export default function EditWorkspaceDialog({
  children,
  workspace,
}: {
  children: React.ReactNode;
  workspace: Workspace;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [bannerPreview, setBannerPreview] = useState<string>(
    workspace.imageUrl || ""
  );
  const [permission, setPermission] = useState<PermissionsKey>(
    collaborators.length > 0 ? "shared" : "private"
  );
  const [isRemovalAlertOpen, setIsRemovalAlertOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkspaceValidatorSchema>({
    resolver: zodResolver(WorkspaceValidator),
    defaultValues: {
      title: workspace.title || "",
      description: workspace.description || "",
      permissions: permission,
      bannerFile: undefined,
    },
  });

  useEffect(() => {
    const loadWorkspaceDetails = async () => {
      try {
        const response = await getCollaborators(workspace.id);
        if (response.length) {
          setCollaborators(response);
          setPermission("shared");
          form.setValue("permissions", "shared");
        }
      } catch {
        toast.error("Failed to load workspace details");
      }
    };

    loadWorkspaceDetails();
  }, [workspace.id, form]);

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

  const handleSubmit = async (values: WorkspaceValidatorSchema) => {
    setIsSubmitting(true);
    let imageUrl = workspace.imageUrl;

    try {
      // Upload new banner if provided
      if (values.bannerFile) {
        imageUrl = await uploadImage(values.bannerFile);
      }

      // Prepare update data
      const updateData: Partial<Workspace> = {
        title: values.title,
        description: values.description || null,
        imageUrl,
      };

      // Update workspace
      const { error } = await updateWorkspace(updateData, workspace.id);
      if (error) throw new Error("Failed to update workspace");

      // Handle collaborators for shared workspaces
      if (values.permissions === "shared" && collaborators.length > 0) {
        await addCollaborators(collaborators, workspace.id);
      } else if (values.permissions === "private") {
        await removeCollaborator(collaborators, workspace.id);
      }

      toast.success("Workspace updated successfully");
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Workspace Update Error:", err);
      toast.error("Failed to update workspace");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (value: PermissionsKey) => {
    if (value === "private") {
      setIsRemovalAlertOpen(true);
    } else {
      setPermission(value);
      form.setValue("permissions", value);
    }
  };

  const handleRemoveCollaborators = async () => {
    try {
      await removeCollaborator(collaborators, workspace.id);
      setCollaborators([]);
      setPermission("private");
      form.setValue("permissions", "private");
      setIsRemovalAlertOpen(false);
    } catch {
      toast.error("Failed to remove collaborators");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workspace Settings</DialogTitle>
          <DialogDescription>
            Manage your workspace privacy, name, and collaborators.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4">
            {/* Banner Preview */}
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

            {/* Banner Upload */}
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

            {/* Workspace Name */}
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

            {/* Workspace Description */}
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

            {/* Permissions */}
            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <FormControl>
                    <PermissionSelect
                      defaultValue={field.value}
                      onValueChange={(value) => {
                        handlePermissionChange(value as PermissionsKey);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("permissions") === "shared" && (
              <Invite id={workspace.id} />
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>

        {/* Collaborator Removal Confirmation Dialog */}
        <AlertDialog
          open={isRemovalAlertOpen}
          onOpenChange={setIsRemovalAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Collaborators?</AlertDialogTitle>
              <AlertDialogDescription>
                Changing to private will remove all collaborators permanently.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveCollaborators}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
