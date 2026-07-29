---
layout: page
title: Cloud and Serverless with vHive
description: Full-stack research on fast, isolated, and resource-efficient serverless clouds.
category: research
importance: 1
img: assets/img/vhive-header.jpg
related_publications: true
research_status: current
research_pillar: Serverless cloud systems
---

Cloud platforms must combine extreme multi-tenancy with strong isolation while preserving performance, cost efficiency, and security. This research direction explores those trade-offs across the distributed hardware/software stack.

[vHive](https://vhive-serverless.github.io/) is a full-stack open-source framework and ecosystem for representative serverless experimentation. It integrates production-grade components including [AWS Firecracker](https://firecracker-microvm.github.io/), [containerd](https://containerd.io/), and [Kubernetes](https://kubernetes.io/). At the time of the source site, it was used for research and teaching at 30+ universities and supported or sponsored by 8 companies.

Resources include the [vHive GitHub organization](https://github.com/vhive-serverless), [SOSP 2023 tutorial slides](https://drive.google.com/drive/folders/1UOFjHjxILq2m3MX9QpDf5EAXLWVpEJVF?usp=sharing), and the [ASPLOS 2022 tutorial videos](https://www.youtube.com/playlist?list=PLs4cWWn5uKac0A_quPr2jzsOMzaySI_w8). Related current work covers data-intensive workflows, in-vitro serverless research, lukewarm functions, tail latency, and function snapshots {% cite jesalpura2025shattering ustiugov2023invitro schall2022lukewarm ustiugov2021stellar ustiugov2021snapshots %}.
