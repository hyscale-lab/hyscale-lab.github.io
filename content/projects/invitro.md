---
title: InVitro
tagline: Load generator and trace sampler for serverless computing
pillar: serverless
order: 2
repo: vhive-serverless/invitro
docs: https://github.com/vhive-serverless/invitro/tree/main/docs
license: MIT
papers: [ustiugov2023invitro, kondrashov2025highcostkeepingwarm]
---

InVitro is a set of tools for analyzing the performance of serverless cluster deployments. It has two parts:

- **Sampler** creates representative workload summaries (samples of functions) from production traces.
- **Loader** reconstructs the invocation traffic of a trace and steers it to the functions deployed in the serverless cluster under study.

InVitro supports [vHive](/research/serverless/vhive/) and [OpenWhisk](https://openwhisk.apache.org/), and ships reference traces sampled from the Azure Functions production traces.

## Supported traces

- [Azure 2019](https://github.com/Azure/AzurePublicDataset/blob/master/AzureFunctionsDataset2019.md)
- [Azure 2021](https://github.com/Azure/AzurePublicDataset/blob/master/AzureFunctionsInvocationTrace2021.md)
- [Huawei 2023](https://github.com/sir-lab/data-release/blob/main/README_data_release_2023.md)
- [IBM 2026](https://github.com/ubc-cirrus-lab/ibm-cloud-code-engine-traces)
