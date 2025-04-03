import { z } from "zod";
const MAX_FILE_SIZE = 1024 * 1000 * 5;
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const WorkspaceValidator = z.object({
  title: z.string().min(1, { message: "Workspace name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  permissions: z.enum(["private", "shared"], {
    message: "Invalid permission type",
  }),
  bannerFile: z
    .custom<File>()
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `Max image size is 5MB.`,
    })
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, and .png files are accepted."
    )
    .optional(),
});

export type WorkspaceValidatorSchema = z.infer<typeof WorkspaceValidator>;

export const fileSchema = z
  .custom<File>()
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `Max image size is 1MB.`,
  })
  .refine(
    (file) => ACCEPTED_FILE_TYPES.includes(file.type),
    "Only .jpg, .jpeg, and .png files are accepted."
  );
