import { SignIn } from "@clerk/clerk-react";

function Connect() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <SignIn />
    </div>
  );
}

export default Connect;
