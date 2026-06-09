import { useTranslation } from '@tsi/i18n';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tsi/ui';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const stepCount = 3;

export function EnrolmentRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const stepLabel =
    step === 1
      ? t('member.enrolment.step1')
      : step === 2
        ? t('member.enrolment.step2')
        : t('member.enrolment.step3');

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <Card>
        <CardHeader>
          <CardDescription>
            Step {step} / {stepCount}
          </CardDescription>
          <CardTitle>{stepLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('member.enrolment.title')} — placeholder form for step {step}.
          </p>
          <div className="flex justify-between gap-3">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                {t('member.enrolment.back')}
              </Button>
            ) : (
              <Link to="/login" className="text-sm underline">
                {t('actions.cancel')}
              </Link>
            )}
            {step < stepCount ? (
              <Button onClick={() => setStep(step + 1)}>{t('member.enrolment.next')}</Button>
            ) : (
              <Button onClick={() => navigate('/login')}>{t('member.enrolment.submit')}</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
