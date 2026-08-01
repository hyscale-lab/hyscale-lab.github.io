---
layout: page
title: Projects
permalink: /projects/
description: HyScale Lab research across serverless, agentic, and multi-modal and embodied AI cloud systems.
nav: true
nav_order: 2
horizontal: true
research_pillars:
  - Serverless cloud systems
  - Agentic cloud systems
  - Multi-modal and Embodied AI cloud systems
---

HyScale develops cloud systems through three research pillars. Our open-source systems include [vHive](https://vhive-serverless.github.io/), a full-stack environment for serverless research. Alongside this work, we study efficiency foundations for emerging agentic workloads and the cloud infrastructure needed by multi-modal and embodied AI.

<div class="projects">

{% for pillar in page.research_pillars %}

  <h2>{{ pillar }}</h2>
  {% assign pillar_projects = site.projects | where: "research_status", "current" | where: "research_pillar", pillar | sort: "importance" %}
  {% if pillar_projects.size > 0 %}
    <div class="row row-cols-1">
      {% for project in pillar_projects %}
        {% include projects_horizontal.liquid %}
      {% endfor %}
    </div>
  {% else %}
    <p>This is an active research focus for the lab; no current projects are listed in this pillar yet.</p>
  {% endif %}
{% endfor %}

</div>
