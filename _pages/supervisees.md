---
layout: page
permalink: /people/supervisees/
title: Supervisees
description: Historical supervised and co-supervised student projects.
nav: false
---

The entries below document supervised or co-supervised student projects.

<ul>
  {% for person in site.data.supervisees %}
    {% assign person_url = person.url | default: '' | strip %}
    {% assign person_role = person.role | default: '' | strip %}
    {% assign person_affiliation = person.affiliation | default: '' | strip %}
    {% assign person_period = person.period | default: '' | strip %}
    {% assign person_notes = person.notes | default: '' | strip %}
    <li>
      <strong>{% if person_url != empty %}<a href="{{ person_url | escape }}">{{ person.name | escape }}</a>{% else %}{{ person.name | escape }}{% endif %}</strong>
      {% assign has_details = false %}
      {% if person_role != empty %} — {{ person_role | escape }}{% assign has_details = true %}{% endif %}
      {% if person_affiliation != empty %}{% if has_details %}, {% else %} — {% endif %}{{ person_affiliation | escape }}{% assign has_details = true %}{% endif %}
      {% if person_period != empty %}{% if has_details %}; {% else %} — {% endif %}{{ person_period | escape }}{% assign has_details = true %}{% endif %}
      {% if person_notes != empty %}{% if has_details %}. {% else %} — {% endif %}{{ person_notes | escape }}{% endif %}
    </li>
  {% endfor %}
</ul>
