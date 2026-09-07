import { GoogleLogin } from "@react-oauth/google";
import { useAppDispatch } from "../../app/hooks";
import { googleLogin } from "../../features/auth/authSlice";

interface GoogleSignInButtonProps {
  onError?: (message: string) => void;
}

export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex justify-center [&>div]:w-full [&_iframe]:!w-full">
      <GoogleLogin
        theme="filled_black"
        size="large"
        shape="rectangular"
        text="continue_with"
        width="100%"
        onSuccess={(response) => {
          if (response.credential) {
            dispatch(googleLogin(response.credential));
          } else {
            onError?.("Google did not return a credential");
          }
        }}
        onError={() => onError?.("Google sign-in was cancelled or failed")}
      />
    </div>
  );
}
