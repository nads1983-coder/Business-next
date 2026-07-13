import { OnboardingForm } from "./onboarding-form";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Set up your business</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Answer simple questions and we will build your first task list.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
