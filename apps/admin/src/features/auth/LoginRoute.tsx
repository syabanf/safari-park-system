import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { endpoints, loginRequestSchema, type LoginRequest } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { AppSwitcher, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@tsi/ui';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { ADMIN_PERSONAS, type AdminPersona } from './personas';
import { useAuthStore } from './store';

const accentBg: Record<AdminPersona['accent'], string> = {
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
    defaultValues: { email: 'admin@tamansafari.id', password: 'demo' },
  });

  const mutation = useMutation({
    mutationFn: ({ body, persona }: { body: LoginRequest; persona?: AdminPersona }) =>
      endpoints.login(api, body).then((res) => ({ res, persona })),
    onSuccess({ res, persona }, variables) {
      setAuth({
        accessToken: res.accessToken,
        expiresIn: res.expiresIn,
        email: variables.body.email,
        displayName: persona?.displayName,
        role: persona?.role,
      });
      navigate('/');
    },
  });

  const submitForm = form.handleSubmit((v) =>
    mutation.mutate({ body: v }),
  );

  const signInAs = (persona: AdminPersona) => {
    mutation.mutate({
      body: { email: persona.email, password: 'demo' },
      persona,
    });
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(at_30%_30%,hsl(138_60%_85%/0.4),transparent_40%),radial-gradient(at_70%_70%,hsl(35_70%_85%/0.4),transparent_40%)]" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-5xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-lg font-bold text-white shadow-lg shadow-brand-900/20">
            T
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Taman Safari Indonesia</p>
            <p className="text-base font-semibold">{t('admin.appName')}</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <Card className="border-border/60 bg-white/90 shadow-xl shadow-brand-900/5 backdrop-blur">
            <CardHeader>
              <CardTitle>{t('admin.login.title')}</CardTitle>
              <CardDescription>{t('admin.login.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submitForm}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t('admin.login.emailLabel')}</Label>
                  <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">{t('admin.login.passwordLabel')}</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...form.register('password')}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
                  {mutation.isPending ? t('admin.common.loading') : t('admin.login.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-white/90 shadow-xl shadow-brand-900/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Demo personas</CardTitle>
              <CardDescription>
                One-click sign-in as any role. Useful for showing each module from the right point of view.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {ADMIN_PERSONAS.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      onClick={() => signInAs(p)}
                      disabled={mutation.isPending}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className="group flex items-start gap-3 rounded-xl border border-border/60 bg-white p-3 text-left transition-all hover:border-brand-300 hover:bg-brand-50/40 disabled:opacity-60"
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 ${accentBg[p.accent]}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-tight">{p.displayName}</p>
                        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                          {p.role}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                All personas use the same MSW backend — the role is cosmetic until real auth is wired.
              </p>
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Switch to another app
                </p>
                <AppSwitcher current="admin" variant="inline" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
