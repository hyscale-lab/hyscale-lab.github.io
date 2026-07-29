---
layout: page
title: Projects
permalink: /projects/
description: Current HyScale Lab research pillars and the lab's historical research archive.
nav: true
nav_order: 2
horizontal: false
research_pillars:
  - Serverless cloud systems
  - Agentic cloud systems
  - Multi-modal and Embodied AI cloud systems
---

<div class="projects">

{% for pillar in page.research_pillars %}

  <h2>{{ pillar }}</h2>
  {% assign pillar_projects = site.projects | where: "research_status", "current" | where: "research_pillar", pillar | sort: "importance" %}
  {% if pillar_projects.size > 0 %}
    <div class="row row-cols-1 row-cols-md-3">
      {% for project in pillar_projects %}
        {% include projects.liquid %}
      {% endfor %}
    </div>
  {% else %}
    <p>This is an active research focus for the lab; no current projects are listed in this pillar yet.</p>
  {% endif %}
{% endfor %}

<h2>Historical research / Archive</h2>
{% assign archive_projects = site.projects | where: "research_status", "archive" | sort: "importance" %}
{% if archive_projects.size > 0 %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in archive_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
{% else %}
  <p>No archived projects are listed.</p>
{% endif %}

</div>
