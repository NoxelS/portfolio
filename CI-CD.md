# CI/CD and image promotion

The application is built with GitHub Actions and deployed by Flux from the
separate Kubernetes infrastructure repository.

## Images

The image is published to:

```text
ghcr.io/noxels/portfolio-frontend
```

Pushes to `main` publish:

- `<base-version>-staging.<run-number>`: immutable staging build version
- `sha-<commit>`: immutable commit reference
- `frontend-staging`: moving staging convenience tag

Pushes to `production` publish:

- `<version>` and `v<version>`: immutable production release tags
- `sha-<commit>`: immutable commit reference

Kubernetes manifests should use a digest-pinned immutable reference. Flux may
use an image policy to discover a candidate, but should write the selected
digest into the infrastructure repository. The mutable `frontend-staging` tag
must not be used as the final production reference.

## Promotion flow

1. Pull requests to `main` or `production` run frontend installation, audit,
   Astro build, and bundle-size validation.
2. Pushes to `main` run the same verification job, then build and publish the
   staging image only after verification succeeds.
3. The **Promote to production** workflow is started manually from GitHub.
4. It creates a versioned release branch and a pull request into `production`.
5. Merging that pull request runs verification, then builds the production
   image and creates a GitHub release only after verification succeeds.
6. Flux detects the new image and updates the appropriate deployment through
   the infrastructure repository.

The **CI** workflow coordinates verification and publishing. The image workflows
are reusable workflows called by CI for the matching push branch; pull requests
only run verification. An audit or build failure prevents image publication.
Staging versions use the CI workflow's run number. New staging pushes cancel
older runs, while production runs are allowed to finish.

The promotion workflow uses the highest existing `vX.Y.Z` tag and increments
the patch version. The initial repository version is currently `0.0.1`; the
first promotion therefore produces `0.0.2`. Major/minor release policy can be
introduced later by changing that workflow or by adopting a conventional
commit release tool.

## Required Flux-side setup

The infrastructure repository must provide separate staging and production
`ImageRepository`/`ImagePolicy` resources and, if desired,
`ImageUpdateAutomation` resources. Staging policies should select only
`*-staging.*` tags. Production policies should select only stable SemVer tags
and exclude staging and prerelease tags. GHCR pull credentials must also be
available to the cluster when the package is private.

The `production` branch should be protected so that production images can only
be created through the reviewed promotion PR.
