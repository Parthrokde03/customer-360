# Native Customer 360

Run `npm install`, then `npx expo start` inside this directory. Android emulator API address: `http://10.0.2.2:5175`. Run the root application's `npm run worker:local` first. In the signed-in web application's Administration page, create a device key and enter it in the native app. Keys expire after 30 days and can be revoked. They are stored using Expo SecureStore; raw keys are not stored in the server database.

Features: customer history and brief, feedback capture, keyboard dictation, assigned-action updates, closure confirmation, PDF/image evidence picker, current alerts and opt-in device due-date reminders. Refresh local reminders after due dates change. Disconnect cancels device reminders and clears credentials. Server permissions apply to every request. Network access is required.

Verification: `npx tsc --noEmit`; `npx expo export --platform android --output-dir dist`.

This source and Android bundle are available locally. An installable Android APK and physical-device tests are not yet verified. iOS packaging requires macOS. No app-store submission or deployment has been performed.
