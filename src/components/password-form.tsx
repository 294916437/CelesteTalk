import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AnimatedWrapper } from "./animated-wrapper";

export function PasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <AnimatedWrapper>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className='overflow-hidden'>
          <CardContent className='grid p-0 md:grid-cols-2'>
            <div className='relative hidden bg-primary-foreground md:block'>
              <img
                src='/placeholder.svg'
                alt='图片'
                className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
              />
            </div>
            <form className='p-6 md:p-8 bg-primary'>
              <div className='flex flex-col gap-6'>
                <div className='flex flex-col items-center text-center'>
                  <h1 className='text-2xl font-bold'>重置密码</h1>
                  <p className='text-balance text-muted-foreground'>
                    输入您的电子邮箱地址，我们将向您发送验证码
                  </p>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>电子邮箱</Label>
                  <Input id='email' type='email' placeholder='m@celeste.com' required />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='verification-code'>验证码</Label>
                  <div className='flex gap-2'>
                    <Input
                      id='verification-code'
                      type='text'
                      placeholder='输入验证码'
                      required
                      className='flex-grow'
                    />
                    <Button type='button' variant='outline' className='whitespace-nowrap'>
                      获取验证码
                    </Button>
                  </div>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='new-password'>新密码</Label>
                  <Input id='new-password' type='password' placeholder='输入新密码' required />
                </div>
                <Button type='submit' className='w-full'>
                  重置密码
                </Button>
                <div className='text-center text-sm'>
                  记起密码了？{" "}
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
