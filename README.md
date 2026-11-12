# Remove-BG (ClearCut)

Free in-browser background remover, image compressor and image upscaler.

## Login / Sign up (Firebase)

Users can try every tool without an account. To **download** a result they must log in
or sign up (Email/Password or Google). Auth code lives in [`auth.js`](auth.js).

### Setup (one time, ~5 minutes)

1. Open <https://console.firebase.google.com> and click **Add project** (Google Analytics is optional).
2. In the project, click the **Web** icon (`</>`) to add a web app. Copy the `firebaseConfig` it shows.
3. Paste those values into the `firebaseConfig` object at the top of `auth.js`
   (`apiKey`, `authDomain`, `projectId`, `appId`). These values are public by design; this is safe to commit.
4. Go to **Build → Authentication → Get started → Sign-in method** and enable:
   - **Email/Password**
   - **Google** (choose a support email)
5. Go to **Authentication → Settings → Authorized domains** and add your site's domain,
   e.g. `shahzaibarshad8688-art.github.io` (`localhost` is already there for testing).
6. Commit and push. Done: users now appear under **Authentication → Users**.

Until step 3 is done the site keeps working normally and downloads stay open (login is skipped).

### Features

- Sign up with name, email and password
- Log in with email/password or **Continue with Google**
- Forgot password (reset email)
- Stays logged in across visits; avatar/name and **Log Out** in the navbar
- After logging in from the download prompt, the download starts automatically
