import { OnboardingForm } from "./onboarding-form";
import { onboardingDraftKey } from "@/lib/onboarding-draft";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Step 1 of 2</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">Set up your business</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Answer the minimum we need to create your first personalised deadline list. Use “not sure”
          whenever you need to come back later.
        </p>
      </div>
      <OnboardingForm draftStorageKey={onboardingDraftKey(user.id)} />
    </div>
  );
}
