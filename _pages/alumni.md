---
layout: page
permalink: /alumni/
title: Alumni
description: Former HyScale Lab members, students, and supervised researchers.
nav: false
---

This page preserves the published record of former lab members and supervised research projects. Return to the [active People page]({{ '/people/' | relative_url }}).

{% if site.data.people.alumni.postdocs.size > 0 %}

## Former Postdocs

{% for person in site.data.people.alumni.postdocs %}

- **{% if person.url %}<a href="{{ person.url }}">{{ person.name }}</a>{% else %}{{ person.name }}{% endif %}** — {{ person.role }}{% if person.affiliation %}, {{ person.affiliation }}{% endif %}{% if person.period %}; {{ person.period }}{% endif %}{% if person.destination %}. Destination: {{ person.destination }}{% endif %}{% if person.notes %}. {{ person.notes }}{% endif %}
  {% endfor %}
  {% endif %}

{% if site.data.people.alumni.phd_students.size > 0 %}

## Former PhD Students

{% for person in site.data.people.alumni.phd_students %}

- **{% if person.url %}<a href="{{ person.url }}">{{ person.name }}</a>{% else %}{{ person.name }}{% endif %}** — {{ person.role }}{% if person.affiliation %}, {{ person.affiliation }}{% endif %}{% if person.period %}; {{ person.period }}{% endif %}{% if person.destination %}. Destination: {{ person.destination }}{% endif %}{% if person.notes %}. {{ person.notes }}{% endif %}
  {% endfor %}
  {% endif %}

{% if site.data.people.alumni.ms_students.size > 0 %}

## Former MS Students

{% for person in site.data.people.alumni.ms_students %}

- **{% if person.url %}<a href="{{ person.url }}">{{ person.name }}</a>{% else %}{{ person.name }}{% endif %}** — {{ person.role }}{% if person.affiliation %}, {{ person.affiliation }}{% endif %}{% if person.period %}; {{ person.period }}{% endif %}{% if person.destination %}. Destination: {{ person.destination }}{% endif %}{% if person.notes %}. {{ person.notes }}{% endif %}
  {% endfor %}
  {% endif %}

{% if site.data.people.alumni.research_assistants_interns.size > 0 %}

## Former Research Assistants / Interns

{% for person in site.data.people.alumni.research_assistants_interns %}

- **{% if person.url %}<a href="{{ person.url }}">{{ person.name }}</a>{% else %}{{ person.name }}{% endif %}** — {{ person.role }}{% if person.affiliation %}, {{ person.affiliation }}{% endif %}{% if person.period %}; {{ person.period }}{% endif %}{% if person.destination %}. Destination: {{ person.destination }}{% endif %}{% if person.notes %}. {{ person.notes }}{% endif %}
  {% endfor %}
  {% endif %}
