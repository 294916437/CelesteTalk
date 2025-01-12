"use client";

import React, { useState } from "react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/basic/button";
import { Card, CardContent } from "@/components/data/card";
import { Input } from "@/components/basic/input";
import { Label } from "@/components/basic/label";
import Link from "next/link";
import { AnimatedWrapper } from "@/components/basic/animated-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/utils/validations/auth";
import { usePassword } from "@/hooks/user/use-password";
import type { z } from "zod";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function PasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const { handleSendEmailCode, handleSubmit, loading, countdown } = usePassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      code: "",
      password: "",
    },
  });

  const handleSendCode = async () => {
    const email = form.getValues("email");
    if (!email || form.formState.errors.email) {
      form.setFocus("email");
      return;
    }

    await handleSendEmailCode(email);
  };

  const onSubmit = async (values: ResetPasswordFormValues) => {
    await handleSubmit({
      email: values.email,
      code: values.code,
      password: values.password,
    });
  };

  return (
    <AnimatedWrapper>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className='overflow-hidden'>
          <CardContent className='grid p-0 md:grid-cols-2'>
            <div className='relative hidden bg-primary-foreground md:block'>
              <img
                src='form-side.jpg'
                alt='密码表单侧栏'
                className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
              />
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className='p-6 md:p-8 bg-primary'>
              <div className='flex flex-col gap-6'>
                <div className='flex flex-col items-center text-center'>
                  <h1 className='text-2xl font-bold'>重置密码</h1>
                  <p className='text-balance text-muted-foreground'>
                    输入您的电子邮箱地址，我们将向您发送验证码
                  </p>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>电子邮箱</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='m@celeste.com'
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <span className='text-sm text-red-500'>
                      {form.formState.errors.email.message}
                    </span>
                  )}
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='verification-code'>验证码</Label>
                  <div className='flex gap-2'>
                    <Input
                      id='verification-code'
                      type='text'
                      placeholder='输入验证码'
                      {...form.register("code")}
                      className='flex-grow'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      className='whitespace-nowrap'
                      onClick={handleSendCode}
                      disabled={countdown > 0 || loading}>
                      {countdown > 0
                        ? `${countdown}秒后重试`
                        : loading
                        ? "发送中..."
                        : "获取验证码"}
                    </Button>
                  </div>
                  {form.formState.errors.code && (
                    <span className='text-sm text-red-500'>
                      {form.formState.errors.code.message}
                    </span>
                  )}
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='password'>新密码</Label>
                  <Input
                    id='password'
                    type='password'
                    placeholder='输入新密码'
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <span className='text-sm text-red-500'>
                      {form.formState.errors.password.message}
                    </span>
                  )}
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={loading || form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "重置中..." : "重置密码"}
                </Button>
                <div className='text-center text-sm'>
                  想起密码了？{" "}
                  <Link href='/login' className='underline underline-offset-4'>
                    返回登录
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary'>
          点击继续，即表示您同意我们的 <a href='#'>服务条款</a> 和 <a href='#'>隐私政策</a>。
        </div>
      </div>
    </AnimatedWrapper>
  );
}
