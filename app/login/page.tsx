import { Suspense } from "react";
import Login from "./login";
import { Loader2 } from "lucide-react";


function LoginPage() {
  return (
    <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}>
      <Login />
    </Suspense>
  );
}

export default LoginPage;
