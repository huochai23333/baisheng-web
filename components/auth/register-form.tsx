"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { FeedbackNotice } from "@/components/ui/feedback-notice";
import { RegisterStepBusiness } from "./register-step-business";
import { RegisterStepInvite } from "./register-step-invite";
import { RegisterStepPassword } from "./register-step-password";
import { RegisterStepProfile } from "./register-step-profile";
import { RegisterWizardProgress } from "./register-wizard-progress";
import { useRegisterWizard } from "./use-register-wizard";

type RegisterFormProps = {
  initialInviteCode?: string | null;
};

export function RegisterForm({ initialInviteCode = null }: RegisterFormProps) {
  const wizard = useRegisterWizard(initialInviteCode);
  const reduceMotion = useReducedMotion();

  return (
    <form className="min-w-0" onSubmit={wizard.handleSubmit}>
      <RegisterWizardProgress step={wizard.step} />

      {wizard.error ? (
        <div className="mb-5">
          <FeedbackNotice density="compact" tone="error">
            {wizard.error}
          </FeedbackNotice>
        </div>
      ) : null}

      <motion.div layout={!reduceMotion}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: reduceMotion ? 0 : wizard.direction > 0 ? -22 : 22,
            }}
            initial={{
              opacity: 0,
              x: reduceMotion ? 0 : wizard.direction > 0 ? 22 : -22,
            }}
            key={wizard.step}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
          >
            {wizard.step === 1 ? (
              <RegisterStepInvite
                inviteCode={wizard.state.inviteCode}
                onInviteCodeChange={wizard.setInviteCode}
                onNext={wizard.handleInviteNext}
                pending={wizard.checkingInvite}
              />
            ) : null}

            {wizard.step === 2 ? (
              <RegisterStepBusiness
                business={wizard.state.business}
                locked={wizard.inviteContext.locksBusiness}
                onBack={wizard.toPreviousStep}
                onBusinessChange={wizard.setBusiness}
                onNext={wizard.handleBusinessNext}
              />
            ) : null}

            {wizard.step === 3 ? (
              <RegisterStepProfile
                country={wizard.state.country}
                email={wizard.state.email}
                name={wizard.state.name}
                onBack={wizard.toPreviousStep}
                onCountryChange={wizard.setCountry}
                onEmailChange={wizard.setEmail}
                onNameChange={wizard.setName}
                onNext={wizard.handleProfileNext}
                onPhoneChange={wizard.setPhoneNational}
                phone={wizard.state.phoneNational}
              />
            ) : null}

            {wizard.step === 4 ? (
              <RegisterStepPassword
                acceptedTerms={wizard.state.acceptedTerms}
                hint={wizard.passwordHint}
                hintTone={wizard.passwordHintTone}
                onAcceptedTermsChange={wizard.setTermsAccepted}
                onBack={wizard.toPreviousStep}
                onPasswordChange={wizard.setPassword}
                password={wizard.state.password}
                submitting={wizard.submitting}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </form>
  );
}
