export default {
	providers: [
		{
			// The domain should be your Clerk instance domain without https://
			// For example: "amazing-app-123.clerk.accounts.dev"
			domain:
				process.env.CLERK_JWT_ISSUER_DOMAIN ||
				process.env.CLERK_ISSUER_URL?.replace('https://', '') ||
				process.env.CLERK_FRONTEND_API?.replace('https://', ''),
			applicationID: 'convex'
		}
	]
};
