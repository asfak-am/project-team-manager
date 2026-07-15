"use client";

import {
    Camera,
    LoaderCircle,
    Trash2,
} from "lucide-react";
import {
    useRef,
    type ChangeEvent,
} from "react";
import { toast } from "sonner";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    useDeleteAvatar,
    useUpdateAvatar,
} from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import type { User } from "@/types/user";

type AvatarUploadProps = {
    user: User;
};

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

export function AvatarUpload({
    user,
}: AvatarUploadProps) {
    const inputRef =
        useRef<HTMLInputElement>(null);

    const updateAvatar = useUpdateAvatar();
    const deleteAvatar = useDeleteAvatar();

    const isPending =
        updateAvatar.isPending ||
        deleteAvatar.isPending;

    async function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>
    ): Promise<void> {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            await updateAvatar.mutateAsync(file);

            toast.success(
                "Profile picture updated successfully."
            );
        } catch (error) {
            toast.error(
                getApiErrorMessage(
                    error,
                    "Unable to upload profile picture."
                )
            );
        } finally {
            event.target.value = "";
        }
    }

    async function handleRemove(): Promise<void> {
        try {
            await deleteAvatar.mutateAsync();

            toast.success(
                "Profile picture removed."
            );
        } catch (error) {
            toast.error(
                getApiErrorMessage(
                    error,
                    "Unable to remove profile picture."
                )
            );
        }
    }

    return (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="size-24 border-4 border-background shadow-lg ring-1 ring-border">
                {user.avatar_url && (
                    <AvatarImage
                        src={user.avatar_url}
                        alt={user.name}
                        className="object-cover"
                    />
                )}

                <AvatarFallback className="text-xl font-semibold">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>

            <div className="space-y-3">
                <div>
                    <p className="font-medium">
                        Profile picture
                    </p>

                    <p className="text-sm text-muted-foreground">
                        JPG, PNG or WebP. Maximum 2 MB.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => {
                            void handleFileChange(event);
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                            inputRef.current?.click()
                        }
                    >
                        {updateAvatar.isPending ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            <Camera />
                        )}

                        Upload picture
                    </Button>

                    {user.avatar_url && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={isPending}
                            onClick={() => {
                                void handleRemove();
                            }}
                        >
                            <Trash2 />
                            Remove
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}