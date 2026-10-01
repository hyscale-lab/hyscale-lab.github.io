---
title: ARIES
tagline: Agent Runtime & Infrastructure Experimentation System
# Landing page slide (content/home.yaml → open_source).
highlight: 'ARIES: an experimentation framework for agent serving systems'
summary: >-
  Run reproducible agent benchmarks while observing the full trajectory: model calls, harness decisions, stateful tool execution and resource telemetry. Ships with a production trace from Ant Group.
pillar: agentic
order: 1
repo: hyscale-lab/ARIES
docs: https://github.com/hyscale-lab/ARIES/blob/main/docs/quick-start.md
license: MIT (code), CC-BY-4.0 (trace)
image: images/aries-architecture.png
imageAlt: ARIES architecture diagram
maintainers: [jooyoung-park, leonid-kondrashov, chengzhi-lu]
papers: [kondrashov2026rethinkingaicloudinfrastructure]
---

ARIES is an open-source experimentation framework for agent serving systems. It lets systems researchers run reproducible agent benchmarks while observing the full task trajectory: repeated model calls, harness decisions, stateful tool execution, task outcome, and resource telemetry.

Agent workloads are not isolated LLM requests. An agent repeatedly observes its state, invokes a model, executes tools in a sandbox, and incorporates the results into the next step. ARIES treats that end-to-end trajectory as the unit of experimentation, so researchers can relate task progress and correctness to behavior across the agent-serving stack.

## Why ARIES

- **Preserve task semantics across configurations.** Benchmark tasks and their evaluation stay separate from the chosen harness, model backend, tool bridge, sandbox and telemetry setup.
- **Observe complete agent trajectories.** Run artifacts and correlated evidence show where an agent spends time and how execution behavior relates to the final outcome.
- **Make stateful tool execution comparable.** A narrow bridge gives the harness temporary access to a persistent task environment, while sandbox adapters keep control of lifecycle, isolation and resource observation.
- **Ground systems research in production behavior.** ARIES ships the Ant Group Agentic LLM Trace 2026, with engine request logs and harness-environment metrics from a real online serving workload.

## What it supports today

| Role          | Implementation                                                      |
| ------------- | ------------------------------------------------------------------- |
| Agent harness | OpenClaw (text and realtime voice), Hermes (text)                   |
| Benchmark     | Terminal-Bench 2, Deep Research Bench, SWE-bench Pro (public split) |
| Tool sandbox  | Docker                                                              |
| Model service | DeepSeek, OpenAI-compatible servers such as vLLM, SGLang            |

ARIES is built and maintained in collaboration with Amazon Web Services, Microsoft, AMD Singapore, Ant Group and NCSpeech. See the [roadmap](https://github.com/orgs/hyscale-lab/projects/7).
