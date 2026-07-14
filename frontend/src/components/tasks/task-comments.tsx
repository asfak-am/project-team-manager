"use client";

import {
  LoaderCircle,
  MessageSquare,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  useCreateTaskComment,
  useDeleteTaskComment,
  useTaskComments,
} from "@/hooks/use-task-comments";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  TaskComment,
} from "@/types/task";

type TaskCommentsProps = {
  taskId: number;
};

export function TaskComments({
  taskId,
}: TaskCommentsProps) {
  const [comment, setComment] =
    useState("");

  const { user } = useAuth();

  const commentsQuery =
    useTaskComments(taskId);

  const createComment =
    useCreateTaskComment();

  const deleteComment =
    useDeleteTaskComment();

  const response =
    commentsQuery.data;

  const comments: TaskComment[] =
    response?.data ?? [];

  async function handleSubmit(): Promise<void> {
    const value = comment.trim();

    if (!value) {
      return;
    }

    try {
      await createComment.mutateAsync({
        taskId,
        comment: value,
      });

      setComment("");

      toast.success(
        "Comment added successfully."
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to add comment."
        )
      );
    }
  }

  async function handleDelete(
    commentId: number
  ): Promise<void> {
    try {
      await deleteComment.mutateAsync({
        taskId,
        commentId,
      });

      toast.success("Comment deleted.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete comment."
        )
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-5" />
          Comments
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Textarea
            value={comment}
            onChange={(event) =>
              setComment(
                event.target.value
              )
            }
            rows={3}
            placeholder="Write a comment..."
            disabled={
              createComment.isPending
            }
          />

          <div className="flex justify-end">
            <Button
              onClick={() =>
                void handleSubmit()
              }
              disabled={
                createComment.isPending ||
                !comment.trim()
              }
            >
              {createComment.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Send />
              )}

              Add comment
            </Button>
          </div>
        </div>

        <div className="divide-y">
          {comments.map((item) => {
            const canDelete =
              item.user_id === user?.id ||
              user?.roles.includes(
                "administrator"
              );

            return (
              <div
                key={item.id}
                className="py-4 first:pt-0"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {item.user?.name ??
                        "Unknown user"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleString()
                        : ""}
                    </p>
                  </div>

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        void handleDelete(
                          item.id
                        )
                      }
                      disabled={
                        deleteComment.isPending
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm">
                  {item.comment}
                </p>
              </div>
            );
          })}

          {!commentsQuery.isLoading &&
            comments.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No comments yet.
              </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}