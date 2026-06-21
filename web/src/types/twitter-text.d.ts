declare module 'twitter-text' {
	type ParseTweetResult = {
		weightedLength: number;
		valid: boolean;
		permillage?: number;
	};

	const twitterText: {
		parseTweet(text: string, options?: Record<string, unknown>): ParseTweetResult;
		getTweetLength(text: string, options?: Record<string, unknown>): number;
	};

	export default twitterText;
}
