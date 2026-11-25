/**
 * Minimal DOM shaped like alternativeto.net/manage-item/ after sign-in (Nov 2026).
 * Live HTML is behind Cloudflare — update when production markup changes.
 */
export function mountAlternativetoManageItemForm(): void {
	document.body.innerHTML = `
		<main id="alternativeto-manage-item">
			<section aria-labelledby="card-main-info">
				<h2 id="card-main-info">Main info</h2>
				<label for="a2-application-name">Name</label>
				<input id="a2-application-name" name="product_name" aria-label="Application name" placeholder="Product name" />
				<label for="a2-short-description">Short Description</label>
				<textarea
					id="a2-short-description"
					name="shortDescription"
					aria-label="Short Description"
				></textarea>
				<p class="a2-short-help">
					What is the main purpose of this app / software? Keep it short, preferably in one concise sentence.
				</p>
				<label>Website</label>
				<input type="url" name="websiteUrl" aria-label="Website" placeholder="https://" />
				<label for="a2-full-description">Full Description</label>
				<textarea
					id="a2-full-description"
					name="description"
					aria-label="Full Description"
					rows="8"
				></textarea>
				<p class="a2-full-help">
					A longer description of the application; this could be written by yourself or taken from official
					material.
				</p>
				<div class="ProseMirror tiptap" contenteditable="true" aria-label="Full description editor"></div>
			</section>
			<section aria-labelledby="card-tags">
				<h2 id="card-tags">Tags</h2>
				<input role="combobox" name="tagsInput" placeholder="Add tags" aria-label="Tags" />
			</section>
			<section aria-labelledby="card-platforms">
				<h2 id="card-platforms">Platforms</h2>
				<fieldset>
					<label><input type="checkbox" name="platform_Online" /> Online</label>
					<label><input type="checkbox" name="platform_SaaS" /> SaaS</label>
					<label><input type="checkbox" name="platform_Windows" /> Windows</label>
				</fieldset>
			</section>
			<section aria-labelledby="card-author">
				<h2 id="card-author">Company / Author</h2>
				<label for="a2-company-author">Company / Author</label>
				<input id="a2-company-author" name="company_name" aria-label="Company / Author" />
				<label for="a2-product-twitter">X (Twitter)</label>
				<input id="a2-product-twitter" name="productTwitter" aria-label="Twitter on product form" />
			</section>
			<section aria-labelledby="card-pricing">
				<h2 id="card-pricing">Pricing / license</h2>
				<label><input type="radio" name="license" value="free" /> Free</label>
				<label><input type="radio" name="license" value="freemium" /> Freemium</label>
				<label><input type="radio" name="license" value="commercial" /> Commercial</label>
				<label><input type="checkbox" name="openSource" aria-label="Open source" /> Open source</label>
			</section>
			<section aria-labelledby="card-icon-screenshots" class="icon-screenshots-card">
				<h2 id="card-icon-screenshots">Icon &amp; Screenshots</h2>
				<div class="icon-block">
					<label>Application icon</label>
					<p>Application Icon &bull; Required</p>
					<div class="dropzone" role="button">Drag an icon here or click to select</div>
					<input type="file" name="applicationIcon" accept="image/jpeg,image/png" class="sr-only" />
					<p>Upload icon by URL</p>
					<input
						type="url"
						name="iconRemoteUrl"
						placeholder="https://"
						aria-label="Upload icon by URL"
					/>
					<p>Or you can just paste a URL and it will be uploaded automatically.</p>
				</div>
				<h3>Screenshots</h3>
				<div class="screenshot-block">
					<div class="dropzone" role="button">Drag screenshots here, or click to upload screenshots</div>
					<input type="file" name="screenshots" accept="image/jpeg,image/png,image/webp" multiple class="sr-only" />
					<p>Upload screenshot by URL</p>
					<input
						type="url"
						name="screenshotRemoteUrl"
						placeholder="https://"
						aria-label="Upload screenshot by URL"
					/>
				</div>
			</section>
			<section aria-labelledby="card-videos" class="videos-block">
				<h2 id="card-videos">Videos</h2>
				<label for="a2-video-url">Add a new video URL</label>
				<input
					id="a2-video-url"
					type="url"
					name="videoUrl"
					placeholder="https://www.youtube.com/watch?v="
					aria-label="Add a new video URL"
				/>
				<p>We only support YouTube right now. Just paste the URL above and the video will be added.</p>
			</section>
		</main>
	`;
}