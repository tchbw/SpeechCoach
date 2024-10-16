import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import { Alert } from "@/client/components/ui/alert";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/client/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import { ProfileDropdown } from "@/client/components/views/project/ProfileDropdown";
import { env } from "@/env";
import { RequireUser } from "@/pages/util";
import { api } from "@/utils/api";

const AccountPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(``);

  const formSchema = z
    .object({
      currentPassword: z.string().min(1, `Current password is required`),
      newPassword: z
        .string()
        .min(8, `New password must be at least 8 characters`),
      confirmPassword: z.string().min(1, `Please confirm your new password`),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: `New passwords do not match`,
      path: [`confirmPassword`],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: ``,
      newPassword: ``,
      confirmPassword: ``,
    },
  });

  const changePasswordMutation = api.authentication.changePassword.useMutation({
    onSuccess: () => {
      toast.success(`Password changed successfully`);
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
    } catch (err) {
      // Error is handled in onError callback
    }
  };

  return (
    <>
      <Head>
        <title>Account | {env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto flex flex-col gap-4 px-4 py-8">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <ProfileDropdown />
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    form.reset();
                    setIsOpen(true);
                  }}
                >
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {error && <Alert variant="destructive">{error}</Alert>}
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending
                        ? `Changing...`
                        : `Change Password`}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AccountPage;

export const getServerSideProps = RequireUser(() => {
  return {
    props: {},
  };
});
