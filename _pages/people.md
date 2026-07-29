---
layout: page
permalink: /people/
title: People
description: The HyScale Lab principal investigator and active research team.
nav: true
nav_order: 3
---

Professor Dmitrii Ustiugov leads the HyScale Lab as PI / Supervisor. Former members and their destinations are listed on the [Alumni page]({{ '/alumni/' | relative_url }}).

## PI / Supervisor

{% assign pi = site.data.people.pi %}

### {% if pi.url %}<a href="{{ pi.url | relative_url }}">{{ pi.name }}</a>{% else %}{{ pi.name }}{% endif %}

**{{ pi.role }}**{% if pi.affiliation %} · {{ pi.affiliation }}{% endif %}

## Active members

{% if site.data.people.active.postdocs.size > 0 %}

### Postdocs

{% for person in site.data.people.active.postdocs %}

- **{% if person.url %}<a href="{{ person.url }}">{{ person.name }}</a>{% else %}{{ person.name }}{% endif %}** — {{ person.role }}{% if person.affiliation %}, {{ person.affiliation }}{% endif %}{% if person.period %}; {{ person.period }}{% endif %}{% if person.notes %}. {{ person.notes }}{% endif %}
  {% endfor %}
  {% endif %}

{% if site.data.people.active.phd_students.size > 0 %}

### PhD Students

{% for person in site.data.people.active.phd_students %}

- **{% if person.url %}<a href="{{ person.url }}">{{ person.name }}</a>{% else %}{{ person.name }}{% endif %}** — {{ person.role }}{% if person.affiliation %}, {{ person.affiliation }}{% endif %}{% if person.period %}; {{ person.period }}{% endif %}{% if person.notes %}. {{ person.notes }}{% endif %}
  {% endfor %}
  {% endif %}

{% if site.data.people.active.ms_students.size > 0 %}

### MS Students

{% for person in site.data.people.active.ms_students %}

- **{% if person.url %}<a href="{{ person.url }}">{{ person.name }}</a>{% else %}{{ person.name }}{% endif %}** — {{ person.role }}{% if person.affiliation %}, {{ person.affiliation }}{% endif %}{% if person.period %}; {{ person.period }}{% endif %}{% if person.notes %}. {{ person.notes }}{% endif %}
  {% endfor %}
  {% endif %}

{% if site.data.people.active.research_assistants_interns.size > 0 %}

### Research Assistants / Interns

{% for person in site.data.people.active.research_assistants_interns %}

- **{% if person.url %}<a href="{{ person.url }}">{{ person.name }}</a>{% else %}{{ person.name }}{% endif %}** — {{ person.role }}{% if person.affiliation %}, {{ person.affiliation }}{% endif %}{% if person.period %}; {{ person.period }}{% endif %}{% if person.notes %}. {{ person.notes }}{% endif %}
  {% endfor %}
  {% endif %}
