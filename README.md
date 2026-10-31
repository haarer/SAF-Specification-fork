# SAF Specification Source
If you would like to read the System Architecture Framework (SAF) documentation, please visit [saf.gfse.org](https://saf.gfse.org)

We have changed the way the documentation is generated and github is now the source repository for an automatic document generation process. 

The main branch of this repository reflects the current state of development and will be updated as needed. 
Release branches are also available, selectable at the documentation site at [saf.gfse.org](https://saf.gfse.org).

The earlier SAF releases are still available in the legacy documentation format in separate branches.

## Publishing your fork on GitHub Pages

This repository doubles as the starting point for the SAF extension mechanism exercise: fork it, extend the specification with your own domains/aspects/viewpoints, and publish the result on your own account.

1. **Fork** this repository. Forks keep the repository name (`SAF-Specification-fork`), so the site paths work out of the box — no configuration needed.
2. In your fork, open **Settings → Pages → Build and deployment** and set **Source** to *Deploy from a branch* with branch **`gh-pages`**, path **(root)**.
3. Push your changes to `main` (or run the *Deploy Jekyll site to Pages* workflow manually). The workflow builds the Jekyll site with the correct `baseurl` and deploys it to the `gh-pages` branch.
4. Your site is then live at `https://<your-username>.github.io/SAF-Specification-fork/`.

The site detects at build time that it is being built outside the canonical `GfSE/SAF-Specification` repository (see `canonical_repository` in `_config.yml`) and automatically shows a fork notice on the landing page and in the site footer. The same mechanism makes the notice disappear automatically once your extensions are merged into the upstream specification.

Branches other than `main` are deployed as version previews under `/version/<branch>/` of your site (only branches listed in `on: push` of the workflow trigger a deployment).
