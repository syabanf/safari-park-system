import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints, queryKeys } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tsi/ui';
import { useNavigate } from 'react-router-dom';

export function RenewalRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const renewMutation = useMutation({
    mutationFn: () => endpoints.renewPass(api),
    onSuccess() {
      qc.invalidateQueries({ queryKey: queryKeys.pass.mine() });
      navigate('/home');
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('member.renewal.title')}</CardTitle>
        <CardDescription>{t('member.renewal.summary')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          size="lg"
          disabled={renewMutation.isPending}
          onClick={() => renewMutation.mutate()}
        >
          {renewMutation.isPending ? t('common.loading') : t('member.renewal.cta')}
        </Button>
      </CardContent>
    </Card>
  );
}
