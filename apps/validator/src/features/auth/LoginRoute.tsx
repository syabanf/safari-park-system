import { api } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { type StaffLoginRequest, endpoints, staffLoginRequestSchema } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { AppSwitcher, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@tsi/ui';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { VALIDATOR_PERSONAS, type ValidatorPersona } from './personas';
import { useAuthStore } from './store';

const accentBg: Record<ValidatorPersona['accent'], string> = {
  brand: 'bg-brand-100 text-brand-800',
  earth: 'bg-earth-100 text-earth-800',
  rose: 'bg-rose-100 text-rose-800',
  slate: 'bg-slate-100 text-slate-700',
};

export function LoginRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.set);
  const defaultGate = import.meta.env.VITE_GATE_ID ?? 'gate-dev-001';

  const form = useForm<StaffLoginRequest>({
    resolver: zodResolver(staffLoginRequestSchema),
    defaultValues: { username: '', pin: '', gateId: defaultGate },
  });

  const mutation = useMutation({
    mutationFn: ({ body, persona }: { body: StaffLoginRequest; persona?: ValidatorPersona }) =>
      endpoints.staffLogin(api, body).then((res) => ({ res, persona, body })),
    onSuccess({ res, persona, body }) {
      setAuth({
        accessToken: res.accessToken,
        expiresIn: res.expiresIn,
        staffId: body.username,
        gateId: body.gateId ?? defaultGate,
        displayName: persona?.displayName,
        role: persona?.role,
      });
      navigate('/scan');
    },
  });

  const signInAs = (persona: ValidatorPersona) => {
    mutation.mutate({
      body: { username: persona.username, pin: '0000', gateId: persona.gateId },
      persona,
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('validator.login.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((v) => mutation.mutate({ body: v }))}
            >
              <div className="space-y-1.5">
                <Label htmlFor="username">{t('validator.login.usernameLabel')}</Label>
                <Input id="username" autoComplete="username" {...form.register('username')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pin">{t('validator.login.pinLabel')}</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  {...form.register('pin')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gateId">{t('validator.login.gateLabel')}</Label>
                <Input id="gateId" {...form.register('gateId')} />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? t('common.loading') : t('validator.login.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('validator.login.personas')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('validator.login.personasHint')}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {VALIDATOR_PERSONAS.map((p, i) => {
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
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold leading-tight">{p.displayName}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                          {p.gateLabel}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                        {p.role}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t('validator.login.switchApp')}
              </p>
              <AppSwitcher current="validator" variant="inline" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
