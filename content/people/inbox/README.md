# People inbox

Lab members: drop your photo and links here; a maintainer moves them into the site.
Nothing in this folder is published until then.

1. **Photo:** `<your-id>.jpg` (or `.png`), square, at least 400×400 px, face centred.
   `<your-id>` is your name in lowercase-kebab-case, e.g. `jane-doe`.
2. **Links:** copy `TEMPLATE.md` to `<your-id>.md` and fill it in. Leave out lines you don't need.
3. Commit and push (or open a PR):

   ```bash
   git add content/people/inbox/jane-doe.*
   git commit -m "People inbox: Jane Doe"
   git push
   ```

Maintainers: copy the photo to `content/people/photos/<id>.jpg`, add the links to that person's
entry in `content/people.yaml`, then delete both files from this folder.
