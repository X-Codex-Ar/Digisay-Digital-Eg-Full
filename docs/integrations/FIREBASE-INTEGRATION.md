# Firebase integration

The public React app initializes the supplied Firebase web app and sends page-view events to Firebase Analytics when the browser supports analytics. This web configuration is public client configuration; restrict its API key and configure Firebase security rules before enabling data services. No Firestore, Firebase Auth, FCM, or Firebase Admin integration is enabled. Keep Admin credentials server-side if a future workflow requires them; SQL Server remains the authority for business data.
