---
title: vHive
tagline: Open-source framework for serverless experimentation
# Landing page slide (content/home.yaml → open_source).
highlight: 'vHive: the serverless research platform used by 30+ universities'
summary: >-
  Our full-stack open-source environment for representative serverless experimentation, built on AWS Firecracker, containerd and Kubernetes. Its ASPLOS 2021 paper received the Distinguished Artifact Award.
pillar: serverless
order: 1
repo: vhive-serverless/vHive
website: https://vhive-serverless.github.io/
docs: https://github.com/vhive-serverless/vHive/blob/main/docs/quickstart_guide.md
license: MIT
logo: images/vhive-header.jpg
image: images/vhive-architecture.jpg
imageAlt: vHive architecture diagram
maintainers: [dmitrii-ustiugov, leonid-kondrashov]
papers: [ustiugov2021snapshots, ustiugov2021stellar, schall2022lukewarm, ustiugov2023invitro, jesalpura2025shattering]
---

vHive aims to enable serverless systems researchers to innovate across the deep and distributed software stacks of a modern serverless platform. It is representative of the leading Function-as-a-Service (FaaS) providers and integrates the same production-grade components they use, including the [AWS Firecracker](https://firecracker-microvm.github.io/) hypervisor, [containerd](https://containerd.io/) and [Kubernetes](https://kubernetes.io/).

vHive adopts the [Knative](https://knative.dev/) programming model, so researchers can deploy and experiment with any serverless application, running functions in secure Firecracker microVMs alongside stateful services. It supports Firecracker microVMs, gVisor and plain containerd containers as function sandboxes, and lets researchers innovate on key serverless features such as autoscaling and cold-start optimization with several snapshotting mechanisms.

At the time of writing, vHive has been used for research and teaching at 30+ universities and supported or sponsored by 8 companies. It is maintained by HyScale Lab at NTU together with the EASE lab at the University of Edinburgh. The architecture is described in our ASPLOS 2021 paper, whose artifact received the Distinguished Artifact Award.

## Resources

- [Quick-start guide](https://github.com/vhive-serverless/vHive/blob/main/docs/quickstart_guide.md)
- [SOSP 2023 tutorial slides](https://drive.google.com/drive/folders/1UOFjHjxILq2m3MX9QpDf5EAXLWVpEJVF?usp=sharing)
- [ASPLOS 2022 tutorial videos](https://www.youtube.com/playlist?list=PLs4cWWn5uKac0A_quPr2jzsOMzaySI_w8)
- [Serverless and vHive tutorial series](https://www.youtube.com/playlist?list=PLVdxPJaekjWqBsEUwnrYRQCaMqvcDVsBE)
- [Slack community](https://join.slack.com/t/vhivetutorials/shared_invite/zt-1fk4v71gn-nV5oev5sc9F4fePg3_OZMQ)
