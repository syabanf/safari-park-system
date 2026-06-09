import { api } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { type LoginRequest, endpoints, loginRequestSchema } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import {
  AppSwitcher,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@tsi/ui';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { MEMBER_PERSONAS, type MemberPersona } from './personas';
import { useAuthStore } from './store';

const accentBg: Record<MemberPersona['accent'], string> = {
  brand: 'bg-brand-100 text-brand-800',
  earth: 'bg-earth-100 text-earth-800',
  rose: 'bg-rose-100 text-rose-800',
  slate: 'bg-slate-100 text-slate-700',
};

export function LoginRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.set);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: ({ body, persona }: { body: LoginRequest; persona?: MemberPersona }) =>
      endpoints.login(api, body).then((res) => ({ res, persona })),
    onSuccess({ res, persona }) {
      setAuth({
        ...res,
        displayName: persona?.displayName,
        personaId: persona?.id,
      });
      navigate('/home');
    },
  });

  const signInAs = (persona: MemberPersona) => {
    mutation.mutate({
      body: { email: persona.email, password: 'demo' },
      persona,
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card>
          <CardHeader>
            <CardTitle>{t('member.login.title')}</CardTitle>
            <CardDescription>{t('member.login.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => mutation.mutate({ body: values }))}
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">{t('member.login.emailLabel')}</Label>
                <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
                {form.formState.errors.email ? (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t('member.login.passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...form.register('password')}
                />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? t('common.loading') : t('member.login.submit')}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t('member.login.noAccount')}{' '}
              <Link to="/enrol" className="text-brand-700 underline">
                {t('member.login.enrol')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demo personas</CardTitle>
            <p className="text-xs text-muted-foreground">Tap a profile to skip the form</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {MEMBER_PERSONAS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    onClick={() => signInAs(p)}
                    disabled={mutation.isPending}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="group flex items-center gap-3 rounded-xl border border-border/60 bg-white p-3 text-left transition-all hover:border-brand-300 hover:bg-brand-50/40 disabled:opacity-60"
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 ${accentBg[p.accent]}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-tight">{p.displayName}</p>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                        {p.tagline}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Switch to another app
              </p>
              <AppSwitcher current="member" variant="inline" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
