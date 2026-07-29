---
layout: page
permalink: /publications/
title: Publications
description: Current HyScale Lab research publications and the lab's historical research archive.
nav: true
nav_order: 1
---

{% include bib_search.liquid %}

<div class="publications">

<h2>Serverless cloud systems</h2>

{% capture serverless_publications %}{% bibliography --query @*[research_bucket=current-serverless] %}{% endcapture %}
{% assign serverless_publications = serverless_publications | strip %}
{% if serverless_publications != empty %}
{{ serverless_publications }}
{% else %}

  <p>This is an active research focus for the lab; no current publications are listed in this pillar yet.</p>
{% endif %}

<h2>Agentic cloud systems</h2>

{% capture agentic_publications %}{% bibliography --query @*[research_bucket=current-agentic] %}{% endcapture %}
{% assign agentic_publications = agentic_publications | strip %}
{% if agentic_publications != empty %}
{{ agentic_publications }}
{% else %}

  <p>This is an active research focus for the lab; no current publications are listed in this pillar yet.</p>
{% endif %}

<h2>Multi-modal and Embodied AI cloud systems</h2>

{% capture embodied_publications %}{% bibliography --query @*[research_bucket=current-embodied] %}{% endcapture %}
{% assign embodied_publications = embodied_publications | strip %}
{% if embodied_publications != empty %}
{{ embodied_publications }}
{% else %}

  <p>This is an active research focus for the lab; no current publications are listed in this pillar yet.</p>
{% endif %}

<h2>Historical research / Archive</h2>

{% capture archive_publications %}{% bibliography --query @*[research_bucket=archive] %}{% endcapture %}
{% assign archive_publications = archive_publications | strip %}
{% if archive_publications != empty %}
{{ archive_publications }}
{% else %}

  <p>No archived publications are listed.</p>
{% endif %}

</div>
