import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Users2 } from "lucide-react";
import { PermissionsKey } from "@/types/global.type";

const PERMISSION_OPTIONS = {
  private: {
    icon: Lock,
    label: "Private",
    description:
      "Your workspace is private to you. You can choose to share it later.",
  },
  shared: {
    icon: Users2,
    label: "Public",
    description:
      "Your workspace is public to everyone. You can invite collaborators.",
  },
} as const;

interface PermissionSelectProps {
  setPermission?: React.Dispatch<React.SetStateAction<PermissionsKey>>;
  onValueChange?: (value: PermissionsKey) => void;
  defaultValue?: PermissionsKey;
  value?: PermissionsKey;
}

const PermissionSelect: React.FC<PermissionSelectProps> = ({
  defaultValue,
  value,
  onValueChange,
  setPermission,
}) => {
  const handleValueChange = (option: PermissionsKey) => {
    if (onValueChange) onValueChange(option);
    if (setPermission) setPermission(option);
  };

  return (
    <Select
      onValueChange={handleValueChange}
      defaultValue={defaultValue}
      value={value ?? defaultValue}>
      <SelectTrigger className="w-full h-16 p-4">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectGroup>
          {Object.entries(PERMISSION_OPTIONS).map(([key, option]) => {
            const Icon = option.icon;
            return (
              <SelectItem key={key} value={key}>
                <div className="flex gap-2 sm:gap-4 justify-center items-center">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <article className="flex text-left min-w-0 flex-col gap-0.5">
                    <span className="font-medium">{option.label}</span>
                    <p className="hidden sm:block text-xs overflow-ellipsis text-wrap">
                      {option.description}
                    </p>
                  </article>
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default PermissionSelect;
